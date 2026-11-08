import { useState } from "react";

type Entry = { name: string; with: string; service: string; wait: number; walkIn?: boolean };

const CHAIRS: Record<string, number> = { Karim: 1, Marco: 2, Hana: 3 };

const START: Entry[] = [
  { name: "Lina", with: "Hana", service: "Cut and blow-dry", wait: 0 },
  { name: "Sami", with: "Anyone", service: "Beard trim", wait: 6, walkIn: true },
  { name: "Youssef", with: "Karim", service: "Skin fade", wait: 14 },
  { name: "Amira", with: "Hana", service: "Colour, roots", wait: 22 },
  { name: "Jonas", with: "Marco", service: "Kids cut", wait: 31, walkIn: true },
];

const ARRIVING: Omit<Entry, "wait">[] = [
  { name: "Inès", with: "Marco", service: "Fade and beard", walkIn: true },
  { name: "Tarek", with: "Anyone", service: "Hot towel shave" },
  { name: "Giulia", with: "Hana", service: "Fringe trim", walkIn: true },
  { name: "Omar", with: "Karim", service: "Buzz cut" },
];

function chairFor(e: Entry) {
  return e.with === "Anyone" ? "Chair 1, first free" : `Chair ${CHAIRS[e.with]}, with ${e.with}`;
}

export function QueueBoard() {
  const [queue, setQueue] = useState(START);
  const [arrived, setArrived] = useState(0);
  const [status, setStatus] = useState("Updated 10:42");
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
    setStatus(`${called.name} called. ${moved[0].name} is next.`);
    setTick((t) => t + 1);
  }

  return (
    <figure className="board" data-slot="hero" data-kind="product" data-alt="The Chairside queue board running on the shop's TV: who is next, and the wait for everyone in line">
      <header className="board__head">
        <span className="board__shop">Your shop</span>
        <span>Queue board</span>
        <time className="board__clock" dateTime="10:42">10:42</time>
      </header>

      <div className="board__next" key={`next-${tick}`}>
        <span className="board__next-label">Next</span>
        <span className="board__next-name">{next.name}</span>
        <span className="board__next-chair">{chairFor(next)}</span>
      </div>

      <table className="board__table">
        <thead>
          <tr>
            <th scope="col">Client</th>
            <th scope="col">With</th>
            <th scope="col" className="board__service-col">Service</th>
            <th scope="col" className="board__wait-col">Wait</th>
          </tr>
        </thead>
        <tbody>
          {waiting.map((e) => (
            <tr key={e.name}>
              <td className="board__client">
                {e.name}
                {e.walkIn && <small>walk-in</small>}
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
          Call next
        </button>
      </footer>
    </figure>
  );
}
