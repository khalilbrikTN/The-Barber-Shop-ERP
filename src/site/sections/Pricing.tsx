const PLANS = ["Free", "Solo", "Shop", "Pro"];

const ROWS: { label: string; values: string[]; figure?: boolean }[] = [
  { label: "Each month", values: ["€0", "€15", "€39", "€79"], figure: true },
  { label: "Bookable staff", values: ["1", "1", "Up to 6", "Up to 15"] },
  { label: "Messages a month", values: ["50", "300", "1,500", "4,000"] },
  { label: "Walk-in queue and deposits", values: ["No", "No", "Yes", "Yes"] },
  { label: "Your own domain", values: ["No", "No", "No", "Yes"] },
];

export function Pricing() {
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="head head--split">
          <h2 id="pricing-title">A monthly price, never a cut</h2>
          <p className="lead">Prices in euros, per location. Local prices in Egypt and Tunisia.</p>
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
        <p className="pricing__note">Several locations: from €69 each.</p>
      </div>
    </section>
  );
}
