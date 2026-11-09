import { useState } from "react";
import { STAFF, TODAY } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { Link } from "react-router-dom";
import { NotConnected, PageHead, Tabs, Toggle, useTab } from "../../ui/kit";
import { TextKey, useT } from "../i18n";

/** The shop's week, from its first day; the sample's TODAY is a Saturday. */
const DAYS = Array.from({ length: 7 }, (_, i) => new Date(new Date(`${TODAY}T12:00:00Z`).getTime() + i * 86400000).toISOString());
const PERMS: TextKey[] = ["perm.calendars", "perm.payments", "perm.refunds", "perm.reports", "perm.prices", "perm.export", "perm.settings"];
const ROLES: Record<string, boolean[]> = {
  Owner: [true, true, true, true, true, true, true],
  Manager: [true, true, true, true, true, false, false],
  "Front desk": [true, true, false, false, false, false, false],
  Barber: [false, true, false, false, false, false, false],
};

export function Team() {
  const tab = useTab("tab", "staff");
  const { t } = useT();
  return (
    <>
      <PageHead title={t("nav.team")} sub={t("team.sub")} actions={<button type="button" className="ui-btn ui-btn--primary">{t("team.add")}</button>} />
      <Tabs
        tabs={[
          { id: "staff", label: t("team.tabStaff") },
          { id: "hours", label: t("team.tabHours") },
          { id: "pay", label: t("team.tabPay") },
          { id: "timeoff", label: t("team.tabTimeOff") },
          { id: "roles", label: t("team.tabRoles") },
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
  const { t } = useT();
  return (
    <div className="ui-tablewrap">
      <table className="ui-table ui-table--stack">
        <thead>
          <tr>
            <th scope="col">{t("common.name")}</th>
            <th scope="col">{t("team.role")}</th>
            <th scope="col">{t("team.hours")}</th>
            <th scope="col">{t("team.link")}</th>
          </tr>
        </thead>
        <tbody>
          {STAFF.map((s) => (
            <tr key={s.id}>
              <th scope="row">
                <Link to={`/app/team/${s.id}`}>{s.name}</Link>
              </th>
              <td>{t(`role.${s.role}`)}</td>
              <td>{s.hours}</td>
              <td>{s.services.length ? <a href={`/b/${s.slug}`}>chairside.app/b/{s.slug}</a> : <span className="app-quiet">{t("team.notBookable")}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Hours() {
  const f = useFormat();
  const { t } = useT();
  const [who, setWho] = useState(STAFF[0].id);
  const [season, setSeason] = useState("normal");
  const [saved, setSaved] = useState(false);
  const base = season === "ramadan" ? ["12:00", "17:00", "20:30", "01:00"] : ["10:00", "20:00", "", ""];
  return (
    <section className="app-section" aria-labelledby="hours-title">
      <div className="cal-toolbar">
        <label className="cal-pick">
          <span>{t("team.member")}</span>
          <select className="ui-input" value={who} onChange={(e) => setWho(e.target.value)}>
            {STAFF.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="ui-seg" role="radiogroup" aria-label={t("team.schedule")}>
          {[
            { id: "normal", label: t("team.normal") },
            { id: "ramadan", label: t("team.ramadan") },
            { id: "summer", label: t("team.summer") },
          ].map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={season === s.id} className="ui-segbtn" onClick={() => setSeason(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <h2 id="hours-title" className="visually-hidden">
        {t("team.weekly")}
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
                <th scope="col">{t("money.day")}</th>
                <th scope="col">{t("team.works")}</th>
                <th scope="col">{t("team.from")}</th>
                <th scope="col">{t("team.to")}</th>
                <th scope="col">{t("team.second")}</th>
                <th scope="col">{t("team.to")}</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((iso, n) => {
                const off = n === 6; // the sample shop closes on Fridays
                const d = f.weekday(iso);
                return (
                  <tr key={`${who}-${season}-${n}`}>
                    <th scope="row">{d}</th>
                    <td>
                      <input type="checkbox" defaultChecked={!off} aria-label={t("team.worksOn", { day: f.weekday(iso, "long") })} />
                    </td>
                    {base.map((v, i) => (
                      <td key={i}>
                        <input type="time" className="ui-input ui-input--time" defaultValue={off ? "" : v} aria-label={t(i % 2 ? "team.dayTo" : "team.dayFrom", { day: f.weekday(iso, "long") })} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="app-quiet">{season === "ramadan" ? t("team.ramadanNote") : t("team.holidayNote")}</p>
        <button type="submit" className="ui-btn ui-btn--quiet">
          {t("team.saveHours")}
        </button>
        {saved && <NotConnected what={t("team.hoursThing")} />}
      </form>
    </section>
  );
}

function Pay() {
  const f = useFormat();
  const { t } = useT();
  const takings: Record<string, number> = { karim: 1850000, marco: 1240000, hana: 960000 };
  const tips: Record<string, number> = { karim: 90000, marco: 65000, hana: 40000 };
  return (
    <section className="app-section" aria-labelledby="pay-title">
      <h2 id="pay-title" className="app-h2">
        {t("team.payPeriod", { from: f.date("2026-12-01T12:00:00Z"), to: f.date("2026-12-11T12:00:00Z") })}
      </h2>
      <div className="ui-tablewrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th scope="col">{t("common.name")}</th>
              <th scope="col">{t("team.arrangement")}</th>
              <th scope="col" className="r">{t("team.taken")}</th>
              <th scope="col" className="r">{t("team.tips")}</th>
              <th scope="col" className="r">{t("team.theyGet")}</th>
              <th scope="col" className="r">{t("team.shopGets")}</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.filter((s) => s.services.length).map((s) => {
              const taken = takings[s.id] ?? 0;
              const tip = tips[s.id] ?? 0;
              const theirs = s.pay === "commission" ? Math.round(taken * (s.commission ?? 0)) + tip : s.pay === "booth rent" ? taken + tip : 0;
              const shop = s.pay === "commission" ? taken - Math.round(taken * (s.commission ?? 0)) : s.pay === "booth rent" ? s.rentMinor ?? 0 : taken;
              return (
                <tr key={s.id}>
                  <th scope="row">{s.name}</th>
                  <td>{s.pay === "commission" ? t("team.commission", { pct: f.pct(s.commission ?? 0) }) : s.pay === "booth rent" ? t("team.rent", { amount: f.money(s.rentMinor ?? 0, { whole: true }) }) : t("role.Owner")}</td>
                  <td className="r num">{f.money(taken, { whole: true })}</td>
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
      <p className="app-quiet">{t("team.tipsNote")}</p>
    </section>
  );
}

function TimeOff() {
  const { t, label } = useT();
  const [requests, setRequests] = useState([
    { id: "t1", who: "Marco", when: "24 to 26 December", why: "Family", status: "waiting" },
    { id: "t2", who: "Hana", when: "2 January", why: "Course", status: "approved" },
  ]);
  return (
    <div className="ui-tablewrap">
      <table className="ui-table">
        <thead>
          <tr>
            <th scope="col">{t("cal.who")}</th>
            <th scope="col">{t("common.when")}</th>
            <th scope="col">{t("team.why")}</th>
            <th scope="col">{t("common.status")}</th>
            <th scope="col">
              <span className="visually-hidden">{t("team.actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.who}</th>
              <td>{r.when}</td>
              <td>{r.why}</td>
              <td>{label("leave", r.status)}</td>
              <td className="r">
                {r.status === "waiting" && (
                  <span className="row-actions">
                    <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "approved" } : x)))}>
                      {t("team.approve")}
                    </button>
                    <button type="button" className="ui-btn ui-btn--text" onClick={() => setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "declined" } : x)))}>
                      {t("team.decline")}
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
  const { t, label } = useT();
  const [roles, setRoles] = useState(ROLES);
  const [custom, setCustom] = useState(false);
  return (
    <section className="app-section" aria-labelledby="roles-title">
      <h2 id="roles-title" className="app-h2">
        {t("team.rolesTitle")}
      </h2>
      <div className="ui-tablewrap">
        <table className="ui-table roles">
          <thead>
            <tr>
              <th scope="col">{t("team.permission")}</th>
              {Object.keys(roles).map((r) => (
                <th key={r} scope="col" className="c">
                  {label("role", r)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((p, i) => (
              <tr key={p}>
                <th scope="row">{t(p)}</th>
                {Object.entries(roles).map(([r, v]) => (
                  <td key={r} className="c">
                    <input
                      type="checkbox"
                      checked={v[i]}
                      disabled={r === "Owner"}
                      aria-label={t("team.can", { role: label("role", r), perm: t(p) })}
                      onChange={(e) => setRoles((rs) => ({ ...rs, [r]: rs[r].map((x, j) => (j === i ? e.target.checked : x)) }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toggle checked={custom} onChange={setCustom} label={t("team.seeEachOther")} />
    </section>
  );
}
