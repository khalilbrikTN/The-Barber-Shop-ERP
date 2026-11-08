import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { serviceById, staffById } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Stat, Status, Toggle } from "../../ui/kit";

const PUNCH_GOAL = 10;

export function ClientProfile() {
  const { id } = useParams();
  const f = useFormat();
  const { clients, bookings, updateClient } = useStore();
  const c = clients.find((x) => x.id === id);
  const [notes, setNotes] = useState(c?.notes ?? "");
  const [marketing, setMarketing] = useState(c?.marketing ?? false);
  const [saved, setSaved] = useState(false);
  const [birthday, setBirthday] = useState(c?.birthday ?? "");
  const [language, setLanguage] = useState(c?.language ?? "English");

  if (!c)
    return (
      <div className="ui-note">
        <p className="ui-note__title">That client does not exist</p>
        <p>They may have been merged with another profile.</p>
        <Link className="ui-btn ui-btn--quiet" to="/app/clients">
          Back to clients
        </Link>
      </div>
    );

  const history = bookings.filter((b) => b.clientId === c.id).sort((a, b) => b.start.localeCompare(a.start));
  const deposit = c.noShows >= 2;

  return (
    <>
      <PageHead
        title={c.name}
        sub={`${c.phone}${c.email ? `, ${c.email}` : ""}`}
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/app/clients">
              All clients
            </Link>
            <Link className="ui-btn ui-btn--primary" to={`/app/calendar?new=1`}>
              Book again
            </Link>
          </>
        }
      />

      <div className="ui-stats ui-stats--row">
        <Stat label="Visits" value={f.num(c.visits)} />
        <Stat label="Spent" value={f.money(c.spentMinor, { whole: true })} />
        <Stat label="No-shows" value={f.num(c.noShows)} sub={deposit ? "Deposit asked on every booking" : undefined} />
        <Stat label="Loyalty card" value={`${c.punches} of ${PUNCH_GOAL}`} sub={`${PUNCH_GOAL - c.punches} visits to a free cut`} />
      </div>

      <div className="app-split">
        <section className="app-section" aria-labelledby="hist-title">
          <h2 id="hist-title" className="app-h2">
            Visits
          </h2>
          {history.length === 0 ? (
            <div className="ui-note">
              <p className="ui-note__title">No visits in this sample</p>
              <p>Past visits from before the switch arrive with the CSV import.</p>
            </div>
          ) : (
            <div className="ui-tablewrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Service</th>
                    <th scope="col">With</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {f.date(b.start)}, {f.time(b.start)}
                      </td>
                      <td>{b.serviceIds.map((s) => serviceById(s).name).join(", ")}</td>
                      <td>{staffById(b.staffId).name}</td>
                      <td>
                        <Status value={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="app-section app-panel" aria-labelledby="notes-title">
          <h2 id="notes-title" className="app-h2">
            Haircut notes
          </h2>
          <form
            className="ui-form"
            onSubmit={(e) => {
              e.preventDefault();
              updateClient(c.id, { notes, marketing, birthday: birthday || undefined, language });
              setSaved(true);
            }}
          >
            <Field label="What the barber should know" hint="Shown on the barber's phone when the client checks in.">
              {(id, hint) => <textarea id={id} aria-describedby={hint} className="ui-input ui-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />}
            </Field>
            <div className="setup__row">
              <Field label="Birthday">{(id) => <input id={id} type="date" className="ui-input" value={birthday} onChange={(e) => setBirthday(e.target.value)} />}</Field>
              <Field label="Messages in">
                {(id) => (
                  <select id={id} className="ui-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {["English", "Arabic", "French", "Italian", "German"].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <Toggle checked={marketing} onChange={setMarketing} label="Agrees to offers by WhatsApp" />
            <p className="app-quiet">Before and after photos are added here once the client gives consent.</p>
            <button type="submit" className="ui-btn ui-btn--quiet">
              Save notes
            </button>
            {saved && <NotConnected what="client notes" />}
          </form>
          <div className="blocklist">
            <Toggle checked={!!c.blocked} onChange={(v) => updateClient(c.id, { blocked: v })} label="Block from online booking" />
            <p className="app-quiet">{c.blocked ? "They can still walk in; online bookings from this number are refused." : "Use for repeated no-shows or abuse."}</p>
          </div>
          <dl className="ui-dl">
            <div>
              <dt>Usual barber</dt>
              <dd>{c.favourite ? staffById(c.favourite).name : "Anyone"}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd>{c.tags.length ? c.tags.join(", ") : "None"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
