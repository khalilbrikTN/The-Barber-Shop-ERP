import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { findSlots } from "../lib/availability";
import { BOOKABLE, serviceById, SERVICES, staffById, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "./ShopFrame";

const STEPS = ["Services", "Barber", "Time", "Your details"];

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(`${TODAY}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function Book() {
  const f = useFormat();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { bookings, addBooking, addClient } = useStore();
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

  const go = (n: number) => {
    const next = new URLSearchParams(params);
    next.set("step", String(n));
    setParams(next);
  };

  const eligible = BOOKABLE.filter((s) => serviceIds.every((id) => s.services.includes(id)));
  const slots = serviceIds.length ? findSlots({ date, serviceIds, staffId: staffId || undefined, bookings }) : [];
  const chosen = slots.find((s) => `${s.start}|${s.staffId}` === slot);
  const total = serviceIds.reduce((t, id) => t + serviceById(id).priceMinor, 0);
  const minutes = serviceIds.reduce((t, id) => t + serviceById(id).minutes, 0);
  const deposit = serviceIds.some((id) => serviceById(id).deposit) ? Math.round(total * 0.25) : 0;

  function confirm(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Add your name so the barber knows who is coming.";
    if (phone.replace(/\D/g, "").length < 8) errs.phone = "Add a phone number with its country code, like +20 100 000 0000.";
    if (!agree) errs.agree = "Accept the cancellation rule to book.";
    setErrors(errs);
    if (Object.keys(errs).length || !chosen) {
      const first = document.getElementById(`book-${Object.keys(errs)[0]}`);
      first?.focus();
      return;
    }
    const client = addClient({ name: name.trim(), phone, email: email || undefined });
    if (client.blocked) {
      setErrors({ phone: "This number cannot book online. Call or message the shop." });
      document.getElementById("book-phone")?.focus();
      return;
    }
    const groupId = extra ? `g${Date.now()}` : undefined;
    const b = addBooking({ clientId: client.id, serviceIds, staffId: chosen.staffId, start: chosen.start, status: "confirmed", source: "online", deposit: deposit || undefined, groupId });
    if (extra && extra.name.trim()) {
      const withFirst = [...bookings, b];
      const options = findSlots({ date, serviceIds: [extra.serviceId], bookings: withFirst });
      const firstEnd = new Date(b.end).getTime();
      const together = options.find((o) => o.start === chosen.start && o.staffId !== chosen.staffId);
      const after = options.find((o) => new Date(o.start).getTime() >= firstEnd);
      const pick = together ?? after;
      if (pick) {
        const guest = addClient({ name: extra.name.trim(), phone: "", email: undefined }); // booked under the main client's phone
        addBooking({ clientId: guest.id, serviceIds: [extra.serviceId], staffId: pick.staffId, start: pick.start, status: "confirmed", source: "online", groupId });
      }
    }
    navigate(`${SHOP}/booked/${b.id}`);
  }

  return (
    <ShopFrame narrow>
      <div className="book">
        <ol className="book__steps" aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} data-done={i < step || undefined}>
              {i < step ? (
                <button type="button" className="book__steplink" onClick={() => go(i)}>
                  {s}
                </button>
              ) : (
                s
              )}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section aria-labelledby="b0">
            <h1 id="b0">What are you booking?</h1>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">Services</legend>
              {SERVICES.map((s) => (
                <label key={s.id} className="book__option">
                  <input
                    type="checkbox"
                    checked={serviceIds.includes(s.id)}
                    onChange={(e) => {
                      setSlot("");
                      setServiceIds((ids) => (e.target.checked ? [...ids, s.id] : ids.filter((x) => x !== s.id)));
                    }}
                  />
                  <span className="book__option-text">
                    <strong>{s.name}</strong>
                    <small>
                      {s.minutes} min{s.deposit ? ", deposit at booking" : ""}
                    </small>
                  </span>
                  <span className="num">{f.money(s.priceMinor, { whole: true })}</span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="b1">
            <h1 id="b1">Who would you like?</h1>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">Barber</legend>
              <label className="book__option">
                <input type="radio" name="staff" checked={staffId === ""} onChange={() => setStaffId("")} />
                <span className="book__option-text">
                  <strong>Anyone</strong>
                  <small>The first free chair</small>
                </span>
              </label>
              {eligible.map((s) => (
                <label key={s.id} className="book__option">
                  <input
                    type="radio"
                    name="staff"
                    checked={staffId === s.id}
                    onChange={() => {
                      setSlot("");
                      setStaffId(s.id);
                    }}
                  />
                  <span className="book__option-text">
                    <strong>{s.name}</strong>
                    <small>{s.role}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            {eligible.length === 0 && <p className="ui-error">No one does all of these in one visit. Remove a service to see who is free.</p>}
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="b2">
            <h1 id="b2">Pick a time</h1>
            <div className="book__days" role="radiogroup" aria-label="Day">
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
                  }}
                >
                  {f.day(`${d}T12:00:00+02:00`, "short")}
                </button>
              ))}
            </div>
            {slots.length === 0 ? (
              <p className="app-quiet">Nothing free that day. Try the next day, or pick Anyone.</p>
            ) : (
              <fieldset className="ui-fieldset">
                <legend className="visually-hidden">Time</legend>
                <div className="slot-grid slot-grid--big">
                  {slots.map((s) => {
                    const v = `${s.start}|${s.staffId}`;
                    return (
                      <label key={v} className="slot">
                        <input type="radio" name="slot" checked={slot === v} onChange={() => setSlot(v)} />
                        <span className="num">{f.time(s.start)}</span>
                        {!staffId && <small>{staffById(s.staffId).name}</small>}
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
            <h1 id="b3">Almost booked</h1>
            <dl className="book__summary">
              <div>
                <dt>When</dt>
                <dd>
                  {f.day(chosen.start)}, {f.time(chosen.start)}
                </dd>
              </div>
              <div>
                <dt>With</dt>
                <dd>{staffById(chosen.staffId).name}</dd>
              </div>
              <div>
                <dt>For</dt>
                <dd>
                  {serviceIds.map((id) => serviceById(id).name).join(", ")}, {minutes} min
                </dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd className="num">{f.money(total)}</dd>
              </div>
              {deposit > 0 && (
                <div>
                  <dt>Deposit now</dt>
                  <dd className="num">{f.money(deposit)}, taken off the price on the day</dd>
                </div>
              )}
            </dl>
            <div className="ui-field">
              <label htmlFor="book-name">Your name</label>
              <input id="book-name" className="ui-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} aria-describedby={errors.name ? "err-name" : undefined} />
              {errors.name && <p className="ui-error" id="err-name">{errors.name}</p>}
            </div>
            <div className="ui-field">
              <label htmlFor="book-phone">Phone, for WhatsApp reminders</label>
              <input id="book-phone" className="ui-input" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone || undefined} aria-describedby={errors.phone ? "err-phone" : undefined} />
              {errors.phone && <p className="ui-error" id="err-phone">{errors.phone}</p>}
            </div>
            <div className="ui-field">
              <label htmlFor="book-email">Email, optional</label>
              <input id="book-email" className="ui-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {extra ? (
              <fieldset className="ui-fieldset book__extra">
                <legend>Someone coming with you</legend>
                <div className="ui-field">
                  <label htmlFor="extra-name">Their name</label>
                  <input id="extra-name" className="ui-input" value={extra.name} onChange={(e) => setExtra({ ...extra, name: e.target.value })} />
                </div>
                <div className="ui-field">
                  <label htmlFor="extra-svc">They are having</label>
                  <select id="extra-svc" className="ui-input" value={extra.serviceId} onChange={(e) => setExtra({ ...extra, serviceId: e.target.value })}>
                    {SERVICES.filter((s) => !s.deposit).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}, {f.money(s.priceMinor, { whole: true })}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="app-quiet">Booked at the same time with another barber if one is free, otherwise straight after you.</p>
                <button type="button" className="shop__btn shop__btn--text" onClick={() => setExtra(null)}>
                  Just me
                </button>
              </fieldset>
            ) : (
              <button type="button" className="shop__btn" onClick={() => setExtra({ name: "", serviceId: "kids" })}>
                Add a second person
              </button>
            )}
            <label className="ui-check">
              <input id="book-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={!!errors.agree || undefined} />
              <span>Free to cancel or move until 2 hours before. After that, or if you do not come, the shop may keep the deposit.</span>
            </label>
            {errors.agree && <p className="ui-error">{errors.agree}</p>}
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              {deposit > 0 ? `Book and pay ${f.money(deposit)}` : "Book"}
            </button>
            {deposit > 0 && <p className="app-quiet">Card payment is not connected in this preview; the booking is kept in this tab only.</p>}
          </form>
        )}

        {step < 3 && (
          <div className="book__nav">
            <p className="num">{serviceIds.length ? `${f.money(total, { whole: true })}, ${minutes} min` : "Nothing picked yet"}</p>
            <button
              type="button"
              className="shop__btn shop__btn--primary"
              disabled={(step === 0 && serviceIds.length === 0) || (step === 1 && eligible.length === 0) || (step === 2 && !slot)}
              onClick={() => go(step + 1)}
            >
              Continue
            </button>
          </div>
        )}
        {step === 3 && !chosen && (
          <p className="ui-error">
            That time is gone. <Link to={`${SHOP}/book?step=2`}>Pick another time</Link>.
          </p>
        )}
      </div>
    </ShopFrame>
  );
}
