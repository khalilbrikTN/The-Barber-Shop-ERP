import { useEffect, useRef, useState } from "react";
import { SCREENS } from "../components/PhoneScreens";

const PANELS = [
  { title: "A booking confirms itself", line: "The reminder goes out on WhatsApp. One tap confirms, one tap moves it." },
  { title: "A walk-in joins from the pavement", line: "A QR code on the window puts them in line, with a message when they are next." },
  { title: "A cancellation fills itself", line: "The free slot goes to the waitlist. The first to tap takes it." },
  { title: "The drawer counts itself", line: "Card and wallet are counted apart. The drawer should hold the cash and the float." },
];

export function Saturday() {
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    panels.current.forEach((p) => p && io.observe(p));
    return () => io.disconnect();
  }, []);

  return (
    <section className="saturday" id="day" aria-labelledby="day-title">
      <div className="container">
        <div className="head head--split">
          <h2 id="day-title">One Saturday, four screens</h2>
          <p className="lead">What the shop and its clients see, from the first reminder to the last count.</p>
        </div>

        <div className="pin">
          <div className="pin__visual">
            <div className="phone" data-slot="day" data-kind="product" data-alt="Phone screens from the client and front-desk apps, one for each moment of the day">
              {SCREENS.map((Screen, i) => (
                <div key={i} className="phone__state" hidden={i !== active}>
                  <Screen />
                </div>
              ))}
            </div>
          </div>

          <ol className="pin__panels">
            {PANELS.map((p, i) => {
              const Screen = SCREENS[i];
              return (
                <li
                  key={p.title}
                  className="pin__panel"
                  data-index={i}
                  data-active={i === active || undefined}
                  ref={(el) => {
                    panels.current[i] = el;
                  }}
                >
                  <h3>{p.title}</h3>
                  <p>{p.line}</p>
                  <div className="phone phone--inline" aria-hidden="true">
                    <Screen />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
