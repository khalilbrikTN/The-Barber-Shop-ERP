import { useEffect, useRef, useState } from "react";
import { SCREENS } from "../components/PhoneScreens";

const PANELS = [
  { title: "Un rendez-vous se confirme tout seul", line: "Le rappel part sur WhatsApp. Un geste pour confirmer, un geste pour déplacer." },
  { title: "Un client sans rendez-vous s’inscrit depuis le trottoir", line: "Un QR code sur la vitrine le met dans la file, avec un message quand c’est bientôt son tour." },
  { title: "Une annulation se remplace toute seule", line: "Le créneau libéré part à la liste d’attente. Le premier qui répond le prend." },
  { title: "La caisse se compte toute seule", line: "Carte et portefeuille mobile sont comptés à part. La caisse doit contenir les espèces et le fond de caisse." },
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
          <h2 id="day-title">Un samedi, quatre écrans</h2>
          <p className="lead">Ce que voient le salon et ses clients, du premier rappel au dernier comptage.</p>
        </div>

        <div className="pin">
          <div className="pin__visual">
            <div className="phone" data-slot="day" data-kind="product" data-alt="Écrans de téléphone du client et de l’accueil, un pour chaque moment de la journée">
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
