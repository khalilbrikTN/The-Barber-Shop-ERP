import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BOOKABLE, clientById, NOW, PACKAGES, PROMO_CODES, serviceById, SERVICES } from "../../lib/data";
import { minorDigits, useFormat } from "../../lib/format";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead } from "../../ui/kit";
import { useT } from "../i18n";

type Line = { key: string; label: string; minor: number; kind?: "service" | "product" | "gift" | "package"; ref?: string };
type Method = "cash" | "card" | "wallet";

export function Checkout() {
  const f = useFormat();
  const { t } = useT();
  const { settings } = useSettings();
  const [params] = useSearchParams();
  const { bookings, setStatus, addSale, products, adjustStock, giftCards, addGiftCard, redeemGiftCard } = useStore();
  const booking = bookings.find((b) => b.id === params.get("booking"));

  const initial: Line[] = booking ? booking.serviceIds.map((id, i) => ({ key: `${id}-${i}`, label: serviceById(id).name, minor: serviceById(id).priceMinor })) : [];
  const [lines, setLines] = useState<Line[]>(initial);
  const [staffId, setStaffId] = useState(booking?.staffId ?? BOOKABLE[0].id);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [codeError, setCodeError] = useState("");
  const [tipPct, setTipPct] = useState(0);
  const [split, setSplit] = useState<Record<Method, string>>({ cash: "", card: "", wallet: "" });
  const [done, setDone] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [gift, setGift] = useState<{ code: string; minor: number } | null>(null);
  const [giftError, setGiftError] = useState("");
  const [sold, setSold] = useState<string[]>([]);

  const subtotal = lines.reduce((t, l) => t + l.minor, 0);
  const discount = applied === "MATIN10" ? Math.round(subtotal * 0.1) : applied === "BIENVENUE" ? Math.min(5000, subtotal) : 0;
  const deposit = booking?.deposit ?? 0;
  const tip = Math.round(((subtotal - discount) * tipPct) / 100);
  const total = subtotal - discount + tip - deposit;
  const taxIncluded = settings.pricesIncludeTax ? Math.round((subtotal - discount) - (subtotal - discount) / (1 + settings.taxRate)) : 0;

  const unit = 10 ** minorDigits(settings.currency);
  const major = (m: number) => m / unit;
  const paid = useMemo(() => (Object.values(split) as string[]).reduce((t, v) => t + Math.round((parseFloat(v.replace(",", ".")) || 0) * unit), 0), [split, unit]);
  const giftPaid = gift ? Math.min(gift.minor, Math.max(0, total)) : 0;
  const remaining = total - paid - giftPaid;

  function payAll(m: Method) {
    setSplit({ cash: "", card: "", wallet: "", [m]: String(major(total - giftPaid)) } as Record<Method, string>);
  }

  function applyGift() {
    const card = giftCards.find((g) => g.code === giftCode.trim().toUpperCase());
    if (!card) return setGiftError(t("co.errNoCard"));
    if (card.balanceMinor <= 0) return setGiftError(t("co.errEmpty"));
    if (card.expires < NOW.slice(0, 10)) return setGiftError(t("co.errExpired"));
    setGiftError("");
    setGift({ code: card.code, minor: card.balanceMinor });
  }

  function complete() {
    const method = (Object.entries(split).sort((a, b) => (parseFloat(b[1]) || 0) - (parseFloat(a[1]) || 0))[0][0] ?? "cash") as Method;
    addSale({ time: NOW, clientId: booking?.clientId, staffId, lines: lines.map((l) => ({ label: l.label, minor: l.minor })), tipMinor: tip, method });
    lines.filter((l) => l.kind === "product" && l.ref).forEach((l) => adjustStock(l.ref!, -1));
    if (gift && giftPaid > 0) redeemGiftCard(gift.code, giftPaid);
    const newCards = lines.filter((l) => l.kind === "gift").map((l) => addGiftCard({ initialMinor: l.minor, balanceMinor: l.minor, buyer: (booking && clientById(booking.clientId)?.name) || t("co.walkIn"), to: t("co.notSaid"), expires: "2027-12-31" }).code);
    setSold(newCards);
    if (booking) setStatus(booking.id, "done");
    setDone(true);
  }

  if (done)
    return (
      <>
        <PageHead title={t("co.recorded")} sub={booking ? t("co.recordedSubFor", { amount: f.money(total), name: clientById(booking.clientId)?.name ?? "" }) : t("co.recordedSub", { amount: f.money(total) })} />
        <section className="app-section app-panel app-narrow">
          <h2 className="app-h2">{t("co.rebook")}</h2>
          <div className="rebook">
            {[2, 3, 4].map((w) => (
              <Link key={w} className="ui-btn ui-btn--quiet" to="/app/calendar?new=1">
                {t("co.inWeeks", { n: w })}
              </Link>
            ))}
          </div>
          {sold.length > 0 && (
            <p className="ui-live" role="status">
              {t("co.giftReady", { codes: sold.join(", ") })}
            </p>
          )}
          <p className="app-quiet">{t("co.receipt")}</p>
          <NotConnected what={t("co.thing")} />
          <Link className="ui-btn ui-btn--text" to="/app">
            {t("common.backToday")}
          </Link>
        </section>
      </>
    );

  return (
    <>
      <PageHead title={t("co.title")} sub={booking ? t("co.bookedWith", { name: clientById(booking.clientId)?.name ?? "", barber: BOOKABLE.find((s) => s.id === booking.staffId)?.name ?? "" }) : t("co.walkInSale")} />

      <div className="app-split app-split--checkout">
        <section className="app-section" aria-labelledby="items-title">
          <h2 id="items-title" className="app-h2">
            {t("co.items")}
          </h2>
          {lines.length === 0 ? (
            <div className="ui-note">
              <p className="ui-note__title">{t("co.nothing")}</p>
              <p>{t("co.nothingBody")}</p>
            </div>
          ) : (
            <ul className="bill">
              {lines.map((l) => (
                <li key={l.key}>
                  <span>{l.label}</span>
                  <span className="num">{f.money(l.minor)}</span>
                  <button type="button" className="ui-btn ui-btn--text" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} aria-label={t("co.removeItem", { name: l.label })}>
                    {t("common.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="add-row">
            <Field label={t("co.addService")}>
              {(id) => (
                <select
                  id={id}
                  className="ui-input"
                  value=""
                  onChange={(e) => {
                    const s = serviceById(e.target.value);
                    setLines((ls) => [...ls, { key: `${s.id}-${Date.now()}`, label: s.name, minor: s.priceMinor }]);
                  }}
                >
                  <option value="">{t("common.choose")}</option>
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {t("common.itemPrice", { name: s.name, price: f.money(s.priceMinor, { whole: true }) })}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t("co.sellGift")}>
              {(id) => (
                <select
                  id={id}
                  className="ui-input"
                  value=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.startsWith("gift-")) {
                      const minor = Number(v.slice(5));
                      setLines((ls) => [...ls, { key: `${v}-${Date.now()}`, label: t("co.giftLine", { amount: f.money(minor, { whole: true }) }), minor, kind: "gift" }]);
                    } else {
                      const pk = PACKAGES.find((x) => x.id === v)!;
                      setLines((ls) => [...ls, { key: `${pk.id}-${Date.now()}`, label: t("co.packageLine", { name: pk.name }), minor: pk.priceMinor, kind: "package", ref: pk.id }]);
                    }
                  }}
                >
                  <option value="">{t("common.choose")}</option>
                  {[25000, 50000, 100000].map((m) => (
                    <option key={m} value={`gift-${m}`}>
                      {t("co.giftLine", { amount: f.money(m, { whole: true }) })}
                    </option>
                  ))}
                  {PACKAGES.map((pk) => (
                    <option key={pk.id} value={pk.id}>
                      {t("common.itemPrice", { name: pk.name, price: f.money(pk.priceMinor, { whole: true }) })}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t("co.addProduct")}>
              {(id) => (
                <select
                  id={id}
                  className="ui-input"
                  value=""
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value)!;
                    setLines((ls) => [...ls, { key: `${p.id}-${Date.now()}`, label: p.name, minor: p.priceMinor, kind: "product", ref: p.id }]);
                  }}
                >
                  <option value="">{t("common.choose")}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {t("co.productOption", { name: p.name, price: f.money(p.priceMinor, { whole: true }), stock: p.stock })}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t("co.commissionTo")}>
              {(id) => (
                <select id={id} className="ui-input" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
                  {BOOKABLE.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <form
            className="code-row"
            onSubmit={(e) => {
              e.preventDefault();
              const found = PROMO_CODES.find((p) => p.code === code.trim().toUpperCase());
              if (!found) {
                setCodeError(t("co.errCode"));
                setApplied(null);
                return;
              }
              setCodeError("");
              setApplied(found.code);
            }}
          >
            <Field label={t("co.promo")}>{(id) => <input id={id} className="ui-input" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" aria-invalid={!!codeError || undefined} />}</Field>
            <button type="submit" className="ui-btn ui-btn--quiet">
              {t("common.apply")}
            </button>
          </form>
          {codeError && (
            <p className="ui-error" role="alert">
              {codeError}
            </p>
          )}
        </section>

        <section className="app-section app-panel" aria-labelledby="pay-title">
          <h2 id="pay-title" className="app-h2">
            {t("co.payment")}
          </h2>
          <dl className="totals">
            <div>
              <dt>{t("co.subtotal")}</dt>
              <dd className="num">{f.money(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div>
                <dt>{applied}</dt>
                <dd className="num">−{f.money(discount)}</dd>
              </div>
            )}
            {deposit > 0 && (
              <div>
                <dt>{t("co.depositOnline")}</dt>
                <dd className="num">−{f.money(deposit)}</dd>
              </div>
            )}
            <div>
              <dt>{t("co.tip")}</dt>
              <dd className="num">{f.money(tip)}</dd>
            </div>
            <div className="totals__total">
              <dt>{t("co.toPay")}</dt>
              <dd className="num">{f.money(total)}</dd>
            </div>
            {taxIncluded > 0 && (
              <div className="totals__tax">
                <dt>{t("co.tax", { rate: f.pct(settings.taxRate) })}</dt>
                <dd className="num">{f.money(taxIncluded)}</dd>
              </div>
            )}
          </dl>

          <fieldset className="ui-fieldset">
            <legend>{t("co.tip")}</legend>
            <div className="ui-seg" role="radiogroup" aria-label={t("co.tip")}>
              {[0, 10, 15, 20].map((p) => (
                <button key={p} type="button" role="radio" aria-checked={tipPct === p} className="ui-segbtn" onClick={() => setTipPct(p)}>
                  {p === 0 ? t("co.noTip") : t("co.pct", { n: p })}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ui-fieldset">
            <legend>{t("co.paidWith")}</legend>
            <div className="ui-seg ui-seg--fill">
              {(["cash", "card", "wallet"] as Method[]).map((m) => (
                <button key={m} type="button" className="ui-segbtn" onClick={() => payAll(m)}>
                  {t("co.all", { method: t(`method.${m}` as const).toLowerCase() })}
                </button>
              ))}
            </div>
            <div className="split">
              {(["cash", "card", "wallet"] as Method[]).map((m) => (
                <Field key={m} label={t(`method.${m}` as const)}>
                  {(id) => <input id={id} className="ui-input num" inputMode="decimal" value={split[m]} onChange={(e) => setSplit((s) => ({ ...s, [m]: e.target.value }))} placeholder="0" />}
                </Field>
              ))}
            </div>
            <div className="code-row">
              <Field label={t("co.giftCode")}>
                {(id) => <input id={id} className="ui-input num" value={giftCode} onChange={(e) => setGiftCode(e.target.value)} placeholder="GIFT-7KQ2" autoComplete="off" aria-invalid={!!giftError || undefined} />}
              </Field>
              <button type="button" className="ui-btn ui-btn--quiet" onClick={applyGift} disabled={!giftCode.trim() || !!gift}>
                {t("co.useCard")}
              </button>
            </div>
            {giftError && (
              <p className="ui-error" role="alert">
                {giftError}
              </p>
            )}
            {gift && (
              <p className="app-quiet">
                {t("co.giftPays", { code: gift.code, paid: f.money(giftPaid), left: f.money(gift.minor - giftPaid) })}{" "}
                <button type="button" className="ui-btn ui-btn--text" onClick={() => setGift(null)}>
                  {t("common.remove")}
                </button>
              </p>
            )}
            <p className={remaining > 0 ? "checkout__due" : "app-quiet"} aria-live="polite">
              {remaining === 0 ? t("co.paidFull") : remaining > 0 ? t("co.stillDue", { amount: f.money(remaining) }) : t("co.over", { amount: f.money(-remaining) })}
            </p>
          </fieldset>

          <button type="button" className="ui-btn ui-btn--primary ui-btn--block" disabled={lines.length === 0 || remaining > 0} onClick={complete}>
            {t("co.take", { amount: f.money(total) })}
          </button>
        </section>
      </div>
    </>
  );
}
