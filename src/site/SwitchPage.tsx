import { useEffect } from "react";
import { SiteFooter, SiteNav } from "./Chrome";
import { Start } from "./sections/Start";

const STEPS = [
  { title: "Exportez depuis votre ancienne application", line: "Cherchez Exporter dans sa liste de clients." },
  { title: "Importez le fichier", line: "Les clients sont reconnus par leur téléphone, jamais en double." },
  { title: "Vérifiez prestations et horaires", line: "Partez d’une liste toute prête et modifiez-la." },
  { title: "Partagez votre nouveau lien", line: "Bio Instagram, WhatsApp, la vitrine." },
];

const COMES = [
  { what: "Clients, téléphones, e-mails", how: "Oui, depuis le CSV" },
  { what: "Notes sur chaque client", how: "Oui, quand le fichier les contient" },
  { what: "Prestations et prix", how: "À partir d’un modèle que vous modifiez" },
  { what: "Rendez-vous à venir", how: "Ajoutez-les dans l’agenda ; leur import arrive plus tard" },
];

export function SwitchPage() {
  useEffect(() => {
    document.title = "Passer à Chairside";
  }, []);
  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="sw-title">
          <div className="container">
            <h1 id="sw-title">Changez d’application en une soirée</h1>
            <p className="lead">Apportez vos clients d’une autre application de réservation avec un seul fichier CSV.</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="/inscription">
                Commencer l’essai gratuit
              </a>
              <a className="btn btn--ghost" href="/app/clients/import">
                Essayer l’import
              </a>
            </div>
          </div>
        </section>

        <section className="steps" aria-labelledby="steps-title">
          <div className="container">
            <h2 id="steps-title">Exporter, importer, vérifier, partager</h2>
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
            <h2 id="comes-title">Ce qui est repris</h2>
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
