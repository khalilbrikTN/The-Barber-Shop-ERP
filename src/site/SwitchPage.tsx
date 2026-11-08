import { useEffect } from "react";
import { SiteFooter, SiteNav } from "./Chrome";
import { Start } from "./sections/Start";

const STEPS = [
  { title: "Export from your old app", line: "Look for Export in its client list." },
  { title: "Import the file", line: "Clients are matched by phone, never doubled." },
  { title: "Check services and hours", line: "Start from a ready list and edit it." },
  { title: "Share your new link", line: "Instagram bio, WhatsApp, the window." },
];

const COMES = [
  { what: "Clients, phones, emails", how: "Yes, from the CSV" },
  { what: "Notes on each client", how: "Yes, when the file has them" },
  { what: "Services and prices", how: "From a template you edit" },
  { what: "Future bookings", how: "Add them in the calendar; importing them comes later" },
];

export function SwitchPage() {
  useEffect(() => {
    document.title = "Switching to Chairside";
  }, []);
  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="sw-title">
          <div className="container">
            <h1 id="sw-title">Move your shop in an evening</h1>
            <p className="lead">Bring your clients from another booking app with one CSV file.</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#start">
                Start free trial
              </a>
              <a className="btn btn--ghost" href="/app/clients/import">
                Try the import
              </a>
            </div>
          </div>
        </section>

        <section className="steps" aria-labelledby="steps-title">
          <div className="container">
            <h2 id="steps-title">Four steps</h2>
            <ol className="steps__list">
              {STEPS.map((s) => (
                <li key={s.title}>
                  <h3 className="steps__title">{s.title}</h3>
                  <p>{s.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="never band--ink" aria-labelledby="comes-title">
          <div className="container never__grid">
            <h2 id="comes-title">What comes across</h2>
            <dl className="never__rows">
              {COMES.map((c) => (
                <div key={c.what}>
                  <dt>{c.what}</dt>
                  <dd>{c.how}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Start />
      </main>
      <SiteFooter />
    </>
  );
}
