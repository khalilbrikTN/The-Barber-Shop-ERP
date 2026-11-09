import { RegionSwitch, useRegion } from "../prices";

const PLANS = ["Free", "Solo", "Shop", "Pro"];

const ROWS: { label: string; values: string[]; figure?: boolean }[] = [
  { label: "Bookable staff", values: ["1", "1", "Up to 6", "Up to 15"] },
  { label: "Messages a month", values: ["50", "300", "1,500", "4,000"] },
  { label: "Walk-in queue and deposits", values: ["No", "No", "Yes", "Yes"] },
  { label: "Your own domain", values: ["No", "No", "No", "Yes"] },
];

export function Pricing() {
  const { region, setRegion, meta, prices, money, multi } = useRegion();
  const rows = [{ label: "Each month", values: prices.plans.map(money), figure: true }, ...ROWS];
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="head head--split">
          <h2 id="pricing-title">A monthly price, never a cut</h2>
          <div>
            <p className="lead">Per location, in {meta.currencyName}.</p>
            <RegionSwitch region={region} setRegion={setRegion} />
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
