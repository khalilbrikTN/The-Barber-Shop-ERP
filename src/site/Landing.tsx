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
                <span className="hero__figure num">0%</span>
                <span className="hero__line">of every booking goes to us.</span>
              </h1>
              <p className="lead">Bookings, walk-ins and payments for barbershops and salons, one flat price.</p>
              <div className="hero__actions">
                <a className="btn btn--primary" href="#start">
                  Start free trial
                </a>
                <a className="btn btn--ghost" href="#day">
                  See a Saturday
                </a>
              </div>
            </div>
            <QueueBoard />
          </div>
        </section>

        <Saturday />
        <Cities />

        <section className="statement" aria-label="Your data">
          <div className="container">
            <p className="statement__text">Your client list leaves with you, in one file, any day you like.</p>
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
