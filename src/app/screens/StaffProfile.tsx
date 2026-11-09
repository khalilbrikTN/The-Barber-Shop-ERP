import { ChangeEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SERVICES, STAFF, TODAY } from "../../lib/data";
import { minorDigits, useFormat } from "../../lib/format";
import { PHOTO_TYPES, readPhoto } from "../../lib/photo";
import { useStore } from "../../lib/store";
import { photoMessage } from "../photoError";
import { Field, NotConnected, PageHead, Stat } from "../../ui/kit";
import { useT } from "../i18n";

export function StaffProfile() {
  const { id } = useParams();
  const f = useFormat();
  const { t } = useT();
  const { bookings } = useStore();
  const s = STAFF.find((x) => x.id === id);
  const [bio, setBio] = useState(s ? t("sp.bio", { name: s.name }) : "");
  const [does, setDoes] = useState<string[]>(s?.services ?? []);
  const [overrides, setOverrides] = useState<Record<string, { price?: string; minutes?: string }>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photo, setPhoto] = useState(s?.photo);
  const [photoError, setPhotoError] = useState("");
  const [photoChanged, setPhotoChanged] = useState(false);

  function changePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    readPhoto(file, 800).then(
      (src) => {
        setPhoto(src);
        setPhotoError("");
        setPhotoChanged(true);
      },
      (err) => setPhotoError(t(photoMessage(err))),
    );
  }

  if (!s)
    return (
      <div className="ui-note">
        <p className="ui-note__title">{t("sp.missing")}</p>
        <Link className="ui-btn ui-btn--quiet" to="/app/team">
          {t("sp.back")}
        </Link>
      </div>
    );

  const link = `${window.location.origin}/b/${s.slug}`;
  const today = bookings.filter((b) => b.staffId === s.id && b.start.startsWith(TODAY) && b.status !== "cancelled" && b.status !== "blocked");
  const bookedMin = today.reduce((m, b) => m + (new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000, 0);

  return (
    <>
      <PageHead
        title={s.name}
        sub={t("sp.sub", { role: t(`role.${s.role}`), hours: s.hours })}
        actions={
          <Link className="ui-btn ui-btn--quiet" to="/app/team">
            {t("sp.all")}
          </Link>
        }
      />

      <div className="ui-stats ui-stats--row">
        <Stat label={t("sp.bookedToday")} value={f.num(today.length)} />
        <Stat label={t("sp.chairTime")} value={t("sp.hm", { h: Math.floor(bookedMin / 60), m: Math.round(bookedMin % 60) })} />
        <Stat label={t("sp.pay")} value={s.pay === "commission" ? f.pct(s.commission ?? 0) : s.pay === "booth rent" ? t("sp.chairRent") : s.pay === "salary" ? t("sp.salary") : t("role.Owner")} />
      </div>

      <div className="app-split">
        <form
          className="app-section"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <h2 className="app-h2">{t("sp.does", { name: s.name })}</h2>
          <p className="app-quiet">{t("sp.doesHint")}</p>
          <div className="ui-tablewrap">
            <table className="ui-table ui-table--form">
              <thead>
                <tr>
                  <th scope="col">{t("sp.doesIt")}</th>
                  <th scope="col">{t("common.service")}</th>
                  <th scope="col" className="r">{t("sp.shopPrice")}</th>
                  <th scope="col" className="r">{t("sp.theirPrice", { name: s.name })}</th>
                  <th scope="col" className="r">{t("sp.theirMinutes", { name: s.name })}</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((sv) => {
                  const on = does.includes(sv.id);
                  return (
                    <tr key={sv.id}>
                      <td>
                        <input type="checkbox" checked={on} onChange={(e) => setDoes((d) => (e.target.checked ? [...d, sv.id] : d.filter((x) => x !== sv.id)))} aria-label={t("sp.doesLabel", { name: s.name, service: sv.name })} />
                      </td>
                      <th scope="row">{sv.name}</th>
                      <td className="r num" data-label={t("sp.shopPrice")}>{f.money(sv.priceMinor, { whole: true })}</td>
                      <td className="r" data-label={t("sp.theirPrice", { name: s.name })}>
                        <input
                          className="ui-input ui-input--short num"
                          inputMode="decimal"
                          disabled={!on}
                          placeholder={String(sv.priceMinor / 10 ** minorDigits(f.currency))}
                          value={overrides[sv.id]?.price ?? ""}
                          onChange={(e) => setOverrides((o) => ({ ...o, [sv.id]: { ...o[sv.id], price: e.target.value } }))}
                          aria-label={t("sp.priceFor", { name: s.name, service: sv.name })}
                        />
                      </td>
                      <td className="r" data-label={t("sp.theirMinutes", { name: s.name })}>
                        <input
                          className="ui-input ui-input--short num"
                          type="number"
                          min={5}
                          step={5}
                          disabled={!on}
                          placeholder={String(sv.minutes)}
                          value={overrides[sv.id]?.minutes ?? ""}
                          onChange={(e) => setOverrides((o) => ({ ...o, [sv.id]: { ...o[sv.id], minutes: e.target.value } }))}
                          aria-label={t("sp.minutesFor", { name: s.name, service: sv.name })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rebook">
            <button type="submit" className="ui-btn ui-btn--primary">
              {t("common.save")}
            </button>
          </div>
          {saved && <NotConnected what={t("sp.thing")} />}
        </form>

        <section className="app-section app-panel" aria-labelledby="pub-title">
          <h2 id="pub-title" className="app-h2">
            {t("sp.site")}
          </h2>
          <Field label={t("sp.line")}>{(fid) => <textarea id={fid} className="ui-input ui-textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />}</Field>
          {photo && <img className="staff-photo" src={photo} alt={s.name} />}
          <Field label={t("sp.changePhoto")} hint={t("sp.photo")}>
            {(fid, hint) => <input id={fid} aria-describedby={hint} className="ui-file" type="file" accept={PHOTO_TYPES} onChange={changePhoto} />}
          </Field>
          {photoError && (
            <p className="ui-error" role="alert">
              {photoError}
            </p>
          )}
          {photoChanged && <NotConnected what={t("sp.photoThing")} />}
          <div className="ui-field">
            <span className="ui-field__label">{t("sp.link")}</span>
            <p className="plate plate--link">
              <strong>chairside.app/b/{s.slug}</strong>
            </p>
          </div>
          <div className="rebook">
            <button
              type="button"
              className="ui-btn ui-btn--quiet"
              onClick={() => {
                navigator.clipboard?.writeText(link).then(
                  () => setCopied(true),
                  () => setCopied(false),
                );
              }}
            >
              {copied ? t("sp.copied") : t("sp.copy")}
            </button>
            <a className="ui-btn ui-btn--text" href={`/b/${s.slug}`}>
              {t("sp.open")}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
