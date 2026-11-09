import { BOOKABLE, clientById, NOW, serviceById, staffById, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { useLang } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";

export function TV() {
  const { t, tp, s, lang, locale, dir } = useLang();
  const f = useFormat(locale);
  const { settings } = useSettings();
  const { queue, bookings } = useStore();
  const now = new Date(NOW).getTime();
  const nextBooked = bookings
    .filter((b) => b.start.startsWith(TODAY) && new Date(b.start).getTime() > now && b.status === "confirmed")
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3);

  return (
    <div className="app-root tv" lang={lang} dir={dir}>
      <header className="tv__head">
        <strong>{settings.shopName}</strong>
        <time className="tv__clock num">{f.time(NOW)}</time>
      </header>

      <section className="tv__chairs" aria-label={t("tv.chairs")}>
        {BOOKABLE.map((st, i) => {
          const current = bookings.find((b) => b.staffId === st.id && b.status === "in the chair");
          return (
            <div key={st.id} className="tv__chair" data-free={!current || undefined}>
              <span>{t("tv.chair", { n: f.num(i + 1), name: st.name })}</span>
              <strong>{current ? clientById(current.clientId)?.name : t("tv.free")}</strong>
              <span>{current ? t("tv.until", { time: f.time(current.end) }) : t("tv.nextWalkIn")}</span>
            </div>
          );
        })}
      </section>

      <div className="tv__body">
        <section aria-labelledby="tvq">
          <h1 id="tvq" className="tv__h">
            {t("tv.walkIns")}
          </h1>
          <table className="tv__table">
            <thead>
              <tr>
                <th scope="col">{t("tv.name")}</th>
                <th scope="col">{t("book.for")}</th>
                <th scope="col" className="r">{t("tv.wait")}</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q, i) => (
                <tr key={q.id}>
                  <th scope="row">{q.name}</th>
                  <td>{s(serviceById(q.serviceId).name)}</td>
                  <td className="r tv__wait num">
                    {f.num(waitFor(i, queue, bookings))}
                    <small>{t("min")}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {queue.length === 0 && <p className="tv__empty">{t("tv.noWait")}</p>}
        </section>
        <section aria-labelledby="tvb">
          <h2 id="tvb" className="tv__h">
            {t("tv.booked")}
          </h2>
          <ul className="tv__booked">
            {nextBooked.map((b) => (
              <li key={b.id}>
                <span className="num">{f.time(b.start)}</span>
                <strong>{clientById(b.clientId)?.name}</strong>
                <span>{staffById(b.staffId).name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <footer className="tv__foot">{t("tv.scan")}</footer>
    </div>
  );
}
