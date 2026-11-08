import { useState } from "react";
import { STAFF } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { Link } from "react-router-dom";
import { NotConnected, PageHead, Tabs, Toggle, useTab } from "../../ui/kit";

const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const PERMS = ["See all calendars", "Take payments", "Give refunds", "See money reports", "Edit prices", "Export clients", "Change settings"];
const ROLES: Record<string, boolean[]> = {
  Owner: [true, true, true, true, true, true, true],
  Manager: [true, true, true, true, true, false, false],
  "Front desk": [true, true, false, false, false, false, false],
  Barber: [false, true, false, false, false, false, false],
};

export function Team() {
  const tab = useTab("tab", "staff");
  return (
    <>
      <PageHead title="Team" sub="Who works when, and how they are paid." actions={<button type="button" className="ui-btn ui-btn--primary">Add a team member</button>} />
      <Tabs
        tabs={[
          { id: "staff", label: "Staff" },
          { id: "hours", label: "Hours" },
          { id: "pay", label: "Pay" },
          { id: "timeoff", label: "Time off" },
          { id: "roles", label: "Roles" },
        ]}
      />
      <div className="app-tabpanel" role="tabpanel">
        {tab === "staff" && <StaffList />}
        {tab === "hours" && <Hours />}
        {tab === "pay" && <Pay />}
        {tab === "timeoff" && <TimeOff />}
        {tab === "roles" && <Roles />}
      </div>
    </>
  );
}

function StaffList() {
  return (
    <div className="ui-tablewrap">
      <table className="ui-table ui-table--stack">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Hours</th>
            <th scope="col">Booking link</th>
          </tr>
        </thead>
        <tbody>
          {STAFF.map((s) => (
            <tr key={s.id}>
              <th scope="row">
                <Link to={`/app/team/${s.id}`}>{s.name}</Link>
              </th>
              <td>{s.role}</td>
              <td>{s.hours}</td>
              <td>{s.services.length ? <a href={`/b/${s.slug}`}>chairside.app/b/{s.slug}</a> : <span className="app-quiet">Not bookable</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Hours() {
  const [who, setWho] = useState(STAFF[0].id);
  const [season, setSeason] = useState("normal");
  const [saved, setSaved] = useState(false);
  const base = season === "ramadan" ? ["12:00", "17:00", "20:30", "01:00"] : ["10:00", "20:00", "", ""];
  return (
    <section className="app-section" aria-labelledby="hours-title">
      <div className="cal-toolbar">
        <label className="cal-pick">
          <span>Team member</span>
          <select className="ui-input" value={who} onChange={(e) => setWho(e.target.value)}>
            {STAFF.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="ui-seg" role="radiogroup" aria-label="Schedule">
          {[
            { id: "normal", label: "Normal hours" },
            { id: "ramadan", label: "Ramadan hours" },
            { id: "summer", label: "Summer hours" },
          ].map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={season === s.id} className="ui-segbtn" onClick={() => setSeason(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <h2 id="hours-title" className="visually-hidden">
        Weekly hours
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <div className="ui-tablewrap">
          <table className="ui-table hours">
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Works</th>
                <th scope="col">From</th>
                <th scope="col">To</th>
                <th scope="col">Second shift from</th>
                <th scope="col">To</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d) => {
                const off = d === "Fri";
                return (
                  <tr key={`${who}-${season}-${d}`}>
                    <th scope="row">{d}</th>
                    <td>
                      <input type="checkbox" defaultChecked={!off} aria-label={`Works on ${d}`} />
                    </td>
                    {base.map((v, i) => (
                      <td key={i}>
                        <input type="time" className="ui-input ui-input--time" defaultValue={off ? "" : v} aria-label={`${d} ${i % 2 ? "to" : "from"}`} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="app-quiet">{season === "ramadan" ? "Ramadan hours run from the dates set in Settings, then normal hours come back on their own." : "Public holidays for your country close the calendar automatically."}</p>
        <button type="submit" className="ui-btn ui-btn--quiet">
          Save hours
        </button>
        {saved && <NotConnected what="hours" />}
      </form>
    </section>
  );
}

function Pay() {
  const f = useFormat();
  const takings: Record<string, number> = { karim: 1850000, marco: 1240000, hana: 960000 };
  const tips: Record<string, number> = { karim: 90000, marco: 65000, hana: 40000 };
  return (
    <section className="app-section" aria-labelledby="pay-title">
      <h2 id="pay-title" className="app-h2">
        December 1 to 11
      </h2>
      <div className="ui-tablewrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Arrangement</th>
              <th scope="col" className="r">Services taken</th>
              <th scope="col" className="r">Tips</th>
              <th scope="col" className="r">They get</th>
              <th scope="col" className="r">Shop gets</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.filter((s) => s.services.length).map((s) => {
              const t = takings[s.id] ?? 0;
              const tip = tips[s.id] ?? 0;
              const theirs = s.pay === "commission" ? Math.round(t * (s.commission ?? 0)) + tip : s.pay === "booth rent" ? t + tip : 0;
              const shop = s.pay === "commission" ? t - Math.round(t * (s.commission ?? 0)) : s.pay === "booth rent" ? s.rentMinor ?? 0 : t;
              return (
                <tr key={s.id}>
                  <th scope="row">{s.name}</th>
                  <td>{s.pay === "commission" ? `${f.pct(s.commission ?? 0)} commission` : s.pay === "booth rent" ? `Chair rent, ${f.money(s.rentMinor ?? 0, { whole: true })} a month` : "Owner"}</td>
                  <td className="r num">{f.money(t, { whole: true })}</td>
                  <td className="r num">{f.money(tip, { whole: true })}</td>
                  <td className="r num">
                    <strong>{f.money(theirs, { whole: true })}</strong>
                  </td>
                  <td className="r num">{f.money(shop, { whole: true })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="app-quiet">Tips go to the barber in full. Chair rent is invoiced on the 1st.</p>
    </section>
  );
}

function TimeOff() {
  const [requests, setRequests] = useState([
    { id: "t1", who: "Marco", when: "24 to 26 December", why: "Family", status: "waiting" },
    { id: "t2", who: "Hana", when: "2 January", why: "Course", status: "approved" },
  ]);
  return (
    <div className="ui-tablewrap">
      <table className="ui-table">
        <thead>
          <tr>
            <th scope="col">Who</th>
            <th scope="col">When</th>
            <th scope="col">Why</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.who}</th>
              <td>{r.when}</td>
              <td>{r.why}</td>
              <td>{r.status}</td>
              <td className="r">
                {r.status === "waiting" && (
                  <span className="row-actions">
                    <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "approved" } : x)))}>
                      Approve
                    </button>
                    <button type="button" className="ui-btn ui-btn--text" onClick={() => setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "declined" } : x)))}>
                      Decline
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Roles() {
  const [roles, setRoles] = useState(ROLES);
  const [custom, setCustom] = useState(false);
  return (
    <section className="app-section" aria-labelledby="roles-title">
      <h2 id="roles-title" className="app-h2">
        What each role can do
      </h2>
      <div className="ui-tablewrap">
        <table className="ui-table roles">
          <thead>
            <tr>
              <th scope="col">Permission</th>
              {Object.keys(roles).map((r) => (
                <th key={r} scope="col" className="c">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((p, i) => (
              <tr key={p}>
                <th scope="row">{p}</th>
                {Object.entries(roles).map(([r, v]) => (
                  <td key={r} className="c">
                    <input
                      type="checkbox"
                      checked={v[i]}
                      disabled={r === "Owner"}
                      aria-label={`${r} can ${p.toLowerCase()}`}
                      onChange={(e) => setRoles((rs) => ({ ...rs, [r]: rs[r].map((x, j) => (j === i ? e.target.checked : x)) }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toggle checked={custom} onChange={setCustom} label="Barbers can see each other's calendars" />
    </section>
  );
}
