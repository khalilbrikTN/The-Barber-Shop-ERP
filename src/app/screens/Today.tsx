import { Link } from "react-router-dom";
import { BOOKABLE, clientById, NOW, serviceById, TODAY } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { PageHead, Region, Stat, Status, useDataState } from "../../ui/kit";
import { waitFor } from "./Queue";

export function Today() {
  const f = useFormat();
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
        title="Today"
        sub={`${f.day(NOW)}, ${f.time(NOW)}`}
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/app/queue">
              Add a walk-in
            </Link>
            <Link className="ui-btn ui-btn--primary" to="/app/calendar?new=1">
              New booking
            </Link>
          </>
        }
      />

      <section aria-labelledby="chairs-title" className="app-section">
        <h2 id="chairs-title" className="app-h2">
          Chairs now
        </h2>
        <Region
          state={state}
          label="Chairs"
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
          empty={{ title: "No one is working today", body: "Add working hours in Team to open the chairs.", action: <Link className="ui-btn ui-btn--quiet" to="/app/team">Open Team</Link> }}>
          <div className="chairs">
            {BOOKABLE.map((s, i) => {
              const mine = today.filter((b) => b.staffId === s.id);
              const current = mine.find((b) => b.status === "in the chair");
              const next = mine.find((b) => new Date(b.start).getTime() > now && b.status !== "cancelled");
              return (
                <article key={s.id} className="chair">
                  <header className="chair__head">
                    <span>Chair {i + 1}</span>
                    <strong>{s.name}</strong>
                  </header>
                  {current ? (
                    <div className="chair__now">
                      <span className="chair__label">In the chair</span>
                      <span className="chair__client">{clientById(current.clientId)?.name}</span>
                      <span>
                        {current.serviceIds.map((id) => serviceById(id).name).join(", ")}, done at {f.time(current.end)}
                      </span>
                    </div>
                  ) : (
                    <div className="chair__now chair__now--free">
                      <span className="chair__label">Free now</span>
                      <span className="chair__client">Open chair</span>
                    </div>
                  )}
                  <p className="chair__next">
                    {next ? (
                      <>
                        Next: <strong>{clientById(next.clientId)?.name}</strong> at {f.time(next.start)}
                      </>
                    ) : (
                      "Nothing else booked today"
                    )}
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
            Bookings today
          </h2>
          <Region state={state} label="Bookings" rows={6} empty={{ title: "No bookings today", body: "Share your booking link so clients can book themselves.", action: <Link className="ui-btn ui-btn--quiet" to="/app/website">Get the link</Link> }}>
            <div className="ui-tablewrap">
              <table className="ui-table ui-table--stack">
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Client</th>
                    <th scope="col">Service</th>
                    <th scope="col">With</th>
                    <th scope="col">Status</th>
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
              Walk-in queue
            </h2>
            <Region state={state} label="Queue" rows={3} empty={{ title: "No one waiting", body: "Walk-ins join from the QR code on your window or the kiosk." }}>
              <ol className="mini-queue">
                {queue.map((q, i) => (
                  <li key={q.id}>
                    <span className="mini-queue__pos num">{i + 1}</span>
                    <span>
                      <strong>{q.name}</strong> {serviceById(q.serviceId).name}
                    </span>
                    <span className="mini-queue__wait num">{waitFor(i, queue, bookings)} min</span>
                  </li>
                ))}
              </ol>
              <Link to="/app/queue" className="app-more">
                Open the queue
              </Link>
            </Region>
          </section>

          <section aria-labelledby="money-title" className="app-section">
            <h2 id="money-title" className="app-h2">
              Taken so far
            </h2>
            <Region state={state} label="Takings" rows={2} empty={{ title: "Nothing taken yet", body: "Sales show here as you check clients out." }}>
              <div className="ui-stats ui-stats--3">
                <Stat label="Cash" value={f.money(byMethod("cash"), { whole: true })} />
                <Stat label="Card" value={f.money(byMethod("card"), { whole: true })} />
                <Stat label="Wallet" value={f.money(byMethod("wallet"), { whole: true })} />
              </div>
              <p className="app-quiet">
                {done} of {today.length} bookings done.
              </p>
            </Region>
          </section>
        </div>
      </div>
    </>
  );
}
