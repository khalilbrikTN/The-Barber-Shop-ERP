import { useState } from "react";

type Entry = { name: string; with: string; service: string; wait: number; walkIn?: boolean };

const CHAIRS: Record<string, number> = { Karim: 1, Mehdi: 2, Hana: 3 };

const START: Entry[] = [
  { name: "Yosra", with: "Hana", service: "Coupe et brushing", wait: 0 },
  { name: "Wassim", with: "Peu importe", service: "Taille de barbe", wait: 6, walkIn: true },
  { name: "Hamza", with: "Karim", service: "Dégradé à blanc", wait: 14 },
  { name: "Mariem", with: "Hana", service: "Couleur, racines", wait: 22 },
  { name: "Aymen", with: "Mehdi", service: "Coupe enfant", wait: 31, walkIn: true },
];

const ARRIVING: Omit<Entry, "wait">[] = [
  { name: "Sarra", with: "Mehdi", service: "Dégradé et barbe", walkIn: true },
  { name: "Bilel", with: "Peu importe", service: "Rasage à la serviette chaude" },
  { name: "Nesrine", with: "Hana", service: "Coupe de frange", walkIn: true },
  { name: "Skander", with: "Karim", service: "Coupe tondeuse" },
];

function chairFor(e: Entry) {
  return e.with === "Peu importe" ? "Fauteuil 1, le premier libre" : `Fauteuil ${CHAIRS[e.with]}, avec ${e.with}`;
}

export function QueueBoard() {
  const [queue, setQueue] = useState(START);
  const [arrived, setArrived] = useState(0);
  const [status, setStatus] = useState("Mis à jour à 10:42");
  const [tick, setTick] = useState(0);

  const next = queue[0];
  const waiting = queue.slice(1);

  function callNext() {
    const [called, ...rest] = queue;
    const step = rest[0]?.wait ?? 0;
    const moved = rest.map((e) => ({ ...e, wait: Math.max(0, e.wait - step) }));
    const incoming = ARRIVING[arrived % ARRIVING.length];
    const last = moved[moved.length - 1]?.wait ?? 0;
    setQueue([...moved, { ...incoming, wait: last + 8 }]);
    setArrived((n) => n + 1);
    setStatus(`${called.name} est appelé. ${moved[0].name} est le suivant.`);
    setTick((t) => t + 1);
  }

  return (
    <figure className="board" data-slot="hero" data-kind="product" data-alt="L’écran de file d’attente Chairside sur la télé du salon : qui est le suivant, et l’attente de chacun">
      <header className="board__head">
        <span className="board__shop">Votre salon</span>
        <span>File d’attente</span>
        <time className="board__clock" dateTime="10:42">10:42</time>
      </header>

      <div className="board__next" key={`next-${tick}`}>
        <span className="board__next-label">Suivant</span>
        <span className="board__next-name">{next.name}</span>
        <span className="board__next-chair">{chairFor(next)}</span>
      </div>

      <table className="board__table">
        <thead>
          <tr>
            <th scope="col">Client</th>
            <th scope="col">Avec</th>
            <th scope="col" className="board__service-col">Prestation</th>
            <th scope="col" className="board__wait-col">Attente</th>
          </tr>
        </thead>
        <tbody>
          {waiting.map((e) => (
            <tr key={e.name}>
              <td className="board__client">
                {e.name}
                {e.walkIn && <small>sans rdv</small>}
              </td>
              <td>{e.with}</td>
              <td className="board__service-col">{e.service}</td>
              <td className="board__wait num">
                {e.wait}
                <small>min</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="board__foot">
        <p className="board__status" role="status" key={`status-${tick}`} data-updated={tick > 0 || undefined}>
          {status}
        </p>
        <button type="button" className="btn btn--on-ink" onClick={callNext}>
          Appeler le suivant
        </button>
      </footer>
    </figure>
  );
}
