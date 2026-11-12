/* The same shop, read in each language its clients use in Tunisia. Every row is formatted live by Intl. */
const LANGS = [
  { lang: "Français", locale: "fr-TN", dir: "De gauche à droite" },
  { lang: "العربية", locale: "ar-TN", dir: "De droite à gauche" },
  { lang: "English", locale: "en-TN", dir: "De gauche à droite" },
];

const AT = new Date(Date.UTC(2026, 11, 12, 13, 30)); // 14:30 in Tunis

export function Cities() {
  return (
    <section className="cities band--ink" id="cities" aria-labelledby="cities-title">
      <div className="container">
        <div className="head head--split">
          <h2 id="cities-title">En dinars, à l’heure de Tunis, dans la langue du client</h2>
          <p className="lead">Votre équipe travaille en français. Vos clients réservent en français, en arabe ou en anglais.</p>
        </div>

        <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="cities-title">
          <table className="cities__table">
            <thead>
              <tr>
                <th scope="col">Le client lit en</th>
                <th scope="col" className="opt">Sens de lecture</th>
                <th scope="col" className="r">Un dégradé à 20 DT s’affiche</th>
                <th scope="col" className="r">14 h 30 s’affiche</th>
              </tr>
            </thead>
            <tbody>
              {LANGS.map((c) => (
                <tr key={c.locale}>
                  <th scope="row" lang={c.locale.slice(0, 2)}>
                    {c.lang}
                  </th>
                  <td className="opt">{c.dir}</td>
                  <td className="r figure">{new Intl.NumberFormat(c.locale, { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(20)}</td>
                  <td className="r figure">{new Intl.DateTimeFormat(c.locale, { hour: "numeric", minute: "2-digit", hour12: false, timeZone: "Africa/Tunis" }).format(AT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
