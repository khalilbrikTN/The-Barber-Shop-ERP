import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteNav } from "./Chrome";
import { Start } from "./sections/Start";

const PLANS = ["Free", "Solo", "Shop", "Pro"];
const ROWS: { label: string; values: string[]; figure?: boolean }[] = [
  { label: "Each month, per location", values: ["€0", "€15", "€39", "€79"], figure: true },
  { label: "Bookable staff", values: ["1", "1", "Up to 6", "Up to 15"] },
  { label: "Messages a month", values: ["50", "300", "1,500", "4,000"] },
  { label: "Walk-in queue, deposits, loyalty", values: ["No", "No", "Yes", "Yes"] },
  { label: "Commissions and chair rent", values: ["No", "No", "Yes", "Yes"] },
  { label: "Custom roles and stock", values: ["No", "No", "No", "Yes"] },
  { label: "Your own domain", values: ["No", "No", "No", "Yes"] },
];

const NEVER = [
  { what: "Setting up", cost: "Free, with help over WhatsApp if you get stuck." },
  { what: "Each booking", cost: "Nothing, new clients included." },
  { what: "Card payments", cost: "Your provider’s fee, paid to them, never through us." },
  { what: "Leaving", cost: "Nothing. Your client list downloads in one file." },
  { what: "Switching from another app", cost: "Free. Bring your clients in one CSV file." },
];

export function PricingPage() {
  useEffect(() => {
    document.title = "Pricing, Chairside";
  }, []);
  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="pp-title">
          <div className="container">
            <h1 id="pp-title">One price a month. No cut.</h1>
            <p className="lead">Per location, in euros. Local prices in Egypt and Tunisia at launch.</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#start">
                Start free trial
              </a>
            </div>
          </div>
        </section>

        <section className="pricing pricing--page" aria-label="Plans compared">
          <div className="container">
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Plans compared">
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
                  {ROWS.map((r) => (
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
            <p className="pricing__note">Several locations: from €69 each, with reports across all of them.</p>
          </div>
        </section>

        <section className="never band--ink" aria-labelledby="never-title">
          <div className="container never__grid">
            <h2 id="never-title">What you never pay us for</h2>
            <dl className="never__rows">
              {NEVER.map((n) => (
                <div key={n.what}>
                  <dt>{n.what}</dt>
                  <dd>{n.cost}</dd>
                </div>
              ))}
            </dl>
            <Link className="btn btn--on-ink never__link" to="/switch">
              How switching works
            </Link>
          </div>
        </section>

        <Start />
      </main>
      <SiteFooter />
    </>
  );
}
