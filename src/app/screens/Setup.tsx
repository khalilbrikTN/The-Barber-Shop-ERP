import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { COUNTRY_PRESETS, useSettings } from "../../lib/settings";
import { Field } from "../../ui/kit";

const TEMPLATES: Record<string, { name: string; minutes: number }[]> = {
  barber: [
    { name: "Haircut", minutes: 30 },
    { name: "Skin fade", minutes: 30 },
    { name: "Beard trim", minutes: 20 },
    { name: "Haircut and beard", minutes: 45 },
    { name: "Hot towel shave", minutes: 30 },
    { name: "Kids cut", minutes: 20 },
  ],
  salon: [
    { name: "Cut and blow-dry", minutes: 60 },
    { name: "Blow-dry", minutes: 30 },
    { name: "Root colour", minutes: 90 },
    { name: "Full colour", minutes: 120 },
    { name: "Highlights", minutes: 150 },
    { name: "Fringe trim", minutes: 15 },
  ],
};

const STEPS = ["Shop", "Services", "Hours", "Team", "Done"];

export function Setup() {
  const [params, setParams] = useSearchParams();
  const step = Number(params.get("step") ?? 0);
  const go = (n: number) => setParams({ step: String(n) });
  const { settings, update } = useSettings();
  const [type, setType] = useState<"barber" | "salon" | "unisex">("barber");
  const services = type === "unisex" ? [...TEMPLATES.barber.slice(0, 3), ...TEMPLATES.salon.slice(0, 3)] : TEMPLATES[type];
  const [picked, setPicked] = useState<string[]>([]);
  const [team, setTeam] = useState(["", ""]);
  const chosen = picked.length ? picked : services.map((s) => s.name);

  return (
    <div className="app-root setup">
      <header className="setup__top">
        <Link to="/" className="setup__mark">
          Chairside
        </Link>
        <ol className="setup__steps" aria-label="Setup steps">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} data-done={i < step || undefined}>
              {s}
            </li>
          ))}
        </ol>
      </header>

      <main className="setup__main">
        {step === 0 && (
          <section aria-labelledby="s0">
            <h1 id="s0">What kind of shop is it?</h1>
            <Field label="Shop name">{(id) => <input id={id} className="ui-input" value={settings.shopName} onChange={(e) => update({ shopName: e.target.value })} />}</Field>
            <fieldset className="ui-fieldset">
              <legend>Type</legend>
              {[
                { id: "barber", label: "Barbershop", line: "Short services, walk-ins, beards" },
                { id: "salon", label: "Hair salon", line: "Longer services, colour with processing time" },
                { id: "unisex", label: "Both", line: "One calendar for both" },
              ].map((t) => (
                <label key={t.id} className="ui-radio-card">
                  <input
                    type="radio"
                    name="type"
                    checked={type === t.id}
                    onChange={() => {
                      setType(t.id as typeof type);
                      setPicked([]);
                    }}
                  />
                  <span>
                    <strong>{t.label}</strong>
                    <span className="app-quiet">{t.line}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="s1">
            <h1 id="s1">Start from these services</h1>
            <p className="app-quiet">Untick what you do not offer. Prices and times can be changed later.</p>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">Services</legend>
              {services.map((s) => (
                <label key={s.name} className="ui-check">
                  <input
                    type="checkbox"
                    checked={chosen.includes(s.name)}
                    onChange={(e) => setPicked(e.target.checked ? [...chosen, s.name] : chosen.filter((x) => x !== s.name))}
                  />
                  <span>
                    {s.name}, {s.minutes} min
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="s2">
            <h1 id="s2">Where and when</h1>
            <Field label="Country" hint="Sets your currency, time zone and the public holidays that close your calendar.">
              {(id, hint) => (
                <select id={id} aria-describedby={hint} className="ui-input" defaultValue="Egypt" onChange={(e) => update(COUNTRY_PRESETS[e.target.value])}>
                  {Object.keys(COUNTRY_PRESETS).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
            </Field>
            <div className="setup__row">
              <Field label="Opens">{(id) => <input id={id} type="time" className="ui-input" defaultValue="10:00" />}</Field>
              <Field label="Closes">{(id) => <input id={id} type="time" className="ui-input" defaultValue="21:00" />}</Field>
            </div>
            <Field label="Closed on">
              {(id) => (
                <select id={id} className="ui-input" defaultValue="Friday">
                  {["Friday", "Sunday", "Monday", "Never"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              )}
            </Field>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="s3">
            <h1 id="s3">Who cuts here?</h1>
            <p className="app-quiet">Each person gets their own column in the calendar and their own booking link.</p>
            {team.map((t, i) => (
              <Field key={i} label={`Name ${i + 1}`}>
                {(id) => <input id={id} className="ui-input" value={t} onChange={(e) => setTeam((ts) => ts.map((x, j) => (j === i ? e.target.value : x)))} />}
              </Field>
            ))}
            <button type="button" className="ui-btn ui-btn--text" onClick={() => setTeam((t) => [...t, ""])}>
              Add another
            </button>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="s4">
            <h1 id="s4">{settings.shopName} is on the board</h1>
            <p>Share this link in your Instagram bio and on WhatsApp:</p>
            <p className="plate plate--link">
              <strong>example-barbers.chairside.app</strong>
            </p>
            <p className="app-quiet">This preview does not create an account yet; the next screens use sample data.</p>
            <div className="rebook">
              <Link className="ui-btn ui-btn--primary" to="/app">
                Open Today
              </Link>
              <Link className="ui-btn ui-btn--quiet" to="/s/example-barbers">
                See your page
              </Link>
            </div>
          </section>
        )}

        {step < 4 && (
          <div className="setup__nav">
            {step > 0 && (
              <button type="button" className="ui-btn ui-btn--quiet" onClick={() => go(step - 1)}>
                Back
              </button>
            )}
            <button type="button" className="ui-btn ui-btn--primary" onClick={() => go(step + 1)}>
              {step === 3 ? "Finish" : "Continue"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
