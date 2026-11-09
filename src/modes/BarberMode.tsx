import { useState } from "react";
import { Link } from "react-router-dom";
import { BOOKABLE, clientById, NOW, serviceById, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { useStore } from "../lib/store";
import { Status } from "../ui/kit";
import { useT } from "../app/i18n";

export function BarberMode() {
  const f = useFormat();
  const { t } = useT();
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
          <span className="visually-hidden">{t("common.barber")}</span>
          <select className="ui-input" value={me} onChange={(e) => setMe(e.target.value)}>
            {BOOKABLE.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={clockedIn ? "ui-btn ui-btn--quiet" : "ui-btn ui-btn--primary"} onClick={() => setClockedIn((c) => (c ? null : new Date().toISOString()))}>
          {clockedIn ? t("bm.clockOut") : t("bm.clockIn")}
        </button>
      </header>

      {focus && client ? (
        <section className="next-card" aria-labelledby="nc-title">
          <p className="next-card__label">{current ? t("bm.inChair") : t("bm.nextAt", { time: f.time(focus.start) })}</p>
          <h1 id="nc-title" className="next-card__name">
            {client.name}
          </h1>
          <p>{focus.serviceIds.map((id) => serviceById(id).name).join(", ")}</p>
          {client.notes && (
            <div className="next-card__notes">
              <p className="next-card__label">{t("bm.notes")}</p>
              <p>{client.notes}</p>
            </div>
          )}
          <div className="next-card__actions">
            {focus.status === "confirmed" && (
              <button type="button" className="ui-btn ui-btn--on-ink" onClick={() => setStatus(focus.id, "checked in")}>
                {t("bm.checkedIn")}
              </button>
            )}
            {focus.status === "checked in" && (
              <button type="button" className="ui-btn ui-btn--on-ink" onClick={() => setStatus(focus.id, "in the chair")}>
                {t("cal.start")}
              </button>
            )}
            {focus.status === "in the chair" && (
              <Link className="ui-btn ui-btn--on-ink" to={`/app/checkout?booking=${focus.id}`}>
                {t("bm.done")}
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section className="next-card">
          <h1 className="next-card__name">{t("bm.free")}</h1>
          <p>{t("bm.nothing")}</p>
          <p>{t("bm.sendWalkIn")}</p>
        </section>
      )}

      {clockedIn && (
        <p className="app-quiet" role="status">
          {t("bm.clockedAt", { time: f.time(clockedIn) })}
        </p>
      )}
      <button type="button" className="ui-btn ui-btn--quiet ui-btn--block" onClick={() => setLate(true)} disabled={late}>
        {late ? t("bm.lateReady") : t("bm.late")}
      </button>

      <section aria-labelledby="day-title">
        <h2 id="day-title" className="app-h2">
          {t("bm.myDay")}
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
          {t("bm.taken")}
        </h2>
        <p className="num mode-barber__figure">{f.money(earned, { whole: true })}</p>
        <Link to="/app" className="app-more">
          {t("bm.fullApp")}
        </Link>
      </section>
    </div>
  );
}
