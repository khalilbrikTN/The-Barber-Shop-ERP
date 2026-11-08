import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { ShopFrame } from "../shop/ShopFrame";

export function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState<"who" | "code">("who");
  const [who, setWho] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function send(e: FormEvent) {
    e.preventDefault();
    if (who.replace(/\s/g, "").length < 6) {
      setError(t("login.errWho"));
      document.getElementById("login-who")?.focus();
      return;
    }
    setError("");
    setStep("code");
  }

  function check(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError(t("login.errCode"));
      document.getElementById("login-code")?.focus();
      return;
    }
    navigate("/account");
  }

  return (
    <ShopFrame narrow>
      <div className="book">
        {step === "who" ? (
          <form onSubmit={send} noValidate>
            <h1>{t("login.title")}</h1>
            <p>{t("login.how")}</p>
            <div className="ui-field">
              <label htmlFor="login-who">{t("login.who")}</label>
              <input id="login-who" className="ui-input" autoComplete="username" dir="ltr" value={who} onChange={(e) => setWho(e.target.value)} aria-invalid={!!error || undefined} aria-describedby={error ? "login-err" : undefined} />
              {error && (
                <p className="ui-error" id="login-err">
                  {error}
                </p>
              )}
            </div>
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              {t("login.get")}
            </button>
          </form>
        ) : (
          <form onSubmit={check} noValidate>
            <h1>{t("login.enter")}</h1>
            <p>{t("login.preview")}</p>
            <div className="ui-field">
              <label htmlFor="login-code">{t("login.code")}</label>
              <input
                id="login-code"
                className="ui-input ui-input--code num"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "login-err" : undefined}
              />
              {error && (
                <p className="ui-error" id="login-err">
                  {error}
                </p>
              )}
            </div>
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              {t("login.open")}
            </button>
            <button
              type="button"
              className="shop__btn shop__btn--text"
              onClick={() => {
                setStep("who");
                setError("");
              }}
            >
              {t("login.other")}
            </button>
          </form>
        )}
      </div>
    </ShopFrame>
  );
}
