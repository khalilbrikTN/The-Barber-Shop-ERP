import { BOOKABLE, clientById, NOW, serviceById, staffById, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { useSettings } from "../lib/settings";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";

export function TV() {
  const f = useFormat();
  const { settings } = useSettings();
  const { queue, bookings } = useStore();
  const now = new Date(NOW).getTime();
  const nextBooked = bookings
    .filter((b) => b.start.startsWith(TODAY) && new Date(b.start).getTime() > now && b.status === "confirmed")
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3);

  return (
    <div className="app-root tv">
      <header className="tv__head">
        <strong>{settings.shopName}</strong>
        <time className="tv__clock num">{f.time(NOW)}</time>
      </header>

      <section className="tv__chairs" aria-label="Chairs">
        {BOOKABLE.map((s, i) => {
          const current = bookings.find((b) => b.staffId === s.id && b.status === "in the chair");
          return (
            <div key={s.id} className="tv__chair" data-free={!current || undefined}>
              <span>
                Chair {i + 1}, {s.name}
              </span>
              <strong>{current ? clientById(current.clientId)?.name : "Free"}</strong>
              <span>{current ? `until ${f.time(current.end)}` : "Next walk-in"}</span>
            </div>
          );
        })}
      </section>

      <div className="tv__body">
        <section aria-labelledby="tvq">
          <h1 id="tvq" className="tv__h">
            Walk-ins
          </h1>
          <table className="tv__table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">For</th>
                <th scope="col" className="r">Wait</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q, i) => (
                <tr key={q.id}>
                  <th scope="row">{q.name}</th>
                  <td>{serviceById(q.serviceId).name}</td>
                  <td className="r tv__wait num">
                    {waitFor(i, queue, bookings)}
                    <small>min</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {queue.length === 0 && <p className="tv__empty">No wait. Take a seat and you are next.</p>}
        </section>
        <section aria-labelledby="tvb">
          <h2 id="tvb" className="tv__h">
            Booked next
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
      <footer className="tv__foot">Scan the code on the window to join from your phone.</footer>
    </div>
  );
}
