import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { staffById } from "../../lib/data";
import { Account, findAccount, homeFor, useSession } from "../../lib/session";
import { useSettings } from "../../lib/settings";
import { formatTn, isTnMobile } from "../../lib/tunisia";
import { TextKey, useT } from "../i18n";
import { AuthFrame, Channel, CodeStep, isEmail, PhoneInput } from "./parts";

const DEMO: { id: string; line: TextKey }[] = [
  { id: "karim", line: "auth.demoOwner" },
  { id: "mehdi", line: "auth.demoBarber" },
  { id: "salma", line: "auth.demoDesk" },
];

/** Only paths inside the product, so a link cannot send someone elsewhere after signing in. */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);

export function SignIn() {
  const { t, label } = useT();
  const { staff, signIn } = useSession();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("suite"));
  const [by, setBy] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<{ text: string; create?: boolean } | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [channel, setChannel] = useState<Channel>("whatsapp");

  useEffect(() => {
    document.title = `${t("auth.signInTitle")}, Chairside`;
  }, [t]);

  if (staff && !account) return <Navigate to={next ?? homeFor(staff.role)} replace />;

  function send(e: FormEvent) {
    e.preventDefault();
    const value = by === "phone" ? phone : email;
    if (by === "phone" ? !isTnMobile(value) : !isEmail(value)) {
      setError({ text: by === "phone" ? t("auth.errPhone") : t("auth.errEmail") });
      document.getElementById("signin-who")?.focus();
      return;
    }
    const found = findAccount(by, value);
    if (!found) {
      setError({ text: by === "phone" ? t("auth.noAccount") : t("auth.noAccountEmail"), create: true });
      document.getElementById("signin-who")?.focus();
      return;
    }
    setError(null);
    setChannel(by === "phone" ? "whatsapp" : "email");
    setAccount(found);
  }

  function enter(a: Account) {
    signIn({ userId: a.userId, name: a.name, phone: a.phone, email: a.email, role: a.role, shopReady: a.shopReady });
    navigate(next ?? (a.shopReady ? homeFor(a.role) : "/setup"), { replace: true });
  }

  if (account)
    return (
      <AuthFrame>
        <CodeStep to={by === "phone" ? formatTn(phone) : email.trim()} channel={channel} onChannel={setChannel} onBack={() => setAccount(null)} onDone={() => enter(account)} />
      </AuthFrame>
    );

  return (
    <AuthFrame
      aside={
        <section aria-labelledby="demo-title" className="auth__demo">
          <h2 id="demo-title">{t("auth.demoTitle")}</h2>
          <p>{t("auth.demoLead", { shop: settings.shopName })}</p>
          <ul>
            {DEMO.map((d) => {
              const m = staffById(d.id);
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    className="auth__demo-btn"
                    aria-label={t("auth.demoAs", { name: m.name, role: label("role", m.role) })}
                    onClick={() => enter({ userId: m.id, name: m.name, phone: m.phone, email: m.email, role: m.role, shopReady: true })}
                  >
                    <strong>{m.name}</strong>
                    <span>{label("role", m.role)}</span>
                    <span className="app-quiet">{t(d.line)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      }
    >
      <form className="auth__step" onSubmit={send} noValidate>
        <h1>{t("auth.signInTitle")}</h1>
        <p>{t("auth.signInLead")}</p>
        <div className="ui-seg" role="radiogroup" aria-label={t("auth.how")}>
          {(["phone", "email"] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={by === b}
              className={by === b ? "ui-btn ui-btn--primary" : "ui-btn ui-btn--quiet"}
              onClick={() => {
                setBy(b);
                setError(null);
              }}
            >
              {b === "phone" ? t("auth.byPhone") : t("auth.byEmail")}
            </button>
          ))}
        </div>
        <div className="ui-field">
          {by === "phone" ? (
            <>
              <label htmlFor="signin-who">{t("auth.phone")}</label>
              <PhoneInput id="signin-who" value={phone} onChange={(v) => (setPhone(v), setError(null))} error={error?.text} hintId="signin-hint" autoFocus />
              <p className="ui-field__hint" id="signin-hint">
                {t("auth.phoneHint")}
              </p>
            </>
          ) : (
            <>
              <label htmlFor="signin-who">{t("auth.email")}</label>
              <input
                id="signin-who"
                className="ui-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                autoFocus
                value={email}
                onChange={(e) => (setEmail(e.target.value), setError(null))}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "signin-who-err" : undefined}
              />
              {error && (
                <p className="ui-error" id="signin-who-err">
                  {error.text}
                </p>
              )}
            </>
          )}
          {error?.create && (
            <Link className="ui-btn ui-btn--text auth__inline" to="/inscription">
              {t("auth.createInstead")}
            </Link>
          )}
        </div>
        <button type="submit" className="ui-btn ui-btn--primary auth__submit">
          {t("auth.getCode")}
        </button>
        <p className="auth__alt">
          {t("auth.newHere")} <Link to="/inscription">{t("auth.createInstead")}</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
