import { QueueBoard } from "./components/QueueBoard";
import { Saturday } from "./sections/Saturday";
import { Cities } from "./sections/Cities";
import { Pricing } from "./sections/Pricing";
import { Questions } from "./sections/Questions";
import { Start } from "./sections/Start";
import { SiteFooter, SiteNav } from "./Chrome";

export default function Landing() {
  return (
    <>
      <SiteNav home />

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="container hero__grid">
            <div className="hero__text">
              <h1 id="hero-title">
                <span className="hero__figure num">0 %</span>
                <span className="hero__line">de chaque réservation pour nous.</span>
              </h1>
              <p className="lead">Rendez-vous, clients sans rendez-vous et paiements pour les barbiers et les salons, à prix fixe.</p>
              <div className="hero__actions">
                <a className="btn btn--primary" href="#start">
                  Commencer l’essai gratuit
                </a>
                <a className="btn btn--ghost" href="#day">
                  Voir un samedi
                </a>
              </div>
            </div>
            <QueueBoard />
          </div>
        </section>

        <Saturday />
        <Cities />

        <section className="statement" aria-label="Vos données">
          <div className="container">
            <p className="statement__text">Votre liste de clients part avec vous, en un seul fichier, le jour où vous le voulez.</p>
          </div>
        </section>

        <Pricing />
        <Questions />
        <Start />
      </main>

      <SiteFooter home />
    </>
  );
}
