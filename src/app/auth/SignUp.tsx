import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { COUNTRY_PRESETS, useSettings } from "../../lib/settings";
import { findAccount, homeFor, useSession } from "../../lib/session";
import { loadSite, saveSite } from "../../lib/site";
import { formatTn, isTnMobile, TN_CITIES } from "../../lib/tunisia";
import { TextKey, useT } from "../i18n";
import { AuthFrame, Channel, CodeStep, isEmail, PhoneInput, spaced } from "./parts";

type FieldId = "name" | "phone" | "shop" | "email";
const WHY: TextKey[] = ["auth.why1", "auth.why2", "auth.why3", "auth.why4"];

export function SignUp() {
  const { t } = useT();
  const { staff, signIn } = useSession();
  const { update } = useSettings();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(spaced(params.get("tel") ?? ""));
  const [shop, setShop] = useState(params.get("salon") ?? "");
  const [city, setCity] = useState(params.get("ville") && TN_CITIES.includes(params.get("ville")!) ? params.get("ville")! : "Tunis");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [taken, setTaken] = useState(false);
  const [step, setStep] = useState<"form" | "code">("form");
  const [channel, setChannel] = useState<Channel>("whatsapp");

  useEffect(() => {
    document.title = `${t("auth.signUpTitle")}, Chairside`;
  }, [t]);

  if (staff && step === "form") return <Navigate to={staff.shopReady ? homeFor(staff.role) : "/setup"} replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<FieldId, string>> = {};
    if (name.trim().length < 2) errs.name = t("auth.errName");
    if (!isTnMobile(phone)) errs.phone = t("auth.errPhone");
    if (shop.trim().length < 2) errs.shop = t("auth.errShop");
    if (email.trim() && !isEmail(email)) errs.email = t("auth.errEmail");
    setErrors(errs);
    const first = (["name", "phone", "shop", "email"] as FieldId[]).find((f) => errs[f]);
    if (first) {
      document.getElementById(`su-${first}`)?.focus();
      return;
    }
    if (findAccount("phone", phone)) {
      setTaken(true);
      document.getElementById("su-phone")?.focus();
      return;
    }
    setTaken(false);
    setStep("code");
  }

  function create() {
    update({ ...COUNTRY_PRESETS.Tunisia, shopName: shop.trim() });
    if (city !== "other") saveSite({ ...loadSite(), area: city, address: city });
    signIn({ userId: "owner", name: name.trim(), phone: formatTn(phone), email: email.trim() || undefined, role: "Owner", shopReady: false });
    navigate("/setup", { replace: true });
  }

  if (step === "code")
    return (
      <AuthFrame>
        <CodeStep to={formatTn(phone)} channel={channel} onChannel={setChannel} onBack={() => setStep("form")} onDone={create} />
      </AuthFrame>
    );

  const err = (id: FieldId) =>
    errors[id] && (
      <p className="ui-error" id={`su-${id}-err`}>
        {errors[id]}
      </p>
    );
  const aria = (id: FieldId) => ({ "aria-invalid": !!errors[id] || undefined, "aria-describedby": errors[id] ? `su-${id}-err` : undefined });

  return (
    <AuthFrame
      aside={
        <section aria-labelledby="why-title" className="auth__why">
          <h2 id="why-title">{t("auth.whyTitle")}</h2>
          <ul>
            {WHY.map((w) => (
              <li key={w}>{t(w)}</li>
            ))}
          </ul>
        </section>
      }
    >
      <form className="auth__step" onSubmit={submit} noValidate>
        <h1>{t("auth.signUpTitle")}</h1>
        <p>{t("auth.signUpLead")}</p>
        <div className="ui-field">
          <label htmlFor="su-name">{t("auth.yourName")}</label>
          <input id="su-name" className="ui-input" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} {...aria("name")} />
          {err("name")}
        </div>
        <div className="ui-field">
          <label htmlFor="su-phone">{t("auth.phone")}</label>
          <PhoneInput id="su-phone" value={phone} onChange={(v) => (setPhone(v), setTaken(false))} error={errors.phone ?? (taken ? t("auth.taken") : undefined)} hintId="su-phone-hint" />
          <p className="ui-field__hint" id="su-phone-hint">
            {t("auth.phoneHint")}
          </p>
          {taken && (
            <Link className="ui-btn ui-btn--text auth__inline" to="/connexion">
              {t("auth.signInInstead")}
            </Link>
          )}
        </div>
        <div className="ui-field">
          <label htmlFor="su-shop">{t("auth.shop")}</label>
          <input id="su-shop" className="ui-input" autoComplete="organization" value={shop} onChange={(e) => setShop(e.target.value)} {...aria("shop")} />
          {err("shop")}
        </div>
        <div className="ui-field">
          <label htmlFor="su-city">{t("auth.city")}</label>
          <select id="su-city" className="ui-input" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)}>
            {TN_CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
            <option value="other">{t("auth.otherCity")}</option>
          </select>
        </div>
        <div className="ui-field">
          <label htmlFor="su-email">{t("auth.emailOpt")}</label>
          <input
            id="su-email"
            className="ui-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? "su-email-err" : "su-email-hint"}
          />
          <p className="ui-field__hint" id="su-email-hint">
            {t("auth.emailOptHint")}
          </p>
          {err("email")}
        </div>
        <p className="auth__terms">
          {t("auth.terms")} <Link to="/conditions">{t("auth.termsLink")}</Link>
        </p>
        <button type="submit" className="ui-btn ui-btn--primary auth__submit">
          {t("auth.create")}
        </button>
        <p className="auth__alt">
          {t("auth.haveAccount")} <Link to="/connexion">{t("auth.signInInstead")}</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
