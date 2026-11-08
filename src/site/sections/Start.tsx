import { FormEvent, useState } from "react";

const COUNTRIES = ["Egypt", "Tunisia", "Italy", "France", "Germany", "Another country"];

export function Start() {
  const [help, setHelp] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const first = Array.from(form.elements).find(
      (el): el is HTMLInputElement => el instanceof HTMLInputElement && !el.checkValidity(),
    );
    if (first) {
      setInvalid(first.name);
      setHelp(first.name === "email" ? "That address looks incomplete. Write it as name@example.com." : "Add your shop's name.");
      first.focus();
      return;
    }
    setInvalid(null);
    if (!form.dataset.endpoint) {
      setHelp("Nothing was sent: this form is not connected yet.");
    }
  }

  return (
    <section className="start band--paper" id="start" aria-labelledby="start-title">
      <div className="container start__grid">
        <div className="start__head">
          <h2 id="start-title">Put your shop on the board</h2>
          <p className="lead">Services, hours and barbers set up in one sitting. 14 days free, no card needed.</p>
        </div>

        <form className="start__form" data-endpoint="" noValidate onSubmit={submit}>
          <div className="field">
            <label htmlFor="shop">Shop name</label>
            <input id="shop" name="shop" type="text" autoComplete="organization" required aria-invalid={invalid === "shop" || undefined} aria-describedby="start-help" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={invalid === "email" || undefined} aria-describedby="start-help" />
          </div>
          <div className="field">
            <label htmlFor="country">Country</label>
            <select id="country" name="country" autoComplete="country-name" defaultValue="Egypt">
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn--primary">
            Start free trial
          </button>
          <p className="start__help" id="start-help" aria-live="polite">
            {help}
          </p>
        </form>
      </div>
    </section>
  );
}
