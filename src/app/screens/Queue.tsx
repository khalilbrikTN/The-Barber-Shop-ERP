import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Booking, BOOKABLE, clientById, NOW, QueueEntry, serviceById, SERVICES, staffById, WaitEntry } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, PageHead, Region, useDataState } from "../../ui/kit";
import { useT } from "../i18n";

/** Rough wait: minutes of work ahead, shared across the barbers, rounded up to 5. */
export function waitFor(index: number, queue: QueueEntry[], _bookings: Booking[]) {
  const ahead = queue.slice(0, index).reduce((m, q) => m + serviceById(q.serviceId).minutes, 0);
  const base = 6;
  return Math.max(5, Math.ceil((base + ahead / BOOKABLE.length) / 5) * 5);
}

export function Queue() {
  const f = useFormat();
  const { t } = useT();
  const state = useDataState();
  const { queue, bookings, addToQueue, callFromQueue, removeFromQueue, restoreQueue, waitlist, removeWaitlist } = useStore();
  const [left, setLeft] = useState<{ entry: QueueEntry; index: number } | null>(null);
  const [offered, setOffered] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [service, setService] = useState("fade");
  const [staff, setStaff] = useState("");
  const [called, setCalled] = useState<string | null>(null);
  const [error, setError] = useState("");
  const waitWindow = (w: WaitEntry) => {
    const day = f.day(f.at(w.day ?? NOW.slice(0, 10)), "short");
    return w.staffId ? t("queue.anyDayWith", { day, name: staffById(w.staffId).name }) : t("queue.anyDay", { day });
  };

  function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("queue.errName"));
      return;
    }
    setError("");
    addToQueue({ name: name.trim(), serviceId: service, staffId: staff || undefined, joined: NOW, via: "front desk" });
    setName("");
  }

  return (
    <>
      <PageHead
        title={t("nav.queue")}
        sub={t("queue.sub")}
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/tv">
              {t("queue.tv")}
            </Link>
            <Link className="ui-btn ui-btn--quiet" to="/kiosk">
              {t("queue.kiosk")}
            </Link>
          </>
        }
      />

      <div className="app-split app-split--wide">
        <section className="app-section" aria-labelledby="line-title">
          <h2 id="line-title" className="app-h2">
            {t("queue.inLine")}
          </h2>
          {called && (
            <p className="ui-live" role="status">
              {t("queue.called", { name: called })}
            </p>
          )}
          {left && (
            <p className="ui-live cal-panel__undo" role="status">
              <span>{t("queue.left", { name: left.entry.name })}</span>
              <button
                type="button"
                className="ui-btn ui-btn--text"
                onClick={() => {
                  restoreQueue(left.entry, left.index);
                  setLeft(null);
                }}
              >
                {t("common.undo")}
              </button>
            </p>
          )}
          <Region state={state} label={t("nav.queue")} rows={4} empty={{ title: t("queue.empty"), body: t("queue.emptyBody") }}>
            <ol className="queue">
              {queue.map((q, i) => (
                <li key={q.id} className="queue__row" data-first={i === 0 || undefined}>
                  <span className="queue__pos num">{i + 1}</span>
                  <div className="queue__who">
                    <strong>{q.name}</strong>
                    <span>
                      {t("common.list", { a: serviceById(q.serviceId).name, b: q.staffId ? t("queue.wants", { name: staffById(q.staffId).name }) : t("common.anyone") })}
                    </span>
                    <span className="app-quiet">
                      {t("queue.joined", { time: f.time(q.joined), via: t(`via.${q.via}` as const) })}
                    </span>
                  </div>
                  <span className="queue__wait num">
                    {waitFor(i, queue, bookings)}
                    <small>{t("common.min")}</small>
                  </span>
                  <div className="queue__actions">
                    <button
                      type="button"
                      className={i === 0 ? "ui-btn ui-btn--primary" : "ui-btn ui-btn--quiet"}
                      onClick={() => {
                        callFromQueue(q.id);
                        setCalled(q.name);
                      }}
                    >
                      {t("queue.call")}
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn--text"
                      onClick={() => {
                        setLeft({ entry: q, index: i });
                        removeFromQueue(q.id);
                      }}
                    >
                      {t("queue.leftBtn")}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </Region>

          <section className="app-section waitlist" id="waitlist" aria-labelledby="wait-title">
            <h2 id="wait-title" className="app-h2">
              {t("queue.waitlist")}
            </h2>
            {offered && (
              <p className="ui-live" role="status">
                {t("queue.offerReady", { name: offered })}
              </p>
            )}
            {waitlist.length === 0 ? (
              <div className="ui-note">
                <p className="ui-note__title">{t("queue.noWaitlist")}</p>
                <p>{t("queue.noWaitlistBody")}</p>
              </div>
            ) : (
              <ul className="rules">
                {waitlist.map((w) => (
                  <li key={w.id}>
                    <div>
                      <strong>{clientById(w.clientId)?.name}</strong>
                      <span className="app-quiet">
                        {t("common.list", { a: serviceById(w.serviceId).name, b: w.window ?? waitWindow(w) })}
                      </span>
                    </div>
                    <span className="row-actions">
                      <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setOffered(clientById(w.clientId)?.name ?? "")}>
                        {t("queue.offer")}
                      </button>
                      <button type="button" className="ui-btn ui-btn--text" onClick={() => removeWaitlist(w.id)}>
                        {t("common.remove")}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>

        <div className="app-stack">
          <section className="app-section app-panel" aria-labelledby="add-title">
            <h2 id="add-title" className="app-h2">
              {t("queue.add")}
            </h2>
            <form className="ui-form" onSubmit={add} noValidate>
              <Field label={t("common.name")}>
                {(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" aria-invalid={!!error || undefined} />}
              </Field>
              <Field label={t("common.service")}>
                {(id) => (
                  <select id={id} className="ui-input" value={service} onChange={(e) => setService(e.target.value)}>
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {t("common.serviceMin", { name: s.name, n: s.minutes })}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label={t("common.barber")}>
                {(id) => (
                  <select id={id} className="ui-input" value={staff} onChange={(e) => setStaff(e.target.value)}>
                    <option value="">{t("common.anyoneFree")}</option>
                    {BOOKABLE.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              {error && (
                <p className="ui-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="ui-btn ui-btn--quiet">
                {t("queue.addBtn")}
              </button>
            </form>
          </section>

          <section className="app-section app-panel" aria-labelledby="join-title">
            <h2 id="join-title" className="app-h2">
              {t("queue.how")}
            </h2>
            <dl className="ui-dl">
              <div>
                <dt>{t("queue.window")}</dt>
                <dd>{t("queue.windowBody")}</dd>
              </div>
              <div>
                <dt>{t("queue.home")}</dt>
                <dd>
                  <Link to="/s/barbier-exemple/queue">{t("queue.joinPage")}</Link> {t("queue.onSite")}
                </dd>
              </div>
              <div>
                <dt>{t("queue.door")}</dt>
                <dd>
                  <Link to="/kiosk">{t("queue.kioskMode")}</Link> {t("queue.onTablet")}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
