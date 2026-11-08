import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BOOKABLE, clientById, NOW, PRODUCTS, PROMO_CODES, serviceById, SERVICES } from "../../lib/data";
import { minorDigits, useFormat } from "../../lib/format";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead } from "../../ui/kit";

type Line = { key: string; label: string; minor: number };
type Method = "cash" | "card" | "wallet";

export function Checkout() {
  const f = useFormat();
  const { settings } = useSettings();
  const [params] = useSearchParams();
  const { bookings, setStatus, addSale } = useStore();
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

  const subtotal = lines.reduce((t, l) => t + l.minor, 0);
  const discount = applied === "MORNING10" ? Math.round(subtotal * 0.1) : applied === "WELCOME" ? Math.min(5000, subtotal) : 0;
  const deposit = booking?.deposit ?? 0;
  const tip = Math.round(((subtotal - discount) * tipPct) / 100);
  const total = subtotal - discount + tip - deposit;
  const taxIncluded = settings.pricesIncludeTax ? Math.round((subtotal - discount) - (subtotal - discount) / (1 + settings.taxRate)) : 0;

  const unit = 10 ** minorDigits(settings.currency);
  const major = (m: number) => m / unit;
  const paid = useMemo(() => (Object.values(split) as string[]).reduce((t, v) => t + Math.round((parseFloat(v.replace(",", ".")) || 0) * unit), 0), [split, unit]);
  const remaining = total - paid;

  function payAll(m: Method) {
    setSplit({ cash: "", card: "", wallet: "", [m]: String(major(total)) } as Record<Method, string>);
  }

  function complete() {
    const method = (Object.entries(split).sort((a, b) => (parseFloat(b[1]) || 0) - (parseFloat(a[1]) || 0))[0][0] ?? "cash") as Method;
    addSale({ time: NOW, clientId: booking?.clientId, staffId, lines: lines.map((l) => ({ label: l.label, minor: l.minor })), tipMinor: tip, method });
    if (booking) setStatus(booking.id, "done");
    setDone(true);
  }

  if (done)
    return (
      <>
        <PageHead title="Sale recorded" sub={`${f.money(total)}${booking ? ` for ${clientById(booking.clientId)?.name}` : ""}, saved in this browser until a server is connected.`} />
        <section className="app-section app-panel app-narrow">
          <h2 className="app-h2">Book the next visit before they leave</h2>
          <div className="rebook">
            {[2, 3, 4].map((w) => (
              <Link key={w} className="ui-btn ui-btn--quiet" to="/app/calendar?new=1">
                In {w} weeks
              </Link>
            ))}
          </div>
          <p className="app-quiet">Give the client a receipt from your certified till until fiscal receipts are connected for your country.</p>
          <NotConnected what="the sale" />
          <Link className="ui-btn ui-btn--text" to="/app">
            Back to Today
          </Link>
        </section>
      </>
    );

  return (
    <>
      <PageHead title="Checkout" sub={booking ? `${clientById(booking.clientId)?.name}, booked with ${BOOKABLE.find((s) => s.id === booking.staffId)?.name}` : "Walk-in or retail sale"} />

      <div className="app-split app-split--checkout">
        <section className="app-section" aria-labelledby="items-title">
          <h2 id="items-title" className="app-h2">
            Items
          </h2>
          {lines.length === 0 ? (
            <div className="ui-note">
              <p className="ui-note__title">Nothing on the bill</p>
              <p>Add a service or a product below.</p>
            </div>
          ) : (
            <ul className="bill">
              {lines.map((l) => (
                <li key={l.key}>
                  <span>{l.label}</span>
                  <span className="num">{f.money(l.minor)}</span>
                  <button type="button" className="ui-btn ui-btn--text" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} aria-label={`Remove ${l.label}`}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="add-row">
            <Field label="Add a service">
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
                  <option value="">Choose</option>
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}, {f.money(s.priceMinor, { whole: true })}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Add a product">
              {(id) => (
                <select
                  id={id}
                  className="ui-input"
                  value=""
                  onChange={(e) => {
                    const p = PRODUCTS.find((x) => x.id === e.target.value)!;
                    setLines((ls) => [...ls, { key: `${p.id}-${Date.now()}`, label: p.name, minor: p.priceMinor }]);
                  }}
                >
                  <option value="">Choose</option>
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {p.name}, {f.money(p.priceMinor, { whole: true })}, {p.stock} in stock
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Commission goes to">
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
                setCodeError("That code does not exist or has ended.");
                setApplied(null);
                return;
              }
              setCodeError("");
              setApplied(found.code);
            }}
          >
            <Field label="Promo code">{(id) => <input id={id} className="ui-input" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" aria-invalid={!!codeError || undefined} />}</Field>
            <button type="submit" className="ui-btn ui-btn--quiet">
              Apply
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
            Payment
          </h2>
          <dl className="totals">
            <div>
              <dt>Subtotal</dt>
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
                <dt>Deposit paid online</dt>
                <dd className="num">−{f.money(deposit)}</dd>
              </div>
            )}
            <div>
              <dt>Tip</dt>
              <dd className="num">{f.money(tip)}</dd>
            </div>
            <div className="totals__total">
              <dt>To pay</dt>
              <dd className="num">{f.money(total)}</dd>
            </div>
            {taxIncluded > 0 && (
              <div className="totals__tax">
                <dt>Includes tax at {f.pct(settings.taxRate)}</dt>
                <dd className="num">{f.money(taxIncluded)}</dd>
              </div>
            )}
          </dl>

          <fieldset className="ui-fieldset">
            <legend>Tip</legend>
            <div className="ui-seg" role="radiogroup">
              {[0, 10, 15, 20].map((p) => (
                <button key={p} type="button" role="radio" aria-checked={tipPct === p} className="ui-segbtn" onClick={() => setTipPct(p)}>
                  {p === 0 ? "No tip" : `${p}%`}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ui-fieldset">
            <legend>Paid with</legend>
            <div className="ui-seg ui-seg--fill">
              {(["cash", "card", "wallet"] as Method[]).map((m) => (
                <button key={m} type="button" className="ui-segbtn" onClick={() => payAll(m)}>
                  All {m}
                </button>
              ))}
            </div>
            <div className="split">
              {(["cash", "card", "wallet"] as Method[]).map((m) => (
                <Field key={m} label={m[0].toUpperCase() + m.slice(1)}>
                  {(id) => <input id={id} className="ui-input num" inputMode="decimal" value={split[m]} onChange={(e) => setSplit((s) => ({ ...s, [m]: e.target.value }))} placeholder="0" />}
                </Field>
              ))}
            </div>
            <p className={remaining === 0 ? "app-quiet" : "ui-error"} aria-live="polite">
              {remaining === 0 ? "Paid in full." : remaining > 0 ? `${f.money(remaining)} still to pay.` : `${f.money(-remaining)} over. Give change in cash.`}
            </p>
          </fieldset>

          <button type="button" className="ui-btn ui-btn--primary ui-btn--block" disabled={lines.length === 0 || remaining > 0} onClick={complete}>
            Take {f.money(total)}
          </button>
        </section>
      </div>
    </>
  );
}
