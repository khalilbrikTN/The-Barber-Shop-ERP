import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTnMobile, TN_CITIES } from "../../lib/tunisia";

export function Start() {
  const [help, setHelp] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);
  const navigate = useNavigate();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const shop = String(data.get("shop") ?? "").trim();
    const tel = String(data.get("tel") ?? "");
    const bad = shop.length < 2 ? "shop" : !isTnMobile(tel) ? "tel" : null;
    if (bad) {
      setInvalid(bad);
      setHelp(bad === "tel" ? "Saisissez les 8 chiffres d’un mobile tunisien, comme 20 123 456." : "Ajoutez le nom de votre salon.");
      (form.elements.namedItem(bad) as HTMLInputElement).focus();
      return;
    }
    setInvalid(null);
    // the rest of the sign-up picks up what was typed here
    const next = new URLSearchParams({ salon: shop, tel, ville: String(data.get("city") ?? "") });
    navigate(`/inscription?${next}`);
  }

  return (
    <section className="start band--paper" id="start" aria-labelledby="start-title">
      <div className="container start__grid">
        <div className="start__head">
          <h2 id="start-title">Mettez votre salon à l’écran</h2>
          <p className="lead">Prestations, horaires et barbiers réglés en une fois. 14 jours gratuits, sans carte bancaire.</p>
        </div>

        <form className="start__form" noValidate onSubmit={submit}>
          <div className="field">
            <label htmlFor="shop">Nom du salon</label>
            <input id="shop" name="shop" type="text" autoComplete="organization" required aria-invalid={invalid === "shop" || undefined} aria-describedby="start-help" />
          </div>
          <div className="field">
            <label htmlFor="tel">Numéro mobile</label>
            <input id="tel" name="tel" type="tel" autoComplete="tel" inputMode="tel" dir="ltr" placeholder="+216 20 123 456" required aria-invalid={invalid === "tel" || undefined} aria-describedby="start-help" />
          </div>
          <div className="field">
            <label htmlFor="city">Ville</label>
            <select id="city" name="city" autoComplete="address-level2" defaultValue="Tunis">
              {TN_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
              <option value="other">Une autre ville</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary">
            Commencer l’essai gratuit
          </button>
          <p className="start__help" id="start-help" aria-live="polite">
            {help}
          </p>
        </form>
      </div>
    </section>
  );
}
