import { useEffect, useState } from "react";
import { loadSite, saveSite, SiteConfig } from "../../lib/site";
import { Field, PageHead, Toggle } from "../../ui/kit";

const PRESETS: { id: SiteConfig["preset"]; label: string; line: string }[] = [
  { id: "board", label: "Board", line: "Ink header, the queue and hours set like a station sign." },
  { id: "paper", label: "Paper", line: "Light and quiet, prices set large." },
  { id: "signal", label: "Signal", line: "A cobalt field up top, for a shop that wants to be seen." },
];
const ACCENTS: SiteConfig["accent"][] = ["cobalt", "green", "red", "ink"];

export function Website() {
  const [site, setSite] = useState<SiteConfig>(loadSite);
  const [version, setVersion] = useState(0);
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    saveSite(site);
    setVersion((v) => v + 1);
  }, [site]);

  const set = (p: Partial<SiteConfig>) => setSite((s) => ({ ...s, ...p }));
  const sec = (k: keyof SiteConfig["sections"], v: boolean) => setSite((s) => ({ ...s, sections: { ...s.sections, [k]: v } }));

  return (
    <>
      <PageHead
        title="Website"
        sub="Your shop's own page, with no other shops on it."
        actions={
          <a className="ui-btn ui-btn--quiet" href="/s/example-barbers" target="_blank" rel="noreferrer">
            Open the live page
          </a>
        }
      />
      <div className="site-editor">
        <form className="ui-form site-editor__form" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="ui-fieldset">
            <legend>Style</legend>
            {PRESETS.map((p) => (
              <label key={p.id} className="ui-radio-card">
                <input type="radio" name="preset" checked={site.preset === p.id} onChange={() => set({ preset: p.id })} />
                <span>
                  <strong>{p.label}</strong>
                  <span className="app-quiet">{p.line}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className="ui-fieldset">
            <legend>Accent colour</legend>
            <div className="swatches">
              {ACCENTS.map((a) => (
                <label key={a} className="swatch" data-accent={a}>
                  <input type="radio" name="accent" checked={site.accent === a} onChange={() => set({ accent: a })} />
                  <span className="swatch__chip" aria-hidden="true" />
                  <span>{a[0].toUpperCase() + a.slice(1)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Logo" hint="PNG, JPG or SVG, under 200 KB. Square or wide both work.">
            {(id, hint) => (
              <input
                id={id}
                aria-describedby={hint}
                className="ui-file"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 200 * 1024) {
                    setLogoError("That file is over 200 KB. Export a smaller version and try again.");
                    return;
                  }
                  setLogoError("");
                  const reader = new FileReader();
                  reader.onload = () => set({ logo: String(reader.result) });
                  reader.readAsDataURL(file);
                }}
              />
            )}
          </Field>
          {logoError && <p className="ui-error">{logoError}</p>}
          {site.logo && (
            <button type="button" className="ui-btn ui-btn--text" onClick={() => set({ logo: undefined })}>
              Remove the logo
            </button>
          )}
          <Field label="One line about the shop">{(id) => <input id={id} className="ui-input" value={site.about} onChange={(e) => set({ about: e.target.value })} />}</Field>
          <Field label="Address">{(id) => <input id={id} className="ui-input" value={site.address} onChange={(e) => set({ address: e.target.value, area: e.target.value })} />}</Field>
          <Field label="WhatsApp number">{(id) => <input id={id} className="ui-input" type="tel" value={site.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />}</Field>
          <Field label="Instagram">{(id) => <input id={id} className="ui-input" value={site.instagram} onChange={(e) => set({ instagram: e.target.value })} />}</Field>
          <fieldset className="ui-fieldset">
            <legend>Sections</legend>
            <Toggle checked={site.sections.services} onChange={(v) => sec("services", v)} label="Services and prices" />
            <Toggle checked={site.sections.team} onChange={(v) => sec("team", v)} label="Team" />
            <Toggle checked={site.sections.offers} onChange={(v) => sec("offers", v)} label="Offers" />
            <Toggle checked={site.sections.hours} onChange={(v) => sec("hours", v)} label="Opening hours" />
            <Toggle checked={site.sections.find} onChange={(v) => sec("find", v)} label="How to find us" />
          </fieldset>
          <fieldset className="ui-fieldset">
            <legend>Address on the web</legend>
            <p>
              <strong>example-barbers.chairside.app</strong>
            </p>
            <p className="app-quiet">Your own domain, such as book.yourshop.com, comes with the Pro plan.</p>
          </fieldset>
          <p className="app-quiet">Photos of your work and your shop are added here once you upload them.</p>
        </form>
        <div className="site-editor__preview">
          <p className="ui-field__label">Live preview</p>
          <iframe key={version} title="Website preview" src="/s/example-barbers?preview=1" className="site-frame" />
        </div>
      </div>
    </>
  );
}
