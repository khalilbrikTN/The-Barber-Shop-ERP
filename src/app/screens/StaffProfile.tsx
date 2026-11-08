import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SERVICES, STAFF, TODAY } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Stat } from "../../ui/kit";

export function StaffProfile() {
  const { id } = useParams();
  const f = useFormat();
  const { bookings } = useStore();
  const s = STAFF.find((x) => x.id === id);
  const [bio, setBio] = useState(s ? `${s.name} has cut at the shop since it opened.` : "");
  const [does, setDoes] = useState<string[]>(s?.services ?? []);
  const [overrides, setOverrides] = useState<Record<string, { price?: string; minutes?: string }>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!s)
    return (
      <div className="ui-note">
        <p className="ui-note__title">No one on the team has that link</p>
        <Link className="ui-btn ui-btn--quiet" to="/app/team">
          Back to Team
        </Link>
      </div>
    );

  const link = `${window.location.origin}/b/${s.slug}`;
  const today = bookings.filter((b) => b.staffId === s.id && b.start.startsWith(TODAY) && b.status !== "cancelled" && b.status !== "blocked");
  const bookedMin = today.reduce((m, b) => m + (new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000, 0);

  return (
    <>
      <PageHead
        title={s.name}
        sub={`${s.role}. ${s.hours}.`}
        actions={
          <Link className="ui-btn ui-btn--quiet" to="/app/team">
            All of the team
          </Link>
        }
      />

      <div className="ui-stats ui-stats--row">
        <Stat label="Booked today" value={`${today.length}`} />
        <Stat label="Chair time booked" value={`${Math.floor(bookedMin / 60)} h ${Math.round(bookedMin % 60)} min`} />
        <Stat label="Pay" value={s.pay === "commission" ? f.pct(s.commission ?? 0) : s.pay === "booth rent" ? "Chair rent" : s.pay === "salary" ? "Salary" : "Owner"} />
      </div>

      <div className="app-split">
        <form
          className="app-section"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <h2 className="app-h2">What {s.name} does, and at what price</h2>
          <p className="app-quiet">Leave a price or time empty to use the shop’s. A senior barber can charge more for the same cut.</p>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Does it</th>
                  <th scope="col">Service</th>
                  <th scope="col" className="r">Shop price</th>
                  <th scope="col" className="r">{s.name}'s price</th>
                  <th scope="col" className="r">{s.name}'s minutes</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((sv) => {
                  const on = does.includes(sv.id);
                  return (
                    <tr key={sv.id}>
                      <td>
                        <input type="checkbox" checked={on} onChange={(e) => setDoes((d) => (e.target.checked ? [...d, sv.id] : d.filter((x) => x !== sv.id)))} aria-label={`${s.name} does ${sv.name}`} />
                      </td>
                      <th scope="row">{sv.name}</th>
                      <td className="r num">{f.money(sv.priceMinor, { whole: true })}</td>
                      <td className="r">
                        <input
                          className="ui-input ui-input--short num"
                          inputMode="decimal"
                          disabled={!on}
                          placeholder={String(sv.priceMinor / 100)}
                          value={overrides[sv.id]?.price ?? ""}
                          onChange={(e) => setOverrides((o) => ({ ...o, [sv.id]: { ...o[sv.id], price: e.target.value } }))}
                          aria-label={`${s.name}'s price for ${sv.name}`}
                        />
                      </td>
                      <td className="r">
                        <input
                          className="ui-input ui-input--short num"
                          type="number"
                          min={5}
                          step={5}
                          disabled={!on}
                          placeholder={String(sv.minutes)}
                          value={overrides[sv.id]?.minutes ?? ""}
                          onChange={(e) => setOverrides((o) => ({ ...o, [sv.id]: { ...o[sv.id], minutes: e.target.value } }))}
                          aria-label={`${s.name}'s minutes for ${sv.name}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rebook">
            <button type="submit" className="ui-btn ui-btn--primary">
              Save
            </button>
          </div>
          {saved && <NotConnected what="the team member" />}
        </form>

        <section className="app-section app-panel" aria-labelledby="pub-title">
          <h2 id="pub-title" className="app-h2">
            On the website
          </h2>
          <Field label="A line about them">{(fid) => <textarea id={fid} className="ui-input ui-textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />}</Field>
          <p className="app-quiet">Their photo is added here once you upload one.</p>
          <div className="ui-field">
            <span className="ui-field__label">Personal booking link, for their Instagram bio</span>
            <p className="plate plate--link">
              <strong>chairside.app/b/{s.slug}</strong>
            </p>
          </div>
          <div className="rebook">
            <button
              type="button"
              className="ui-btn ui-btn--quiet"
              onClick={() => {
                navigator.clipboard?.writeText(link).then(
                  () => setCopied(true),
                  () => setCopied(false),
                );
              }}
            >
              {copied ? "Copied" : "Copy the link"}
            </button>
            <a className="ui-btn ui-btn--text" href={`/b/${s.slug}`}>
              Open it
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
