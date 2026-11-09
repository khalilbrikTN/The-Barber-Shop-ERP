import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { serviceById, staffById } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Stat, Status, Toggle } from "../../ui/kit";
import { useT } from "../i18n";

const PUNCH_GOAL = 10;

export function ClientProfile() {
  const { id } = useParams();
  const f = useFormat();
  const { t, tp, label } = useT();
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
        <p className="ui-note__title">{t("cp.missing")}</p>
        <p>{t("cp.missingBody")}</p>
        <Link className="ui-btn ui-btn--quiet" to="/app/clients">
          {t("cp.back")}
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
              {t("cp.all")}
            </Link>
            <Link className="ui-btn ui-btn--primary" to={`/app/calendar?new=1`}>
              {t("cp.again")}
            </Link>
          </>
        }
      />

      <div className="ui-stats ui-stats--row">
        <Stat label={t("cl.visits")} value={f.num(c.visits)} />
        <Stat label={t("cl.spent")} value={f.money(c.spentMinor, { whole: true })} />
        <Stat label={t("cl.noShows")} value={f.num(c.noShows)} sub={deposit ? t("cp.depositRule") : undefined} />
        <Stat label={t("cp.loyalty")} value={t("cp.punches", { n: f.num(c.punches), goal: f.num(PUNCH_GOAL) })} sub={tp("cp.toFree", PUNCH_GOAL - c.punches)} />
      </div>

      <div className="app-split">
        <section className="app-section" aria-labelledby="hist-title">
          <h2 id="hist-title" className="app-h2">
            {t("cl.visits")}
          </h2>
          {history.length === 0 ? (
            <div className="ui-note">
              <p className="ui-note__title">{t("cp.noVisits")}</p>
              <p>{t("cp.noVisitsBody")}</p>
            </div>
          ) : (
            <div className="ui-tablewrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th scope="col">{t("common.date")}</th>
                    <th scope="col">{t("common.service")}</th>
                    <th scope="col">{t("common.with")}</th>
                    <th scope="col">{t("common.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id}>
                      <td>{t("cp.dateTime", { date: f.date(b.start), time: f.time(b.start) })}</td>
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
            {t("cp.notes")}
          </h2>
          <form
            className="ui-form"
            onSubmit={(e) => {
              e.preventDefault();
              updateClient(c.id, { notes, marketing, birthday: birthday || undefined, language });
              setSaved(true);
            }}
          >
            <Field label={t("cp.notesLabel")} hint={t("cp.notesHint")}>
              {(id, hint) => <textarea id={id} aria-describedby={hint} className="ui-input ui-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />}
            </Field>
            <div className="setup__row">
              <Field label={t("cp.birthday")}>{(id) => <input id={id} type="date" className="ui-input" value={birthday} onChange={(e) => setBirthday(e.target.value)} />}</Field>
              <Field label={t("cp.messagesIn")}>
                {(id) => (
                  <select id={id} className="ui-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {(["English", "Arabic", "French", "Italian", "German"] as const).map((l) => (
                      <option key={l} value={l}>
                        {t(`lang.${l}`)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <Toggle checked={marketing} onChange={setMarketing} label={t("cp.consent")} />
            <p className="app-quiet">{t("cp.photos")}</p>
            <button type="submit" className="ui-btn ui-btn--quiet">
              {t("cp.save")}
            </button>
            {saved && <NotConnected what={t("cp.thing")} />}
          </form>
          <div className="blocklist">
            <Toggle checked={!!c.blocked} onChange={(v) => updateClient(c.id, { blocked: v })} label={t("cp.block")} />
            <p className="app-quiet">{c.blocked ? t("cp.blockedNote") : t("cp.blockHint")}</p>
          </div>
          <dl className="ui-dl">
            <div>
              <dt>{t("cl.usual")}</dt>
              <dd>{c.favourite ? staffById(c.favourite).name : t("cl.anyone")}</dd>
            </div>
            <div>
              <dt>{t("cp.tags")}</dt>
              <dd>{c.tags.length ? c.tags.map((x) => label("tag", x)).join(", ") : t("common.none")}</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
