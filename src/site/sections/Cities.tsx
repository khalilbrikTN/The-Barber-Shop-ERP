const CITIES = [
  { city: "Cairo", locale: "en-EG", currency: "EGP", amount: 250, hour12: false, week: "Saturday" },
  { city: "Tunis", locale: "fr-TN", currency: "TND", amount: 25, hour12: false, week: "Monday" },
  { city: "Milan", locale: "it-IT", currency: "EUR", amount: 22, hour12: false, week: "Monday" },
  { city: "Paris", locale: "fr-FR", currency: "EUR", amount: 22, hour12: false, week: "Monday" },
  { city: "Berlin", locale: "de-DE", currency: "EUR", amount: 22, hour12: false, week: "Monday" },
];

const AT = new Date(Date.UTC(2026, 11, 12, 14, 30));

export function Cities() {
  return (
    <section className="cities band--ink" id="cities" aria-labelledby="cities-title">
      <div className="container">
        <div className="head head--split">
          <h2 id="cities-title">Your city, your currency, your clock</h2>
          <p className="lead">Each shop sets its own. English at launch, then Arabic, French, Italian and German.</p>
        </div>

        <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="cities-title">
          <table className="cities__table">
            <thead>
              <tr>
                <th scope="col">Shop in</th>
                <th scope="col" className="opt">Currency</th>
                <th scope="col" className="opt">Week starts</th>
                <th scope="col" className="r">A price shows as</th>
                <th scope="col" className="r">Half past two shows as</th>
              </tr>
            </thead>
            <tbody>
              {CITIES.map((c) => (
                <tr key={c.city}>
                  <th scope="row">{c.city}</th>
                  <td className="opt">{c.currency}</td>
                  <td className="opt">{c.week}</td>
                  <td className="r figure">
                    {new Intl.NumberFormat(c.locale, { style: "currency", currency: c.currency, maximumFractionDigits: 0 }).format(c.amount)}
                  </td>
                  <td className="r figure">
                    {new Intl.DateTimeFormat(c.locale, { hour: "numeric", minute: "2-digit", hour12: c.hour12, timeZone: "UTC" }).format(AT)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
