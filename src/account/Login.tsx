import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopFrame } from "../shop/ShopFrame";

export function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"who" | "code">("who");
  const [who, setWho] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function send(e: FormEvent) {
    e.preventDefault();
    if (who.replace(/\s/g, "").length < 6) {
      setError("Enter the phone number or email you booked with.");
      return;
    }
    setError("");
    setStep("code");
  }

  function check(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("The code is 6 digits.");
      return;
    }
    navigate("/account");
  }

  return (
    <ShopFrame narrow>
      <div className="book">
        {step === "who" ? (
          <form onSubmit={send} noValidate>
            <h1>Your bookings</h1>
            <p>No password. We send a one-time code to your phone or email.</p>
            <div className="ui-field">
              <label htmlFor="login-who">Phone or email</label>
              <input id="login-who" className="ui-input" autoComplete="username" value={who} onChange={(e) => setWho(e.target.value)} aria-invalid={!!error || undefined} />
              {error && <p className="ui-error">{error}</p>}
            </div>
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              Get a code
            </button>
          </form>
        ) : (
          <form onSubmit={check} noValidate>
            <h1>Enter the code</h1>
            <p>Codes are not sent in this preview. Any 6 digits open the sample account.</p>
            <div className="ui-field">
              <label htmlFor="login-code">6-digit code</label>
              <input
                id="login-code"
                className="ui-input ui-input--code num"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                aria-invalid={!!error || undefined}
              />
              {error && <p className="ui-error">{error}</p>}
            </div>
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              Open my bookings
            </button>
            <button type="button" className="shop__btn shop__btn--text" onClick={() => setStep("who")}>
              Use another number
            </button>
          </form>
        )}
      </div>
    </ShopFrame>
  );
}
