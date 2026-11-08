import { Link, useSearchParams } from "react-router-dom";
import { staffById } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { PageHead, Region, useDataState } from "../../ui/kit";

const SEGMENTS = ["All", "Regular", "VIP", "New", "Lapsed", "Colour"];

export function Clients() {
  const f = useFormat();
  const state = useDataState();
  const { clients, mergeClients } = useStore();
  const digits = (x: string) => x.replace(/\D/g, "");
  const dupes = clients.flatMap((a, i) => clients.slice(i + 1).filter((b) => digits(b.phone) === digits(a.phone)).map((b) => [a, b] as const));
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const seg = params.get("segment") ?? "All";

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };

  const rows = clients
    .filter((c) => seg === "All" || c.tags.includes(seg))
    .filter((c) => !q || `${c.name} ${c.phone} ${c.email ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHead
        title="Clients"
        sub={`${f.num(clients.length)} clients`}
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/app/clients/import">
              Import from CSV
            </Link>
            <button type="button" className="ui-btn ui-btn--quiet">
              Export all
            </button>
          </>
        }
      />

      {dupes.map(([a, b]) => (
        <div key={`${a.id}-${b.id}`} className="ui-note dupe" role="status">
          <p className="ui-note__title">
            {a.name} and {b.name} share the phone number {a.phone}
          </p>
          <p>Merging keeps {a.name}, adds the visits and spend of {b.name}, and moves their bookings across.</p>
          <span className="row-actions">
            <button type="button" className="ui-btn ui-btn--quiet" onClick={() => mergeClients(a.id, b.id)}>
              Merge into {a.name}
            </button>
          </span>
        </div>
      ))}

      <div className="cal-toolbar">
        <label className="ui-search">
          <span className="visually-hidden">Search clients</span>
          <input className="ui-input" type="search" placeholder="Name, phone or email" value={q} onChange={(e) => set("q", e.target.value)} />
        </label>
        <div className="ui-seg" role="radiogroup" aria-label="Segment">
          {SEGMENTS.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={seg === s} className="ui-segbtn" onClick={() => set("segment", s === "All" ? "" : s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <Region state={state} label="Clients" rows={8} empty={{ title: "No clients yet", body: "Clients are added when they book. Bring your list from another app with a CSV.", action: <Link className="ui-btn ui-btn--quiet" to="/app/clients/import">Import from CSV</Link> }}>
        {rows.length === 0 ? (
          <div className="ui-note">
            <p className="ui-note__title">No client matches “{q}”</p>
            <p>Check the spelling, or search by phone number.</p>
          </div>
        ) : (
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col" className="opt">Phone</th>
                  <th scope="col" className="r">Visits</th>
                  <th scope="col" className="r">Spent</th>
                  <th scope="col" className="opt">Last visit</th>
                  <th scope="col" className="opt">Usual barber</th>
                  <th scope="col" className="r opt">No-shows</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <th scope="row">
                      <Link to={`/app/clients/${c.id}`}>{c.name}</Link>
                      {(c.tags.length > 0 || c.blocked) && <span className="ui-tags">{[...(c.blocked ? ["Blocked"] : []), ...c.tags].join(", ")}</span>}
                    </th>
                    <td className="num opt">{c.phone}</td>
                    <td className="r num">{c.visits}</td>
                    <td className="r num">{f.money(c.spentMinor, { whole: true })}</td>
                    <td className="opt">{c.lastVisit ? f.date(`${c.lastVisit}T12:00:00Z`) : "Never"}</td>
                    <td className="opt">{c.favourite ? staffById(c.favourite).name : "Anyone"}</td>
                    <td className="r num opt" data-warn={c.noShows > 1 || undefined}>
                      {c.noShows}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Region>
    </>
  );
}
