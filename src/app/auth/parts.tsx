import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { tnDigits } from "../../lib/tunisia";
import { useT } from "../i18n";

/** The frame for signing in, signing up and signing out: the setup wizard's ink bar, one calm column, an optional side note. */
export function AuthFrame({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  const { t } = useT();
  return (
    <div className="app-root auth">
      <header className="setup__top">
        <Link to="/" className="setup__mark">
          Chairside
        </Link>
        <Link to="/" className="auth__back">
          {t("auth.backSite")}
        </Link>
      </header>
      <main className="auth__main" id="main">
        <div className="auth__form">{children}</div>
        {aside && <aside className="auth__aside">{aside}</aside>}
      </main>
    </div>
  );
}

/** "20 123 456" as it is typed; the +216 is printed in front, so nobody types it twice. */
export const spaced = (raw: string) => {
  const d = tnDigits(raw).slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5)].filter(Boolean).join(" ");
};

export function PhoneInput({ id, value, onChange, error, hintId, autoFocus }: { id: string; value: string; onChange: (v: string) => void; error?: string; hintId?: string; autoFocus?: boolean }) {
  const described = [hintId, error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <>
      <div className="phone-input" dir="ltr">
        <span className="phone-input__cc" aria-hidden="true">
          +216
        </span>
        <input
          id={id}
          className="ui-input num"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="20 123 456"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(spaced(e.target.value))}
          aria-invalid={!!error || undefined}
          aria-describedby={described}
        />
      </div>
      {error && (
        <p className="ui-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </>
  );
}

export type Channel = "whatsapp" | "sms" | "email";

/** The one-time code: sent, typed, checked. Six digits confirm by themselves; a new code waits 30 seconds. */
export function CodeStep({ to, channel, onChannel, onBack, onDone }: { to: string; channel: Channel; onChannel?: (c: Channel) => void; onBack: () => void; onDone: () => void }) {
  const { t } = useT();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [wait, setWait] = useState(30);
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  function check(e?: FormEvent, value = code) {
    e?.preventDefault();
    if (!/^\d{6}$/.test(value)) {
      setError(t("auth.errCode"));
      input.current?.focus();
      return;
    }
    onDone();
  }

  function resend(next: Channel = channel) {
    if (next !== channel) onChannel?.(next);
    setWait(30);
    setCode("");
    setError("");
    setNote(t("auth.resent"));
    input.current?.focus();
  }

  return (
    <form className="auth__step" onSubmit={check} noValidate>
      <h1>{t("auth.codeTitle")}</h1>
      <p>{channel === "email" ? t("auth.codeSentEmail", { to }) : t("auth.codeSentPhone", { to, channel: channel === "sms" ? t("auth.sms") : t("auth.whatsapp") })}</p>
      <div className="ui-field">
        <label htmlFor="auth-code">{t("auth.code")}</label>
        <input
          ref={input}
          id="auth-code"
          className="ui-input ui-input--code num"
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          maxLength={6}
          autoFocus
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(v);
            setError("");
            if (v.length === 6) check(undefined, v);
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "auth-code-err" : "auth-preview"}
        />
        {error && (
          <p className="ui-error" id="auth-code-err">
            {error}
          </p>
        )}
      </div>
      <p className="auth__preview" id="auth-preview">
        {t("auth.preview")}
      </p>
      <button type="submit" className="ui-btn ui-btn--primary auth__submit">
        {t("auth.verify")}
      </button>
      <p className="app-quiet" role="status" aria-live="polite">
        {note}
      </p>
      <div className="auth__links">
        {wait > 0 ? (
          <span className="app-quiet">{t("auth.resendIn", { n: wait })}</span>
        ) : (
          <>
            <button type="button" className="ui-btn ui-btn--text" onClick={() => resend()}>
              {t("auth.resend")}
            </button>
            {channel !== "email" && (
              <button type="button" className="ui-btn ui-btn--text" onClick={() => resend(channel === "sms" ? "whatsapp" : "sms")}>
                {channel === "sms" ? t("auth.useWhatsapp") : t("auth.useSms")}
              </button>
            )}
          </>
        )}
        <button type="button" className="ui-btn ui-btn--text" onClick={onBack}>
          {channel === "email" ? t("auth.changeEmail") : t("auth.change")}
        </button>
      </div>
    </form>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
