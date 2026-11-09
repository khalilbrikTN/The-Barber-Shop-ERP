import { Link } from "react-router-dom";
import { BOOKABLE, clientById, NOW, serviceById, TODAY } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { PageHead, Region, Rich, Stat, Status, useDataState } from "../../ui/kit";
import { useT } from "../i18n";
import { waitFor } from "./Queue";

export function Today() {
  const f = useFormat();
  const { t, tp } = useT();
  const state = useDataState();
  const { bookings, queue, sales } = useStore();
  const today = bookings.filter((b) => b.start.startsWith(TODAY) && b.status !== "blocked").sort((a, b) => a.start.localeCompare(b.start));
  const now = new Date(NOW).getTime();
  const todaySales = sales.filter((s) => s.time.startsWith(TODAY));
  const byMethod = (m: string) => todaySales.filter((s) => s.method === m).reduce((t, s) => t + s.lines.reduce((a, l) => a + l.minor, 0) + s.tipMinor, 0);
  const done = today.filter((b) => b.status === "done").length;

  return (
    <>
      <PageHead
        title={t("nav.today")}
        sub={`${f.day(NOW)}, ${f.time(NOW)}`}
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/app/queue">
              {t("today.addWalkIn")}
            </Link>
            <Link className="ui-btn ui-btn--primary" to="/app/calendar?new=1">
              {t("today.newBooking")}
            </Link>
          </>
        }
      />

      <section aria-labelledby="chairs-title" className="app-section">
        <h2 id="chairs-title" className="app-h2">
          {t("today.chairs")}
        </h2>
        <Region
          state={state}
          label={t("today.chairsLabel")}
          skeleton={
            <div className="chairs">
              {BOOKABLE.map((s) => (
                <div key={s.id} className="chair">
                  <span className="chair__skel" />
                  <span className="chair__skel chair__skel--plate" />
                </div>
              ))}
            </div>
          }
          empty={{ title: t("today.noOne"), body: t("today.noOneBody"), action: <Link className="ui-btn ui-btn--quiet" to="/app/team">{t("today.openTeam")}</Link> }}>
          <div className="chairs">
            {BOOKABLE.map((s, i) => {
              const mine = today.filter((b) => b.staffId === s.id);
              const current = mine.find((b) => b.status === "in the chair");
              const next = mine.find((b) => new Date(b.start).getTime() > now && b.status !== "cancelled");
              return (
                <article key={s.id} className="chair">
                  <header className="chair__head">
                    <span>{t("today.chair", { n: i + 1 })}</span>
                    <strong>{s.name}</strong>
                  </header>
                  {current ? (
                    <div className="chair__now">
                      <span className="chair__label">{t("today.inChair")}</span>
                      <span className="chair__client">{clientById(current.clientId)?.name}</span>
                      <span>
                        {t("today.doneAt", { services: current.serviceIds.map((id) => serviceById(id).name).join(", "), time: f.time(current.end) })}
                      </span>
                    </div>
                  ) : (
                    <div className="chair__now chair__now--free">
                      <span className="chair__label">{t("today.freeNow")}</span>
                      <span className="chair__client">{t("today.openChair")}</span>
                    </div>
                  )}
                  <p className="chair__next">
                    {next ? <Rich text={t("today.next", { name: clientById(next.clientId)?.name ?? "", time: f.time(next.start) })} /> : t("today.nothingElse")}
                  </p>
                </article>
              );
            })}
          </div>
        </Region>
      </section>

      <div className="app-split">
        <section aria-labelledby="day-title" className="app-section">
          <h2 id="day-title" className="app-h2">
            {t("today.bookings")}
          </h2>
          <Region state={state} label={t("today.bookingsLabel")} rows={6} empty={{ title: t("today.noBookings"), body: t("today.noBookingsBody"), action: <Link className="ui-btn ui-btn--quiet" to="/app/website">{t("today.getLink")}</Link> }}>
            <div className="ui-tablewrap">
              <table className="ui-table ui-table--stack">
                <thead>
                  <tr>
                    <th scope="col">{t("common.time")}</th>
                    <th scope="col">{t("common.client")}</th>
                    <th scope="col">{t("common.service")}</th>
                    <th scope="col">{t("common.with")}</th>
                    <th scope="col">{t("common.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {today.map((b) => (
                    <tr key={b.id} data-now={b.status === "in the chair" || undefined}>
                      <td className="num">{f.time(b.start)}</td>
                      <th scope="row">
                        <Link to={`/app/clients/${b.clientId}`}>{clientById(b.clientId)?.name}</Link>
                      </th>
                      <td>{b.serviceIds.map((id) => serviceById(id).name).join(", ")}</td>
                      <td>{BOOKABLE.find((s) => s.id === b.staffId)?.name}</td>
                      <td>
                        <Status value={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Region>
        </section>

        <div className="app-stack">
          <section aria-labelledby="queue-title" className="app-section">
            <h2 id="queue-title" className="app-h2">
              {t("today.queue")}
            </h2>
            <Region state={state} label={t("today.queueLabel")} rows={3} empty={{ title: t("today.noWaiting"), body: t("today.noWaitingBody") }}>
              <ol className="mini-queue">
                {queue.map((q, i) => (
                  <li key={q.id}>
                    <span className="mini-queue__pos num">{i + 1}</span>
                    <span>
                      <strong>{q.name}</strong> {serviceById(q.serviceId).name}
                    </span>
                    <span className="mini-queue__wait num">{t("common.minutes", { n: waitFor(i, queue, bookings) })}</span>
                  </li>
                ))}
              </ol>
              <Link to="/app/queue" className="app-more">
                {t("today.openQueue")}
              </Link>
            </Region>
          </section>

          <section aria-labelledby="money-title" className="app-section">
            <h2 id="money-title" className="app-h2">
              {t("today.taken")}
            </h2>
            <Region state={state} label={t("today.takenLabel")} rows={2} empty={{ title: t("today.nothingTaken"), body: t("today.nothingTakenBody") }}>
              <div className="ui-stats ui-stats--3">
                <Stat label={t("method.cash")} value={f.money(byMethod("cash"), { whole: true })} />
                <Stat label={t("method.card")} value={f.money(byMethod("card"), { whole: true })} />
                <Stat label={t("method.wallet")} value={f.money(byMethod("wallet"), { whole: true })} />
              </div>
              <p className="app-quiet">
                {done === 0 ? tp("today.doneOf", 0) : tp("today.doneOf", today.length, { done })}
              </p>
            </Region>
          </section>
        </div>
      </div>
    </>
  );
}
