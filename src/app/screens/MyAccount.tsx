import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormat } from "../../lib/format";
import { DEFAULT_NOTIFY, forgetOwner, StaffLang, useSession } from "../../lib/session";
import { useSettings } from "../../lib/settings";
import { clearSampleData } from "../../lib/store";
import { formatTn, isTnMobile } from "../../lib/tunisia";
import { NotConnected, PageHead, Toggle } from "../../ui/kit";
import { isEmail, PhoneInput, spaced } from "../auth/parts";
import { STAFF_LANGS, TextKey, useT } from "../i18n";

const NOTIFY: { id: keyof typeof DEFAULT_NOTIFY; label: TextKey }[] = [
  { id: "booking", label: "acct.nBooking" },
  { id: "cancel", label: "acct.nCancel" },
  { id: "queue", label: "acct.nQueue" },
  { id: "summary", label: "acct.nSummary" },
];

export function MyAccount() {
  const f = useFormat();
  const { t, label } = useT();
  const { staff, updateStaff } = useSession();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [name, setName] = useState(staff?.name ?? "");
  const [phone, setPhone] = useState(spaced(staff?.phone ?? ""));
  const [email, setEmail] = useState(staff?.email ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [saved, setSaved] = useState(false);
  const [tablet, setTablet] = useState(true);
  const [deviceNote, setDeviceNote] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!staff) return null;
  const notify = { ...DEFAULT_NOTIFY, ...staff.notify };
  const isOwner = staff.role === "Owner";

  function save(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = t("auth.errName");
    if (!isTnMobile(phone)) errs.phone = t("auth.errPhone");
    if (email.trim() && !isEmail(email)) errs.email = t("auth.errEmail");
    setErrors(errs);
    const first = (["name", "phone", "email"] as const).find((k) => errs[k]);
    if (first) {
      document.getElementById(`me-${first}`)?.focus();
      setSaved(false);
      return;
    }
    updateStaff({ name: name.trim(), phone: formatTn(phone), email: email.trim() || undefined });
    setSaved(true);
  }

  function deleteSalon() {
    clearSampleData();
    forgetOwner();
    // a full reload, so nothing of the old salon stays in memory
    window.location.assign("/deconnexion?raison=supprime");
  }

  return (
    <>
      <PageHead title={t("shell.account")} sub={t("acct.sub", { name: staff.name, role: label("role", staff.role) })} />

      <div className="account-grid">
        <div>
          <section className="app-section" aria-labelledby="me-profile">
            <h2 id="me-profile" className="app-h2">
              {t("acct.profile")}
            </h2>
            <form className="app-panel ui-fieldset" onSubmit={save} noValidate>
              <div className="ui-field">
                <label htmlFor="me-name">{t("common.name")}</label>
                <input
                  id="me-name"
                  className="ui-input"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => (setName(e.target.value), setSaved(false))}
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={errors.name ? "me-name-err" : undefined}
                />
                {errors.name && (
                  <p className="ui-error" id="me-name-err">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="ui-field">
                <label htmlFor="me-phone">{t("auth.phone")}</label>
                <PhoneInput id="me-phone" value={phone} onChange={(v) => (setPhone(v), setSaved(false))} error={errors.phone} hintId="me-phone-hint" />
                <p className="ui-field__hint" id="me-phone-hint">
                  {t("auth.phoneHint")}
                </p>
              </div>
              <div className="ui-field">
                <label htmlFor="me-email">{t("auth.emailOpt")}</label>
                <input
                  id="me-email"
                  className="ui-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => (setEmail(e.target.value), setSaved(false))}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? "me-email-err" : undefined}
                />
                {errors.email && (
                  <p className="ui-error" id="me-email-err">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="rebook">
                <button type="submit" className="ui-btn ui-btn--primary">
                  {t("common.save")}
                </button>
                <span className="app-quiet" role="status">
                  {saved ? t("acct.saved") : ""}
                </span>
              </div>
              {saved && <NotConnected what={t("acct.thing")} />}
            </form>
          </section>

          <section className="app-section" aria-labelledby="me-lang">
            <h2 id="me-lang" className="app-h2">
              {t("acct.lang")}
            </h2>
            <fieldset className="ui-fieldset">
              <legend className="visually-hidden">{t("acct.lang")}</legend>
              {STAFF_LANGS.map((l) => (
                <label key={l.id} className="ui-radio-card" lang={l.id}>
                  <input type="radio" name="staff-lang" checked={staff.lang === l.id} onChange={() => updateStaff({ lang: l.id as StaffLang })} />
                  <span>
                    <strong>{l.label}</strong>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="app-quiet">{t("acct.langHint")}</p>
            <p className="app-quiet">{t("acct.arabicSoon")}</p>
          </section>
        </div>

        <div>
          <section className="app-section" aria-labelledby="me-notify">
            <h2 id="me-notify" className="app-h2">
              {t("acct.notify")}
            </h2>
            <div className="app-panel ui-fieldset">
              {NOTIFY.map((n) => (
                <Toggle key={n.id} label={t(n.label)} checked={!!notify[n.id]} onChange={(v) => updateStaff({ notify: { ...notify, [n.id]: v } })} />
              ))}
              <p className="app-quiet">{t("acct.notifyHint")}</p>
            </div>
          </section>

          <section className="app-section" aria-labelledby="me-devices">
            <h2 id="me-devices" className="app-h2">
              {t("acct.devices")}
            </h2>
            <ul className="rules">
              <li>
                <div>
                  <strong>{t("acct.thisDevice")}</strong>
                  <span className="app-quiet">{t("acct.since", { date: f.date(staff.since) })}</span>
                </div>
                <span className="ui-status ui-status--checked-in">{t("acct.current")}</span>
              </li>
              {tablet && (
                <li>
                  <div>
                    <strong>{t("acct.deskTablet")}</strong>
                    <span className="app-quiet">{t("acct.since", { date: f.date(f.at("2026-12-01", "09:00")) })}</span>
                  </div>
                  <button
                    type="button"
                    className="ui-btn ui-btn--quiet"
                    aria-label={t("acct.signOutDevice", { device: t("acct.deskTablet") })}
                    onClick={() => {
                      setTablet(false);
                      setDeviceNote(t("acct.signedOutDevice", { device: t("acct.deskTablet") }));
                    }}
                  >
                    {t("acct.signOutThis")}
                  </button>
                </li>
              )}
            </ul>
            <p className="app-quiet" role="status">
              {deviceNote}
            </p>
            <div className="rebook">
              <button type="button" className="ui-btn ui-btn--quiet" onClick={() => navigate("/deconnexion")}>
                {t("shell.signOut")}
              </button>
              <button type="button" className="ui-btn ui-btn--text" onClick={() => navigate("/deconnexion?raison=partout")}>
                {t("acct.everywhere")}
              </button>
            </div>
          </section>

          {isOwner && (
            <section className="app-section danger" aria-labelledby="me-danger">
              <h2 id="me-danger" className="app-h2">
                {t("acct.danger")}
              </h2>
              <p>{t("acct.dangerBody")}</p>
              <div className="ui-field">
                <label htmlFor="me-confirm">{t("acct.confirm", { shop: settings.shopName })}</label>
                <input id="me-confirm" className="ui-input" autoComplete="off" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <button type="button" className="ui-btn ui-btn--danger" disabled={confirm.trim() !== settings.shopName.trim()} onClick={deleteSalon}>
                {t("acct.delete")}
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
