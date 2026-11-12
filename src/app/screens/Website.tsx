import { ChangeEvent, useEffect, useState } from "react";
import { PHOTO_TYPES, readPhoto } from "../../lib/photo";
import { loadSite, saveSite, SiteConfig } from "../../lib/site";
import { photoMessage } from "../photoError";
import { useSettings } from "../../lib/settings";
import { Field, PageHead, Toggle } from "../../ui/kit";
import { TextKey, useT } from "../i18n";

const PRESETS: { id: SiteConfig["preset"]; label: TextKey; line: TextKey }[] = [
  { id: "board", label: "web.presetBoard", line: "web.presetBoardLine" },
  { id: "paper", label: "web.presetPaper", line: "web.presetPaperLine" },
  { id: "signal", label: "web.presetSignal", line: "web.presetSignalLine" },
];
const ACCENTS: SiteConfig["accent"][] = ["cobalt", "green", "red", "ink"];

export function Website() {
  const { t } = useT();
  const { settings } = useSettings();
  const [site, setSite] = useState<SiteConfig>(loadSite);
  const [version, setVersion] = useState(0);
  const [logoError, setLogoError] = useState("");
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState(false);
  const [consent, setConsent] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const embedCode = `<iframe id="chairside-book" src="${window.location.origin}/s/barbier-exemple/book?embed=1" title="${t("web.iframeTitle", { shop: settings.shopName }).replace(/"/g, "&quot;")}" style="width:100%;height:760px;border:0"></iframe>\n<script>addEventListener("message",function(e){if(e.data&&e.data.chairside==="height"){document.getElementById("chairside-book").style.height=e.data.height+"px"}})</script>`;

  useEffect(() => {
    if (!saveSite(site)) setPhotoError(t("web.storageFull"));
    setVersion((v) => v + 1);
  }, [site]);

  function addPhoto(e: ChangeEvent<HTMLInputElement>, use: (src: string) => void) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    readPhoto(file).then(
      (src) => {
        setPhotoError("");
        use(src);
      },
      (err) => setPhotoError(t(photoMessage(err))),
    );
  }

  const set = (p: Partial<SiteConfig>) => setSite((s) => ({ ...s, ...p }));
  const sec = (k: keyof SiteConfig["sections"], v: boolean) => setSite((s) => ({ ...s, sections: { ...s.sections, [k]: v } }));

  return (
    <>
      <PageHead
        title={t("nav.website")}
        sub={t("web.sub")}
        actions={
          <a className="ui-btn ui-btn--quiet" href="/s/barbier-exemple" target="_blank" rel="noreferrer">
            {t("web.open")}
          </a>
        }
      />
      <div className="site-editor">
        <form className="ui-form site-editor__form" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="ui-fieldset">
            <legend>{t("web.style")}</legend>
            {PRESETS.map((p) => (
              <label key={p.id} className="ui-radio-card">
                <input type="radio" name="preset" checked={site.preset === p.id} onChange={() => set({ preset: p.id })} />
                <span>
                  <strong>{t(p.label)}</strong>
                  <span className="app-quiet">{t(p.line)}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className="ui-fieldset">
            <legend>{t("web.accent")}</legend>
            <div className="swatches">
              {ACCENTS.map((a) => (
                <label key={a} className="swatch" data-accent={a}>
                  <input type="radio" name="accent" checked={site.accent === a} onChange={() => set({ accent: a })} />
                  <span className="swatch__chip" aria-hidden="true" />
                  <span>{t(`accent.${a}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label={t("web.logo")} hint={t("web.logoHint")}>
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
                    setLogoError(t("web.logoBig"));
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
              {t("web.removeLogo")}
            </button>
          )}
          <Field label={t("web.about")}>{(id) => <input id={id} className="ui-input" value={site.about} onChange={(e) => set({ about: e.target.value })} />}</Field>
          <Field label={t("web.aboutAr")} hint={t("web.aboutArHint")}>
            {(id, hint) => <input id={id} aria-describedby={hint} className="ui-input" dir="rtl" lang="ar" value={site.aboutAr ?? ""} onChange={(e) => set({ aboutAr: e.target.value })} />}
          </Field>
          <Field label={t("web.aboutFr")}>
            {(id) => <input id={id} className="ui-input" lang="fr" value={site.aboutFr ?? ""} onChange={(e) => set({ aboutFr: e.target.value })} />}
          </Field>
          <Field label={t("web.address")}>{(id) => <input id={id} className="ui-input" value={site.address} onChange={(e) => set({ address: e.target.value, area: e.target.value })} />}</Field>
          <Field label={t("web.whatsapp")}>{(id) => <input id={id} className="ui-input" type="tel" value={site.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />}</Field>
          <Field label={t("web.instagram")}>{(id) => <input id={id} className="ui-input" value={site.instagram} onChange={(e) => set({ instagram: e.target.value })} />}</Field>
          <fieldset className="ui-fieldset">
            <legend>{t("web.photosTitle")}</legend>
            <p className="ui-field__label">{t("web.hero")}</p>
            {site.hero ? <img className="photo-hero" src={site.hero} alt="" /> : <p className="app-quiet">{t("web.noHero")}</p>}
            <Field label={t("web.heroUpload")} hint={t("web.heroHint")}>
              {(id, hint) => <input id={id} aria-describedby={hint} className="ui-file" type="file" accept={PHOTO_TYPES} onChange={(e) => addPhoto(e, (src) => set({ hero: src }))} />}
            </Field>
            {site.hero && (
              <button type="button" className="ui-btn ui-btn--text" onClick={() => set({ hero: undefined })}>
                {t("web.removeHero")}
              </button>
            )}
            <p className="ui-field__label">{t("web.gallery")}</p>
            <p className="app-quiet">{t("web.galleryHint")}</p>
            {site.gallery.length === 0 ? (
              <p className="app-quiet">{t("web.galleryEmpty")}</p>
            ) : (
              <ul className="photo-list">
                {site.gallery.map((p, i) => (
                  <li key={`${i}-${p.src.slice(-24)}`} className="photo-row">
                    <img src={p.src} alt="" />
                    <div className="photo-row__body">
                      <label className="visually-hidden" htmlFor={`alt-${i}`}>
                        {t("web.altFor", { n: i + 1 })}
                      </label>
                      <input id={`alt-${i}`} className="ui-input" value={p.alt} placeholder={t("web.altLabel")} onChange={(e) => set({ gallery: site.gallery.map((g, j) => (j === i ? { ...g, alt: e.target.value } : g)) })} />
                      <span className="row-actions">
                        <button type="button" className="ui-btn ui-btn--text" disabled={site.hero === p.src} onClick={() => set({ hero: p.src })}>
                          {t("web.makeHero")}
                        </button>
                        <button type="button" className="ui-btn ui-btn--text" aria-label={t("web.removePhoto", { n: i + 1 })} onClick={() => set({ gallery: site.gallery.filter((_, j) => j !== i) })}>
                          {t("common.remove")}
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Toggle checked={consent} onChange={setConsent} label={t("web.consent")} />
            <Field label={t("web.addPhoto")}>
              {(id) => <input id={id} className="ui-file" type="file" accept={PHOTO_TYPES} disabled={!consent} onChange={(e) => addPhoto(e, (src) => set({ gallery: [...site.gallery, { src, alt: "" }] }))} />}
            </Field>
            {photoError && (
              <p className="ui-error" role="alert">
                {photoError}
              </p>
            )}
          </fieldset>
          <fieldset className="ui-fieldset">
            <legend>{t("web.sections")}</legend>
            <Toggle checked={site.sections.services} onChange={(v) => sec("services", v)} label={t("web.secServices")} />
            <Toggle checked={site.sections.team} onChange={(v) => sec("team", v)} label={t("web.secTeam")} />
            <Toggle checked={site.sections.offers} onChange={(v) => sec("offers", v)} label={t("web.secOffers")} />
            <Toggle checked={site.sections.gallery} onChange={(v) => sec("gallery", v)} label={t("web.secGallery")} />
            <Toggle checked={site.sections.hours} onChange={(v) => sec("hours", v)} label={t("web.secHours")} />
            <Toggle checked={site.sections.find} onChange={(v) => sec("find", v)} label={t("web.secFind")} />
          </fieldset>
          <fieldset className="ui-fieldset">
            <legend>{t("web.address2")}</legend>
            <p>
              <strong>barbier-exemple.chairside.app</strong>
            </p>
            <Field label={t("web.domain")} hint={t("web.domainHint")}>
              {(id, hint) => <input id={id} aria-describedby={hint} className="ui-input" value={domain} onChange={(e) => setDomain(e.target.value.trim().toLowerCase())} placeholder="book.yourshop.com" dir="ltr" />}
            </Field>
            {domain && (
              <div className="dns">
                <p>{t("web.dnsAdd")}</p>
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("web.dnsType")}</th>
                      <th scope="col">{t("web.dnsName")}</th>
                      <th scope="col">{t("web.dnsPoints")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CNAME</td>
                      <td className="num">{domain.split(".")[0]}</td>
                      <td className="num">shops.chairside.app</td>
                    </tr>
                  </tbody>
                </table>
                <p className="app-quiet">{t("web.dnsStatus")}</p>
              </div>
            )}
          </fieldset>
          <fieldset className="ui-fieldset">
            <legend>{t("web.embed")}</legend>
            <p className="app-quiet">{t("web.embedHint")}</p>
            <textarea className="ui-input ui-textarea embed-code" readOnly rows={5} value={embedCode} aria-label={t("web.embedLabel")} onFocus={(e) => e.target.select()} />
            <div className="rebook">
              <button
                type="button"
                className="ui-btn ui-btn--quiet"
                onClick={() => {
                  navigator.clipboard?.writeText(embedCode).then(
                    () => setCopied(true),
                    () => setCopied(false),
                  );
                }}
              >
                {copied ? t("sp.copied") : t("web.copyCode")}
              </button>
              <a className="ui-btn ui-btn--text" href="/s/barbier-exemple/book?embed=1" target="_blank" rel="noreferrer">
                {t("web.preview")}
              </a>
            </div>
          </fieldset>
        </form>
        <div className="site-editor__preview">
          <p className="ui-field__label">{t("web.live")}</p>
          <iframe key={version} title={t("web.frame")} src="/s/barbier-exemple?preview=1" className="site-frame" />
        </div>
      </div>
    </>
  );
}
