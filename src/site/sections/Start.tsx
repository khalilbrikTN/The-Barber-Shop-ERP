import { FormEvent, useState } from "react";

const CITIES = ["Tunis", "Ariana", "Ben Arous", "La Manouba", "Nabeul", "Bizerte", "Sousse", "Monastir", "Sfax", "Gabès", "Djerba", "Une autre ville"];

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
      setHelp(first.name === "email" ? "Cette adresse semble incomplète. Écrivez-la comme nom@example.com." : "Ajoutez le nom de votre salon.");
      first.focus();
      return;
    }
    setInvalid(null);
    if (!form.dataset.endpoint) {
      setHelp("Rien n’a été envoyé : ce formulaire n’est pas encore relié.");
    }
  }

  return (
    <section className="start band--paper" id="start" aria-labelledby="start-title">
      <div className="container start__grid">
        <div className="start__head">
          <h2 id="start-title">Mettez votre salon à l’écran</h2>
          <p className="lead">Prestations, horaires et barbiers réglés en une fois. 14 jours gratuits, sans carte bancaire.</p>
        </div>

        <form className="start__form" data-endpoint="" noValidate onSubmit={submit}>
          <div className="field">
            <label htmlFor="shop">Nom du salon</label>
            <input id="shop" name="shop" type="text" autoComplete="organization" required aria-invalid={invalid === "shop" || undefined} aria-describedby="start-help" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={invalid === "email" || undefined} aria-describedby="start-help" />
          </div>
          <div className="field">
            <label htmlFor="city">Ville</label>
            <select id="city" name="city" autoComplete="address-level2" defaultValue="Tunis">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
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
