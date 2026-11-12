import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { slugify, useSession } from "../../lib/session";
import { COUNTRY_PRESETS, useSettings } from "../../lib/settings";
import { Field } from "../../ui/kit";
import { TextKey, useT } from "../i18n";

const TEMPLATES: Record<string, { name: TextKey; minutes: number }[]> = {
  barber: [
    { name: "tpl.haircut", minutes: 30 },
    { name: "tpl.fade", minutes: 30 },
    { name: "tpl.beard", minutes: 20 },
    { name: "tpl.cutBeard", minutes: 45 },
    { name: "tpl.shave", minutes: 30 },
    { name: "tpl.kids", minutes: 20 },
  ],
  salon: [
    { name: "tpl.cutDry", minutes: 60 },
    { name: "tpl.blowDry", minutes: 30 },
    { name: "tpl.roots", minutes: 90 },
    { name: "tpl.fullColour", minutes: 120 },
    { name: "tpl.highlights", minutes: 150 },
    { name: "tpl.fringe", minutes: 15 },
  ],
};

const STEPS: TextKey[] = ["setup.stepShop", "setup.stepServices", "setup.stepHours", "setup.stepTeam", "setup.stepDone"];

export function Setup() {
  const [params, setParams] = useSearchParams();
  const step = Number(params.get("step") ?? 0);
  const go = (n: number) => setParams({ step: String(n) });
  const { settings, update } = useSettings();
  const { t, label } = useT();
  const [type, setType] = useState<"barber" | "salon" | "unisex">("barber");
  const services = type === "unisex" ? [...TEMPLATES.barber.slice(0, 3), ...TEMPLATES.salon.slice(0, 3)] : TEMPLATES[type];
  const [picked, setPicked] = useState<string[]>([]);
  const [team, setTeam] = useState(["", ""]);
  const chosen = picked.length ? picked : services.map((s) => s.name as string);
  const { staff, updateStaff } = useSession();
  const last = STEPS.length - 1;

  // reaching the last step opens the app; going back to change something does not close it again
  useEffect(() => {
    if (step === last && staff && !staff.shopReady) updateStaff({ shopReady: true });
  }, [step, last, staff, updateStaff]);

  return (
    <div className="app-root setup">
      <header className="setup__top">
        <Link to="/" className="setup__mark">
          Chairside
        </Link>
        <ol className="setup__steps" aria-label={t("setup.steps")}>
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} data-done={i < step || undefined}>
              {t(s)}
            </li>
          ))}
        </ol>
      </header>

      <main className="setup__main">
        {step === 0 && (
          <section aria-labelledby="s0">
            <h1 id="s0">{t("setup.kind")}</h1>
            <Field label={t("set.shopName")}>{(id) => <input id={id} className="ui-input" value={settings.shopName} onChange={(e) => update({ shopName: e.target.value })} />}</Field>
            <fieldset className="ui-fieldset">
              <legend>{t("setup.type")}</legend>
              {[
                { id: "barber", label: t("setup.barber"), line: t("setup.barberLine") },
                { id: "salon", label: t("setup.salon"), line: t("setup.salonLine") },
                { id: "unisex", label: t("setup.both"), line: t("setup.bothLine") },
              ].map((k) => (
                <label key={k.id} className="ui-radio-card">
                  <input
                    type="radio"
                    name="type"
                    checked={type === k.id}
                    onChange={() => {
                      setType(k.id as typeof type);
                      setPicked([]);
                    }}
                  />
                  <span>
                    <strong>{k.label}</strong>
                    <span className="app-quiet">{k.line}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="s1">
            <h1 id="s1">{t("setup.start")}</h1>
            <p className="app-quiet">{t("setup.startHint")}</p>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">{t("common.services")}</legend>
              {services.map((s) => (
                <label key={s.name} className="ui-check">
                  <input
                    type="checkbox"
                    checked={chosen.includes(s.name)}
                    onChange={(e) => setPicked(e.target.checked ? [...chosen, s.name] : chosen.filter((x) => x !== s.name))}
                  />
                  <span>
                    {t("common.serviceMin", { name: t(s.name), n: s.minutes })}
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="s2">
            <h1 id="s2">{t("setup.where")}</h1>
            <Field label={t("set.country")} hint={t("setup.countryHint")}>
              {(id, hint) => (
                <select id={id} aria-describedby={hint} className="ui-input" defaultValue="Tunisia" onChange={(e) => update(COUNTRY_PRESETS[e.target.value])}>
                  {Object.keys(COUNTRY_PRESETS).map((c) => (
                    <option key={c} value={c}>
                      {label("country", c)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <div className="setup__row">
              <Field label={t("setup.opens")}>{(id) => <input id={id} type="time" className="ui-input" defaultValue="10:00" />}</Field>
              <Field label={t("setup.closes")}>{(id) => <input id={id} type="time" className="ui-input" defaultValue="21:00" />}</Field>
            </div>
            <Field label={t("setup.closedOn")}>
              {(id) => (
                <select id={id} className="ui-input" defaultValue="5">
                  {/* weekday numbers, Sunday = 0; names come from Intl in the staff's language */}
                  {[5, 0, 1].map((d) => (
                    <option key={d} value={d}>
                      {new Intl.DateTimeFormat(settings.locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 10, 1 + d)))}
                    </option>
                  ))}
                  <option value="-1">{t("setup.never")}</option>
                </select>
              )}
            </Field>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="s3">
            <h1 id="s3">{t("setup.who")}</h1>
            <p className="app-quiet">{t("setup.whoHint")}</p>
            {team.map((member, i) => (
              <Field key={i} label={t("setup.nameN", { n: i + 1 })}>
                {(id) => <input id={id} className="ui-input" value={member} onChange={(e) => setTeam((ts) => ts.map((x, j) => (j === i ? e.target.value : x)))} />}
              </Field>
            ))}
            <button type="button" className="ui-btn ui-btn--text" onClick={() => setTeam((ts) => [...ts, ""])}>
              {t("setup.another")}
            </button>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="s4">
            <h1 id="s4">{t("setup.live", { shop: settings.shopName })}</h1>
            <p>{t("setup.share")}</p>
            <p className="plate plate--link">
              <strong>{slugify(settings.shopName)}.chairside.app</strong>
            </p>
            <p className="app-quiet">{t("setup.preview")}</p>
            <div className="rebook">
              <Link className="ui-btn ui-btn--primary" to="/app">
                {t("setup.openToday")}
              </Link>
              <Link className="ui-btn ui-btn--quiet" to="/s/barbier-exemple">
                {t("setup.seePage")}
              </Link>
            </div>
          </section>
        )}

        {step < 4 && (
          <div className="setup__nav">
            {step > 0 && (
              <button type="button" className="ui-btn ui-btn--quiet" onClick={() => go(step - 1)}>
                {t("setup.back")}
              </button>
            )}
            <button type="button" className="ui-btn ui-btn--primary" onClick={() => go(step + 1)}>
              {step === 3 ? t("setup.finish") : t("setup.continue")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
