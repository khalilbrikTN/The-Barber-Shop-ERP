import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteNav } from "./Chrome";

/* What we commit to, in plain words. A draft from PLAN.md sections 9 and 18, to be checked by a Tunisian
   lawyer before launch; the page says so. */

const TERMS = [
  { what: "Votre argent", text: "Les acomptes vont directement sur votre compte chez votre prestataire de paiement. Chairside ne garde jamais l’argent de votre salon." },
  { what: "Les réservations", text: "Aucune commission sur les réservations, nouveaux clients compris. Vous payez votre formule mensuelle, rien d’autre." },
  { what: "Partir", text: "Vous pouvez partir quand vous voulez. Vos clients, rendez-vous et ventes se téléchargent en un seul fichier depuis Réglages." },
  { what: "Les messages", text: "Les offres et campagnes ne partent qu’aux clients qui les ont acceptées, avec un moyen simple de se désinscrire." },
];

const PRIVACY = [
  { what: "Ce que nous gardons", text: "Les nom, téléphone et e-mail de votre équipe et de vos clients, leurs rendez-vous et vos ventes. Rien de plus que ce qu’il faut pour faire tourner le salon." },
  { what: "Qui les voit", text: "Seulement votre équipe, selon le rôle de chacun. Un client qui réserve dans deux salons reste invisible d’un salon à l’autre." },
  { what: "Photos", text: "Les photos avant et après, comme celles de la galerie, ne sont ajoutées qu’avec l’accord de la personne photographiée." },
  { what: "La loi", text: "Les données personnelles sont traitées selon la loi organique n° 2004-63 du 27 juillet 2004 sur la protection des données à caractère personnel. Chacun peut demander à voir, corriger ou effacer ses données." },
];

export function TermsPage() {
  useEffect(() => {
    document.title = "Conditions et confidentialité, Chairside";
  }, []);
  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="terms-title">
          <div className="container">
            <h1 id="terms-title">Conditions et confidentialité</h1>
            <p className="lead">Nos engagements, en clair. Ce texte est une version de travail : il sera relu par un avocat tunisien avant le lancement.</p>
          </div>
        </section>

        <section className="never band--ink" aria-labelledby="t-title">
          <div className="container never__grid">
            <h2 id="t-title">Conditions</h2>
            <dl className="never__rows">
              {TERMS.map((n) => (
                <div key={n.what}>
                  <dt>{n.what}</dt>
                  <dd>{n.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="steps" aria-labelledby="p-title">
          <div className="container never__grid">
            <h2 id="p-title">Confidentialité</h2>
            <dl className="never__rows never__rows--paper">
              {PRIVACY.map((n) => (
                <div key={n.what}>
                  <dt>{n.what}</dt>
                  <dd>{n.text}</dd>
                </div>
              ))}
            </dl>
            <Link className="btn btn--primary never__link" to="/inscription">
              Créer votre salon
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
