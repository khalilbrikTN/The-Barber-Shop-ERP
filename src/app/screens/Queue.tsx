import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Booking, BOOKABLE, clientById, NOW, QueueEntry, serviceById, SERVICES, staffById } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, PageHead, Region, useDataState } from "../../ui/kit";

/** Rough wait: minutes of work ahead, shared across the barbers, rounded up to 5. */
export function waitFor(index: number, queue: QueueEntry[], _bookings: Booking[]) {
  const ahead = queue.slice(0, index).reduce((m, q) => m + serviceById(q.serviceId).minutes, 0);
  const base = 6;
  return Math.max(5, Math.ceil((base + ahead / BOOKABLE.length) / 5) * 5);
}

export function Queue() {
  const f = useFormat();
  const state = useDataState();
  const { queue, bookings, addToQueue, callFromQueue, removeFromQueue, waitlist, removeWaitlist } = useStore();
  const [offered, setOffered] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [service, setService] = useState("fade");
  const [staff, setStaff] = useState("");
  const [called, setCalled] = useState<string | null>(null);
  const [error, setError] = useState("");

  function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Add a name so the board can call them.");
      return;
    }
    setError("");
    addToQueue({ name: name.trim(), serviceId: service, staffId: staff || undefined, joined: NOW, via: "front desk" });
    setName("");
  }

  return (
    <>
      <PageHead
        title="Queue"
        sub="Walk-ins in the order they will be called. Bookings keep their times."
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/tv">
              Open the TV board
            </Link>
            <Link className="ui-btn ui-btn--quiet" to="/kiosk">
              Open the kiosk
            </Link>
          </>
        }
      />

      <div className="app-split app-split--wide">
        <section className="app-section" aria-labelledby="line-title">
          <h2 id="line-title" className="app-h2">
            In line
          </h2>
          {called && (
            <p className="ui-live" role="status">
              {called} called. A message went to their phone.
            </p>
          )}
          <Region state={state} label="Queue" rows={4} empty={{ title: "No one waiting", body: "Add a walk-in here, or let clients join from the QR code on your window." }}>
            <ol className="queue">
              {queue.map((q, i) => (
                <li key={q.id} className="queue__row" data-first={i === 0 || undefined}>
                  <span className="queue__pos num">{i + 1}</span>
                  <div className="queue__who">
                    <strong>{q.name}</strong>
                    <span>
                      {serviceById(q.serviceId).name}, {q.staffId ? `wants ${staffById(q.staffId).name}` : "anyone"}
                    </span>
                    <span className="app-quiet">
                      Joined {f.time(q.joined)} by {q.via}
                    </span>
                  </div>
                  <span className="queue__wait num">
                    {waitFor(i, queue, bookings)}
                    <small>min</small>
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
                      Call
                    </button>
                    <button type="button" className="ui-btn ui-btn--text" onClick={() => removeFromQueue(q.id)}>
                      Left
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </Region>

          <section className="app-section waitlist" id="waitlist" aria-labelledby="wait-title">
            <h2 id="wait-title" className="app-h2">
              Waitlist for later today
            </h2>
            {offered && (
              <p className="ui-live" role="status">
                Offer ready for {offered}: “A time opened up today. Reply 1 to take it.” WhatsApp is not connected yet, so nothing was sent.
              </p>
            )}
            {waitlist.length === 0 ? (
              <div className="ui-note">
                <p className="ui-note__title">Nobody is waiting for a time</p>
                <p>Clients join the waitlist when the day they want is full.</p>
              </div>
            ) : (
              <ul className="rules">
                {waitlist.map((w) => (
                  <li key={w.id}>
                    <div>
                      <strong>{clientById(w.clientId)?.name}</strong>
                      <span className="app-quiet">
                        {serviceById(w.serviceId).name}, {w.window}
                      </span>
                    </div>
                    <span className="row-actions">
                      <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setOffered(clientById(w.clientId)?.name ?? "")}>
                        Offer a time
                      </button>
                      <button type="button" className="ui-btn ui-btn--text" onClick={() => removeWaitlist(w.id)}>
                        Remove
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
              Add a walk-in
            </h2>
            <form className="ui-form" onSubmit={add} noValidate>
              <Field label="Name">
                {(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" aria-invalid={!!error || undefined} />}
              </Field>
              <Field label="Service">
                {(id) => (
                  <select id={id} className="ui-input" value={service} onChange={(e) => setService(e.target.value)}>
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}, {s.minutes} min
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Barber">
                {(id) => (
                  <select id={id} className="ui-input" value={staff} onChange={(e) => setStaff(e.target.value)}>
                    <option value="">Anyone free</option>
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
                Add to the queue
              </button>
            </form>
          </section>

          <section className="app-section app-panel" aria-labelledby="join-title">
            <h2 id="join-title" className="app-h2">
              How clients join
            </h2>
            <dl className="ui-dl">
              <div>
                <dt>From the window</dt>
                <dd>Print the QR code from Settings. It opens the join page.</dd>
              </div>
              <div>
                <dt>From home</dt>
                <dd>
                  <Link to="/s/example-barbers/queue">The join page</Link> on your website.
                </dd>
              </div>
              <div>
                <dt>At the door</dt>
                <dd>
                  <Link to="/kiosk">Kiosk mode</Link> on a tablet.
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
