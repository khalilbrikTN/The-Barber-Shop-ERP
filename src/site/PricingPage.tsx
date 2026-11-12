import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteNav } from "./Chrome";
import { PLANS, usePrices } from "./prices";
import { Start } from "./sections/Start";

const ROWS: { label: string; values: string[]; figure?: boolean }[] = [
  { label: "Membres réservables", values: ["1", "1", "Jusqu’à 6", "Jusqu’à 15"] },
  { label: "Messages par mois", values: ["50", "300", "1 500", "4 000"] },
  { label: "File sans rendez-vous, acomptes, fidélité", values: ["Non", "Non", "Oui", "Oui"] },
  { label: "Commissions et location de fauteuil", values: ["Non", "Non", "Oui", "Oui"] },
  { label: "Rôles sur mesure et stock", values: ["Non", "Non", "Non", "Oui"] },
  { label: "Votre propre nom de domaine", values: ["Non", "Non", "Non", "Oui"] },
];

const NEVER = [
  { what: "La mise en place", cost: "Gratuite, avec de l’aide sur WhatsApp si vous bloquez." },
  { what: "Chaque réservation", cost: "Rien, nouveaux clients compris." },
  { what: "Les paiements par carte", cost: "Les frais de votre prestataire, payés à lui, jamais à nous." },
  { what: "Partir", cost: "Rien. Votre liste de clients se télécharge en un fichier." },
  { what: "Venir d’une autre application", cost: "Gratuit. Apportez vos clients dans un seul fichier CSV." },
];

export function PricingPage() {
  const { prices, money, multi } = usePrices();
  const rows = [{ label: "Par mois, par salon", values: prices.plans.map(money), figure: true }, ...ROWS];
  useEffect(() => {
    document.title = "Tarifs, Chairside";
  }, []);
  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="pp-title">
          <div className="container">
            <h1 id="pp-title">Un prix par mois. Aucune commission.</h1>
            <p className="lead">Par salon, en dinars tunisiens.</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="/inscription">
                Commencer l’essai gratuit
              </a>
            </div>
          </div>
        </section>

        <section className="pricing pricing--page" aria-label="Formules comparées">
          <div className="container">
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Formules comparées">
              <table className="pricing__table">
                <thead>
                  <tr>
                    <td />
                    {PLANS.map((p) => (
                      <th scope="col" key={p}>
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className={r.figure ? "pricing__price" : undefined}>
                      <th scope="row">{r.label}</th>
                      {r.values.map((v, i) => (
                        <td key={i} className={r.figure ? "figure" : undefined}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pricing__note">{multi} Les rapports les couvrent tous.</p>
          </div>
        </section>

        <section className="never band--ink" aria-labelledby="never-title">
          <div className="container never__grid">
            <h2 id="never-title">Ce que vous ne nous payez jamais</h2>
            <dl className="never__rows">
              {NEVER.map((n) => (
                <div key={n.what}>
                  <dt>{n.what}</dt>
                  <dd>{n.cost}</dd>
                </div>
              ))}
            </dl>
            <Link className="btn btn--on-ink never__link" to="/switch">
              Comment changer d’application
            </Link>
          </div>
        </section>

        <Start />
      </main>
      <SiteFooter />
    </>
  );
}
