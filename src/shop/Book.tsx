import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { findSlots } from "../lib/availability";
import { BOOKABLE, serviceById, SERVICES, staffById, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { Key, useLang } from "../lib/i18n";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "./ShopFrame";

const STEPS: Key[] = ["book.s0", "book.s1", "book.s2", "book.s3"];

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(`${TODAY}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function Book() {
  const { t, s, locale, lang } = useLang();
  const sep = lang === "ar" ? "، " : ", ";
  const f = useFormat(locale);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { bookings, addBooking, addClient, addWaitlist } = useStore();
  const step = Number(params.get("step") ?? 0);
  const [serviceIds, setServiceIds] = useState<string[]>(params.get("service") ? [params.get("service")!] : []);
  const [staffId, setStaffId] = useState(params.get("staff") ?? "");
  const [date, setDate] = useState(TODAY);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [extra, setExtra] = useState<{ name: string; serviceId: string } | null>(null);
  const [waitForm, setWaitForm] = useState(false);
  const [waitDone, setWaitDone] = useState<string | null>(null);

  const go = (n: number) => {
    const next = new URLSearchParams(params);
    next.set("step", String(n));
    setParams(next);
  };

  const eligible = BOOKABLE.filter((b) => serviceIds.every((id) => b.services.includes(id)));
  const slots = serviceIds.length ? findSlots({ date, serviceIds, staffId: staffId || undefined, bookings }) : [];
  const chosen = slots.find((x) => `${x.start}|${x.staffId}` === slot);
  const total = serviceIds.reduce((sum, id) => sum + serviceById(id).priceMinor, 0);
  const minutes = serviceIds.reduce((sum, id) => sum + serviceById(id).minutes, 0);
  const deposit = serviceIds.some((id) => serviceById(id).deposit) ? Math.round(total * 0.25) : 0;
  const serviceNames = serviceIds.map((id) => s(serviceById(id).name)).join(sep);

  function checkContact() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("book.errName");
    if (phone.replace(/\D/g, "").length < 8) errs.phone = t("book.errPhone");
    return errs;
  }

  function confirm(e: FormEvent) {
    e.preventDefault();
    const errs = checkContact();
    if (!agree) errs.agree = t("book.errAgree");
    setErrors(errs);
    if (Object.keys(errs).length || !chosen) {
      document.getElementById(`book-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const client = addClient({ name: name.trim(), phone, email: email || undefined });
    if (client.blocked) {
      setErrors({ phone: t("book.errBlocked") });
      document.getElementById("book-phone")?.focus();
      return;
    }
    const groupId = extra ? `g${Date.now()}` : undefined;
    const b = addBooking({ clientId: client.id, serviceIds, staffId: chosen.staffId, start: chosen.start, status: "confirmed", source: "online", deposit: deposit || undefined, groupId });
    if (extra && extra.name.trim()) {
      const options = findSlots({ date, serviceIds: [extra.serviceId], bookings: [...bookings, b] });
      const firstEnd = new Date(b.end).getTime();
      const together = options.find((o) => o.start === chosen.start && o.staffId !== chosen.staffId);
      const after = options.find((o) => new Date(o.start).getTime() >= firstEnd);
      const pick = together ?? after;
      if (pick) {
        const guest = addClient({ name: extra.name.trim(), phone: "" }); // booked under the main client's phone
        addBooking({ clientId: guest.id, serviceIds: [extra.serviceId], staffId: pick.staffId, start: pick.start, status: "confirmed", source: "online", groupId });
      }
    }
    navigate(`${SHOP}/booked/${b.id}`);
  }

  function joinWaitlist(e: FormEvent) {
    e.preventDefault();
    const errs = checkContact();
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`wait-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const client = addClient({ name: name.trim(), phone });
    const day = f.day(`${date}T12:00:00+02:00`);
    addWaitlist({ clientId: client.id, serviceId: serviceIds[0], window: `Any time on ${f.day(`${date}T12:00:00+02:00`, "short")}${staffId ? `, ${staffById(staffId).name} only` : ""}` });
    setWaitDone(day);
  }

  const field = (id: string, label: string, input: JSX.Element, err?: string) => (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      {input}
      {err && (
        <p className="ui-error" id={`${id}-err`}>
          {err}
        </p>
      )}
    </div>
  );

  return (
    <ShopFrame narrow>
      <div className="book">
        <ol className="book__steps" aria-label={t("book.steps")}>
          {STEPS.map((k, i) => (
            <li key={k} aria-current={i === step ? "step" : undefined} data-done={i < step || undefined}>
              {i < step ? (
                <button type="button" className="book__steplink" onClick={() => go(i)}>
                  {t(k)}
                </button>
              ) : (
                t(k)
              )}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section aria-labelledby="b0">
            <h1 id="b0">{t("book.what")}</h1>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">{t("book.s0")}</legend>
              {SERVICES.map((x) => (
                <label key={x.id} className="book__option">
                  <input
                    type="checkbox"
                    checked={serviceIds.includes(x.id)}
                    onChange={(e) => {
                      setSlot("");
                      setServiceIds((ids) => (e.target.checked ? [...ids, x.id] : ids.filter((v) => v !== x.id)));
                    }}
                  />
                  <span className="book__option-text">
                    <strong>{s(x.name)}</strong>
                    <small>
                      {f.num(x.minutes)} {t("min")}
                      {x.deposit ? `, ${t("book.depositAt")}` : ""}
                    </small>
                  </span>
                  <span className="num">{f.money(x.priceMinor, { whole: true })}</span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="b1">
            <h1 id="b1">{t("book.who")}</h1>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">{t("book.s1")}</legend>
              <label className="book__option">
                <input type="radio" name="staff" checked={staffId === ""} onChange={() => setStaffId("")} />
                <span className="book__option-text">
                  <strong>{t("book.anyone")}</strong>
                  <small>{t("book.firstFree")}</small>
                </span>
              </label>
              {eligible.map((b) => (
                <label key={b.id} className="book__option">
                  <input
                    type="radio"
                    name="staff"
                    checked={staffId === b.id}
                    onChange={() => {
                      setSlot("");
                      setStaffId(b.id);
                    }}
                  />
                  <span className="book__option-text">
                    <strong>{b.name}</strong>
                    <small>{s(b.role)}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            {eligible.length === 0 && <p className="ui-error">{t("book.noOne")}</p>}
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="b2">
            <h1 id="b2">{t("book.pick")}</h1>
            <div className="book__days" role="radiogroup" aria-label={t("book.day")}>
              {nextDays(7).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={date === d}
                  className="book__day"
                  onClick={() => {
                    setDate(d);
                    setSlot("");
                    setWaitDone(null);
                    setWaitForm(false);
                  }}
                >
                  {f.day(`${d}T12:00:00+02:00`, "short")}
                </button>
              ))}
            </div>
            {slots.length === 0 ? (
              <div className="book__full">
                <p>{t("book.none")}</p>
                {waitDone ? (
                  <p className="ui-live" role="status">
                    {t("book.waitlisted", { day: waitDone })}
                  </p>
                ) : waitForm ? (
                  <form className="book__waitform" onSubmit={joinWaitlist} noValidate>
                    {field("wait-name", t("book.name"), <input id="wait-name" className="ui-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} />, errors.name)}
                    {field("wait-phone", t("book.phone"), <input id="wait-phone" className="ui-input" type="tel" autoComplete="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone || undefined} />, errors.phone)}
                    <button type="submit" className="shop__btn shop__btn--primary">
                      {t("book.waitlist")}
                    </button>
                  </form>
                ) : (
                  <button type="button" className="shop__btn" onClick={() => setWaitForm(true)}>
                    {t("book.waitlist")}
                  </button>
                )}
              </div>
            ) : (
              <fieldset className="ui-fieldset">
                <legend className="visually-hidden">{t("book.s2")}</legend>
                <div className="slot-grid slot-grid--big">
                  {slots.map((x) => {
                    const v = `${x.start}|${x.staffId}`;
                    return (
                      <label key={v} className="slot">
                        <input type="radio" name="slot" checked={slot === v} onChange={() => setSlot(v)} />
                        <span className="num">{f.time(x.start)}</span>
                        {!staffId && <small>{staffById(x.staffId).name}</small>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </section>
        )}

        {step === 3 && chosen && (
          <form aria-labelledby="b3" onSubmit={confirm} noValidate>
            <h1 id="b3">{t("book.almost")}</h1>
            <dl className="book__summary">
              <div>
                <dt>{t("book.when")}</dt>
                <dd>
                  {f.day(chosen.start)}
                  {sep}
                  {f.time(chosen.start)}
                </dd>
              </div>
              <div>
                <dt>{t("book.with")}</dt>
                <dd>{staffById(chosen.staffId).name}</dd>
              </div>
              <div>
                <dt>{t("book.for")}</dt>
                <dd>
                  {serviceNames}
                  {sep}
                  {f.num(minutes)} {t("min")}
                </dd>
              </div>
              <div>
                <dt>{t("book.price")}</dt>
                <dd className="num">{f.money(total)}</dd>
              </div>
              {deposit > 0 && (
                <div>
                  <dt>{t("book.depositNow")}</dt>
                  <dd className="num">{t("book.depositOff", { amount: f.money(deposit) })}</dd>
                </div>
              )}
            </dl>
            {field("book-name", t("book.name"), <input id="book-name" className="ui-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} aria-describedby={errors.name ? "book-name-err" : undefined} />, errors.name)}
            {field(
              "book-phone",
              t("book.phone"),
              <input id="book-phone" className="ui-input" type="tel" autoComplete="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone || undefined} aria-describedby={errors.phone ? "book-phone-err" : undefined} />,
              errors.phone,
            )}
            {field("book-email", t("book.email"), <input id="book-email" className="ui-input" type="email" autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />)}
            {extra ? (
              <fieldset className="ui-fieldset book__extra">
                <legend>{t("book.extraTitle")}</legend>
                {field("extra-name", t("book.extraName"), <input id="extra-name" className="ui-input" value={extra.name} onChange={(e) => setExtra({ ...extra, name: e.target.value })} />)}
                {field(
                  "extra-svc",
                  t("book.extraHaving"),
                  <select id="extra-svc" className="ui-input" value={extra.serviceId} onChange={(e) => setExtra({ ...extra, serviceId: e.target.value })}>
                    {SERVICES.filter((x) => !x.deposit).map((x) => (
                      <option key={x.id} value={x.id}>
                        {s(x.name)}, {f.money(x.priceMinor, { whole: true })}
                      </option>
                    ))}
                  </select>,
                )}
                <p className="app-quiet">{t("book.extraHow")}</p>
                <button type="button" className="shop__btn shop__btn--text" onClick={() => setExtra(null)}>
                  {t("book.justMe")}
                </button>
              </fieldset>
            ) : (
              <button type="button" className="shop__btn" onClick={() => setExtra({ name: "", serviceId: "kids" })}>
                {t("book.addPerson")}
              </button>
            )}
            <label className="ui-check">
              <input id="book-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={!!errors.agree || undefined} />
              <span>{t("book.agree")}</span>
            </label>
            {errors.agree && <p className="ui-error">{errors.agree}</p>}
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              {deposit > 0 ? t("book.ctaPay", { amount: f.money(deposit) }) : t("book.cta")}
            </button>
            {deposit > 0 && <p className="app-quiet">{t("book.payNote")}</p>}
          </form>
        )}

        {step < 3 && (
          <div className="book__nav">
            <p className="num">{serviceIds.length ? `${f.money(total, { whole: true })}${sep}${f.num(minutes)} ${t("min")}` : t("book.nothing")}</p>
            <button
              type="button"
              className="shop__btn shop__btn--primary"
              disabled={(step === 0 && serviceIds.length === 0) || (step === 1 && eligible.length === 0) || (step === 2 && !slot)}
              onClick={() => go(step + 1)}
            >
              {t("book.continue")}
            </button>
          </div>
        )}
        {step === 3 && !chosen && (
          <p className="ui-error">
            {t("book.gone")} <Link to={`${SHOP}/book?step=2`}>{t("book.pickAnother")}</Link>
          </p>
        )}
      </div>
    </ShopFrame>
  );
}
