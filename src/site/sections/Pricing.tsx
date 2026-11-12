import { PLANS, usePrices } from "../prices";

const ROWS: { label: string; values: string[]; figure?: boolean }[] = [
  { label: "Membres réservables", values: ["1", "1", "Jusqu’à 6", "Jusqu’à 15"] },
  { label: "Messages par mois", values: ["50", "300", "1 500", "4 000"] },
  { label: "File sans rendez-vous et acomptes", values: ["Non", "Non", "Oui", "Oui"] },
  { label: "Votre propre nom de domaine", values: ["Non", "Non", "Non", "Oui"] },
];

export function Pricing() {
  const { prices, money, multi } = usePrices();
  const rows = [{ label: "Par mois", values: prices.plans.map(money), figure: true }, ...ROWS];
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="head head--split">
          <h2 id="pricing-title">Un prix par mois, jamais de commission</h2>
          <div>
            <p className="lead">Par salon, en dinars tunisiens.</p>
          </div>
        </div>

        <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="pricing-title">
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
        <p className="pricing__note">{multi}</p>
      </div>
    </section>
  );
}
