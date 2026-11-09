import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { staffById } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { PageHead, Region, useDataState } from "../../ui/kit";
import { useT } from "../i18n";

const SEGMENTS = ["All", "Regular", "VIP", "New", "Lapsed", "Colour"] as const;

export function Clients() {
  const f = useFormat();
  const { t, tp, label } = useT();
  const state = useDataState();
  const { clients, mergeClients } = useStore();
  const [confirming, setConfirming] = useState<string | null>(null);
  const digits = (x: string) => x.replace(/\D/g, "");
  const dupes = clients.flatMap((a, i) => clients.slice(i + 1).filter((b) => digits(b.phone) === digits(a.phone)).map((b) => [a, b] as const));
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const seg = params.get("segment") ?? "All";
  const tag = (x: string) => label("tag", x);

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
        title={t("nav.clients")}
        sub={tp("cl.count", clients.length)}
        actions={
          <>
            <Link className="ui-btn ui-btn--quiet" to="/app/clients/import">
              {t("cl.import")}
            </Link>
            <button type="button" className="ui-btn ui-btn--quiet">
              {t("cl.export")}
            </button>
          </>
        }
      />

      {dupes.map(([a, b]) => (
        <div key={`${a.id}-${b.id}`} className="ui-note dupe" role="status">
          <p className="ui-note__title">
            {t("cl.dupe", { a: a.name, b: b.name, phone: a.phone })}
          </p>
          <p>{t("cl.dupeBody", { a: a.name, b: b.name })}</p>
          {confirming === `${a.id}-${b.id}` ? (
            <span className="row-actions">
              <span className="dupe__ask">{t("cl.mergeAsk")}</span>
              <button
                type="button"
                className="ui-btn ui-btn--primary"
                onClick={() => {
                  mergeClients(a.id, b.id);
                  setConfirming(null);
                }}
              >
                {t("cl.mergeYes")}
              </button>
              <button type="button" className="ui-btn ui-btn--text" onClick={() => setConfirming(null)}>
                {t("cl.keepBoth")}
              </button>
            </span>
          ) : (
            <span className="row-actions">
              <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setConfirming(`${a.id}-${b.id}`)}>
                {t("cl.mergeInto", { name: a.name })}
              </button>
            </span>
          )}
        </div>
      ))}

      <div className="cal-toolbar">
        <label className="ui-search">
          <span className="visually-hidden">{t("cl.search")}</span>
          <input className="ui-input" type="search" placeholder={t("cl.searchPlaceholder")} value={q} onChange={(e) => set("q", e.target.value)} />
        </label>
        <div className="ui-seg" role="radiogroup" aria-label={t("cl.segment")}>
          {SEGMENTS.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={seg === s} className="ui-segbtn" onClick={() => set("segment", s === "All" ? "" : s)}>
              {tag(s)}
            </button>
          ))}
        </div>
      </div>

      <Region state={state} label={t("nav.clients")} rows={8} empty={{ title: t("cl.empty"), body: t("cl.emptyBody"), action: <Link className="ui-btn ui-btn--quiet" to="/app/clients/import">{t("cl.import")}</Link> }}>
        {rows.length === 0 ? (
          <div className="ui-note">
            <p className="ui-note__title">{t("cl.noMatch", { q })}</p>
            <p>{t("cl.noMatchBody")}</p>
          </div>
        ) : (
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">{t("common.name")}</th>
                  <th scope="col" className="opt">{t("common.phone")}</th>
                  <th scope="col" className="r">{t("cl.visits")}</th>
                  <th scope="col" className="r">{t("cl.spent")}</th>
                  <th scope="col" className="opt">{t("cl.lastVisit")}</th>
                  <th scope="col" className="opt">{t("cl.usual")}</th>
                  <th scope="col" className="r opt">{t("cl.noShows")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <th scope="row">
                      <Link to={`/app/clients/${c.id}`}>{c.name}</Link>
                      {(c.tags.length > 0 || c.blocked) && <span className="ui-tags">{[...(c.blocked ? ["Blocked"] : []), ...c.tags].map(tag).join(", ")}</span>}
                    </th>
                    <td className="num opt">{c.phone}</td>
                    <td className="r num">{c.visits}</td>
                    <td className="r num">{f.money(c.spentMinor, { whole: true })}</td>
                    <td className="opt">{c.lastVisit ? f.date(`${c.lastVisit}T12:00:00Z`) : t("cl.never")}</td>
                    <td className="opt">{c.favourite ? staffById(c.favourite).name : t("cl.anyone")}</td>
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
