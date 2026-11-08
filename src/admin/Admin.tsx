import { useState } from "react";
import { Link } from "react-router-dom";
import { FLAGS, NOW, TENANTS } from "../lib/data";
import { useFormat } from "../lib/format";
import { PageHead, Status, Tabs, useTab } from "../ui/kit";

type LogRow = { at: string; who: string; what: string };

export function Admin() {
  const f = useFormat();
  const tab = useTab("tab", "shops");
  const [q, setQ] = useState("");
  const [flags, setFlags] = useState<Record<string, Record<string, boolean>>>(() =>
    Object.fromEntries(TENANTS.map((t) => [t.id, Object.fromEntries(FLAGS.map((fl, i) => [fl, i < 3 || t.plan === "Pro"]))])),
  );
  const [log, setLog] = useState<LogRow[]>([{ at: "2026-12-11T16:20:00+02:00", who: "Support", what: "Opened Example Friseur to fix a payment setting. The shop was told." }]);
  const [reason, setReason] = useState<Record<string, string>>({});

  const shops = TENANTS.filter((t) => !q || `${t.name} ${t.country} ${t.plan}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="app-root admin">
      <header className="admin__bar">
        <strong>Chairside admin</strong>
        <span>Staff only. Every action here is logged and shown to the shop.</span>
        <Link to="/app">Back to the shop app</Link>
      </header>
      <main className="app-main admin__main" id="admin-main">
        <PageHead title="Shops" sub={`${TENANTS.length} shops in this sample`} />
        <Tabs
          tabs={[
            { id: "shops", label: "Shops" },
            { id: "flags", label: "Features" },
            { id: "log", label: "Audit log" },
          ]}
        />
        {tab === "shops" && (
          <>
            <div className="cal-toolbar">
              <label className="ui-search">
                <span className="visually-hidden">Search shops</span>
                <input className="ui-input" type="search" placeholder="Name, country or plan" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <div className="ui-tablewrap">
              <table className="ui-table ui-table--stack admin__shops">
                <thead>
                  <tr>
                    <th scope="col">Shop</th>
                    <th scope="col">Country</th>
                    <th scope="col">Plan</th>
                    <th scope="col" className="r">Staff</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="r">Messages this month</th>
                    <th scope="col">Since</th>
                    <th scope="col">
                      <span className="visually-hidden">Support</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((t) => (
                    <tr key={t.id}>
                      <th scope="row">{t.name}</th>
                      <td>{t.country}</td>
                      <td>{t.plan}</td>
                      <td className="r num">{t.staff}</td>
                      <td>
                        <Status value={t.status} />
                      </td>
                      <td className="r num" data-warn={t.messages / t.allowance > 0.9 || undefined}>
                        {f.num(t.messages)} of {f.num(t.allowance)}
                      </td>
                      <td>{f.date(`${t.since}T12:00:00Z`)}</td>
                      <td className="r">
                        <form
                          className="admin__imp"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const why = (reason[t.id] ?? "").trim();
                            if (why.length < 8) return;
                            setLog((l) => [{ at: NOW, who: "You", what: `Opened ${t.name}: ${why}` }, ...l]);
                            setReason((r) => ({ ...r, [t.id]: "" }));
                          }}
                        >
                          <label className="visually-hidden" htmlFor={`why-${t.id}`}>
                            Reason for opening {t.name}
                          </label>
                          <input id={`why-${t.id}`} className="ui-input" placeholder="Why, for the log" value={reason[t.id] ?? ""} onChange={(e) => setReason((r) => ({ ...r, [t.id]: e.target.value }))} />
                          <button type="submit" className="ui-btn ui-btn--quiet" disabled={(reason[t.id] ?? "").trim().length < 8}>
                            Open as support
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="app-quiet">Opening a shop as support needs a reason. The shop sees it in their own log.</p>
          </>
        )}
        {tab === "flags" && (
          <div className="ui-tablewrap">
            <table className="ui-table roles">
              <thead>
                <tr>
                  <th scope="col">Shop</th>
                  {FLAGS.map((fl) => (
                    <th key={fl} scope="col" className="c">
                      {fl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TENANTS.map((t) => (
                  <tr key={t.id}>
                    <th scope="row">
                      {t.name}
                      <span className="ui-tags">{t.plan} plan</span>
                    </th>
                    {FLAGS.map((fl) => (
                      <td key={fl} className="c">
                        <input
                          type="checkbox"
                          checked={flags[t.id][fl]}
                          onChange={(e) => {
                            setFlags((all) => ({ ...all, [t.id]: { ...all[t.id], [fl]: e.target.checked } }));
                            setLog((l) => [{ at: NOW, who: "You", what: `${e.target.checked ? "Turned on" : "Turned off"} ${fl} for ${t.name}` }, ...l]);
                          }}
                          aria-label={`${fl} for ${t.name}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "log" && (
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Who</th>
                  <th scope="col">What</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l, i) => (
                  <tr key={i}>
                    <td>
                      {f.date(l.at)}, {f.time(l.at)}
                    </td>
                    <th scope="row">{l.who}</th>
                    <td>{l.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="app-quiet admin__note">Sample shops and figures. Nothing here touches a real account.</p>
      </main>
    </div>
  );
}
