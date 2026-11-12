import { useState } from "react";
import { Link } from "react-router-dom";
import { at, FLAGS, NOW, TENANTS, Tenant } from "../lib/data";
import { useFormat } from "../lib/format";
import { PageHead, Status, Tabs, useTab } from "../ui/kit";

type LogRow = { at: string; who: string; what: string };

const PLAN: Record<Tenant["plan"], string> = { Free: "Gratuit", Solo: "Solo", Shop: "Salon", Pro: "Pro" };

/** What each plan includes, as on /pricing: queue and deposits from Salon, domain and the AI beta on Pro. */
function flagForPlan(flag: string, plan: string) {
  if (flag === "Messages WhatsApp") return true;
  if (flag === "File sans rendez-vous" || flag === "Acomptes en ligne") return plan === "Shop" || plan === "Pro";
  return plan === "Pro";
}

export function Admin() {
  const f = useFormat();
  const tab = useTab("tab", "shops");
  const [q, setQ] = useState("");
  const [flags, setFlags] = useState<Record<string, Record<string, boolean>>>(() =>
    Object.fromEntries(TENANTS.map((t) => [t.id, Object.fromEntries(FLAGS.map((fl) => [fl, flagForPlan(fl, t.plan)]))])),
  );
  const [log, setLog] = useState<LogRow[]>([{ at: at("16:20", "2026-12-11"), who: "Support", what: "Ouvert Barbier Exemple, Bizerte pour corriger un réglage de paiement. Le salon a été prévenu." }]);
  const [reason, setReason] = useState<Record<string, string>>({});

  const shops = TENANTS.filter((t) => !q || `${t.name} ${t.country} ${PLAN[t.plan]}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="app-root admin">
      <header className="admin__bar">
        <strong>Administration Chairside</strong>
        <span>Réservé à l’équipe. Chaque action ici est journalisée et montrée au salon.</span>
        <Link to="/app">Retour à l’application du salon</Link>
      </header>
      <main className="app-main admin__main" id="admin-main">
        <PageHead title="Salons" sub={`${TENANTS.length} salons dans cet exemple`} />
        <Tabs
          tabs={[
            { id: "shops", label: "Salons" },
            { id: "flags", label: "Fonctionnalités" },
            { id: "log", label: "Journal" },
          ]}
        />
        {tab === "shops" && (
          <>
            <div className="cal-toolbar">
              <label className="ui-search">
                <span className="visually-hidden">Rechercher un salon</span>
                <input className="ui-input" type="search" placeholder="Nom, ville ou formule" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <div className="ui-tablewrap">
              <table className="ui-table ui-table--stack admin__shops">
                <thead>
                  <tr>
                    <th scope="col">Salon</th>
                    <th scope="col">Pays</th>
                    <th scope="col">Formule</th>
                    <th scope="col" className="r">Équipe</th>
                    <th scope="col">Statut</th>
                    <th scope="col" className="r">Messages ce mois-ci</th>
                    <th scope="col">Depuis</th>
                    <th scope="col">
                      <span className="visually-hidden">Support</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((t) => (
                    <tr key={t.id}>
                      <th scope="row">{t.name}</th>
                      <td data-label="Pays">{t.country}</td>
                      <td data-label="Formule">{PLAN[t.plan]}</td>
                      <td className="r num" data-label="Équipe">{t.staff}</td>
                      <td data-label="Statut">
                        <Status value={t.status} />
                      </td>
                      <td className="r num" data-label="Messages" data-warn={t.messages / t.allowance > 0.9 || undefined}>
                        {f.num(t.messages)} sur {f.num(t.allowance)}
                      </td>
                      <td data-label="Depuis">{f.date(`${t.since}T12:00:00Z`)}</td>
                      <td className="r">
                        <form
                          className="admin__imp"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const why = (reason[t.id] ?? "").trim();
                            if (why.length < 8) return;
                            setLog((l) => [{ at: NOW, who: "Vous", what: `Ouvert ${t.name} : ${why}` }, ...l]);
                            setReason((r) => ({ ...r, [t.id]: "" }));
                          }}
                        >
                          <label className="visually-hidden" htmlFor={`why-${t.id}`}>
                            Motif pour ouvrir {t.name}
                          </label>
                          <input id={`why-${t.id}`} className="ui-input" placeholder="Pourquoi, pour le journal" value={reason[t.id] ?? ""} onChange={(e) => setReason((r) => ({ ...r, [t.id]: e.target.value }))} />
                          <button type="submit" className="ui-btn ui-btn--quiet" disabled={(reason[t.id] ?? "").trim().length < 8}>
                            Ouvrir en tant que support
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="app-quiet">Ouvrir un salon en tant que support demande un motif. Le salon le voit dans son propre journal.</p>
          </>
        )}
        {tab === "flags" && (
          <div className="ui-tablewrap">
            <table className="ui-table roles">
              <thead>
                <tr>
                  <th scope="col">Salon</th>
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
                      <span className="ui-tags">Formule {PLAN[t.plan]}</span>
                    </th>
                    {FLAGS.map((fl) => (
                      <td key={fl} className="c">
                        <input
                          type="checkbox"
                          checked={flags[t.id][fl]}
                          onChange={(e) => {
                            setFlags((all) => ({ ...all, [t.id]: { ...all[t.id], [fl]: e.target.checked } }));
                            setLog((l) => [{ at: NOW, who: "Vous", what: `${e.target.checked ? "Activé" : "Désactivé"} : ${fl} pour ${t.name}` }, ...l]);
                          }}
                          aria-label={`${fl} pour ${t.name}`}
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
                  <th scope="col">Quand</th>
                  <th scope="col">Qui</th>
                  <th scope="col">Quoi</th>
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
        <p className="app-quiet admin__note">Salons et chiffres d’exemple. Rien ici ne touche un vrai compte.</p>
      </main>
    </div>
  );
}
