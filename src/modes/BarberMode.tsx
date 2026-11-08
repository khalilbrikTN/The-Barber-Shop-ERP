import { useState } from "react";
import { Link } from "react-router-dom";
import { BOOKABLE, clientById, NOW, serviceById, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { useStore } from "../lib/store";
import { Status } from "../ui/kit";

export function BarberMode() {
  const f = useFormat();
  const { bookings, setStatus, sales } = useStore();
  const [me, setMe] = useState("karim");
  const [late, setLate] = useState(false);
  const [clockedIn, setClockedIn] = useState<string | null>(null);
  const mine = bookings.filter((b) => b.staffId === me && b.start.startsWith(TODAY) && b.status !== "cancelled" && b.status !== "blocked").sort((a, b) => a.start.localeCompare(b.start));
  const now = new Date(NOW).getTime();
  const current = mine.find((b) => b.status === "in the chair");
  const next = mine.find((b) => new Date(b.start).getTime() > now && (b.status === "confirmed" || b.status === "checked in"));
  const focus = current ?? next;
  const client = focus ? clientById(focus.clientId) : undefined;
  const earned = sales.filter((s) => s.staffId === me && s.time.startsWith(TODAY) && !s.refunded).reduce((t, s) => t + s.lines.reduce((a, l) => a + l.minor, 0) + s.tipMinor, 0);

  return (
    <div className="app-root mode-barber">
      <header className="mode-barber__top">
        <label>
          <span className="visually-hidden">Barber</span>
          <select className="ui-input" value={me} onChange={(e) => setMe(e.target.value)}>
            {BOOKABLE.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={clockedIn ? "ui-btn ui-btn--quiet" : "ui-btn ui-btn--primary"} onClick={() => setClockedIn((c) => (c ? null : new Date().toISOString()))}>
          {clockedIn ? "Clock out" : "Clock in"}
        </button>
      </header>

      {focus && client ? (
        <section className="next-card" aria-labelledby="nc-title">
          <p className="next-card__label">{current ? "In your chair" : `Next at ${f.time(focus.start)}`}</p>
          <h1 id="nc-title" className="next-card__name">
            {client.name}
          </h1>
          <p>{focus.serviceIds.map((id) => serviceById(id).name).join(", ")}</p>
          {client.notes && (
            <div className="next-card__notes">
              <p className="next-card__label">Notes</p>
              <p>{client.notes}</p>
            </div>
          )}
          <div className="next-card__actions">
            {focus.status === "confirmed" && (
              <button type="button" className="ui-btn ui-btn--on-ink" onClick={() => setStatus(focus.id, "checked in")}>
                Checked in
              </button>
            )}
            {focus.status === "checked in" && (
              <button type="button" className="ui-btn ui-btn--on-ink" onClick={() => setStatus(focus.id, "in the chair")}>
                Start
              </button>
            )}
            {focus.status === "in the chair" && (
              <Link className="ui-btn ui-btn--on-ink" to={`/app/checkout?booking=${focus.id}`}>
                Done, check out
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section className="next-card">
          <h1 className="next-card__name">Free chair</h1>
          <p>Nothing booked next.</p>
          <p>The front desk can send you the next walk-in.</p>
        </section>
      )}

      {clockedIn && (
        <p className="app-quiet" role="status">
          Clocked in at {f.time(clockedIn)}.
        </p>
      )}
      <button type="button" className="ui-btn ui-btn--quiet ui-btn--block" onClick={() => setLate(true)} disabled={late}>
        {late ? "Late message ready, not connected to WhatsApp yet" : "Running 10 minutes late"}
      </button>

      <section aria-labelledby="day-title">
        <h2 id="day-title" className="app-h2">
          My day
        </h2>
        <ol className="my-day">
          {mine.map((b) => (
            <li key={b.id} data-current={b.id === focus?.id || undefined}>
              <span className="num">{f.time(b.start)}</span>
              <span>
                <strong>{clientById(b.clientId)?.name}</strong> {b.serviceIds.map((id) => serviceById(id).name).join(", ")}
              </span>
              <Status value={b.status} />
            </li>
          ))}
        </ol>
      </section>

      <section className="mode-barber__earned" aria-labelledby="earn-title">
        <h2 id="earn-title" className="app-h2">
          Taken today
        </h2>
        <p className="num mode-barber__figure">{f.money(earned, { whole: true })}</p>
        <Link to="/app" className="app-more">
          Open the full app
        </Link>
      </section>
    </div>
  );
}
