import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteNav } from "./Chrome";

type Article = { topic: string; q: string; a: string; link?: { to: string; label: string } };

const ARTICLES: Article[] = [
  { topic: "Premiers pas", q: "Combien de temps prend la mise en place ?", a: "Une dizaine de minutes : choisissez barbier ou salon, décochez les prestations que vous ne proposez pas, réglez vos horaires et ajoutez votre équipe. Votre lien de réservation marche tout de suite.", link: { to: "/setup", label: "Ouvrir la mise en place" } },
  { topic: "Premiers pas", q: "Puis-je reprendre mes clients d’une autre application ?", a: "Oui. Exportez un CSV depuis votre application actuelle, puis importez-le. Les clients sont reconnus par leur numéro de téléphone, donc personne n’est ajouté deux fois.", link: { to: "/switch", label: "Comment changer d’application" } },
  { topic: "Premiers pas", q: "Les dinars et l’heure de Tunis sont-ils réglés ?", a: "Oui. Les prix s’affichent en dinars avec leurs trois décimales, les heures à l’heure de Tunis, la semaine commence le lundi et la TVA par défaut est de 19 %. Les jours fériés tunisiens ferment l’agenda d’office." },
  { topic: "Rendez-vous", q: "Comment les clients réservent-ils ?", a: "Depuis la page de votre salon, le lien personnel d’un barbier, ou un lien que vous envoyez sur WhatsApp. Ils choisissent les prestations, un barbier ou le premier disponible, une heure, puis donnent un nom et un téléphone." },
  { topic: "Rendez-vous", q: "Qu’est-ce qui évite les absences ?", a: "Des rappels la veille et deux heures avant, un acompte sur les prestations longues, et un acompte automatique pour les clients avec deux absences ou plus." },
  { topic: "Rendez-vous", q: "Une coiffeuse peut-elle prendre une autre cliente pendant le temps de pose ?", a: "Oui. Indiquez le temps de pose sur la prestation, et l’agenda vous laisse y réserver quelqu’un." },
  { topic: "Sans rendez-vous", q: "Comment marche la file sans rendez-vous ?", a: "Les clients s’inscrivent avec un QR code sur votre vitrine, une tablette à l’entrée ou votre site. L’écran TV montre qui est le suivant, et leur téléphone reçoit un message quand ils sont deuxièmes." },
  { topic: "Sans rendez-vous", q: "Les rendez-vous et la file se gênent-ils ?", a: "Non. Les rendez-vous gardent leur heure, et les clients sans rendez-vous remplissent les trous entre eux." },
  { topic: "Argent", q: "Prenez-vous une commission sur les réservations ?", a: "Non. Vous payez le prix mensuel et rien par réservation, nouveaux clients compris.", link: { to: "/pricing", label: "Voir les tarifs" } },
  { topic: "Argent", q: "Comment les acomptes m’arrivent-ils ?", a: "Directement sur votre propre compte Konnect. Nous ne gardons jamais votre argent." },
  { topic: "Argent", q: "Est-ce que ça remplace ma caisse enregistreuse ?", a: "Pas encore. Continuez à remettre les reçus de votre caisse tant que notre connexion à la facturation électronique tunisienne n’est pas prête." },
  { topic: "Vos données", q: "Que se passe-t-il si je pars ?", a: "Téléchargez vos clients, rendez-vous et ventes en un seul fichier depuis Réglages. Ils vous appartiennent." },
  { topic: "Vos données", q: "Qui peut voir mes clients ?", a: "Seulement votre équipe, avec les autorisations que vous donnez à chaque rôle. Les autres salons ne les voient jamais, même quand un client réserve chez les deux." },
];

const TOPICS = Array.from(new Set(ARTICLES.map((a) => a.topic)));

export function HelpPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => {
    document.title = "Aide, Chairside";
  }, []);
  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? ARTICLES.filter((a) => `${a.q} ${a.a}`.toLowerCase().includes(needle)) : ARTICLES;
  }, [q]);

  return (
    <>
      <SiteNav />
      <main id="main">
        <section className="page-hero" aria-labelledby="help-title">
          <div className="container">
            <h1 id="help-title">Gérer votre salon avec Chairside</h1>
            <label className="help__search">
              <span>Chercher dans les réponses</span>
              <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="acomptes, sans rendez-vous, import" />
            </label>
          </div>
        </section>

        <section className="help" aria-label="Réponses">
          <div className="container">
            {hits.length === 0 ? (
              <p className="help__none" role="status">
                Rien ne correspond à « {q} ». Essayez un mot plus court, ou écrivez-nous sur WhatsApp.
              </p>
            ) : (
              TOPICS.filter((t) => hits.some((h) => h.topic === t)).map((t) => (
                <div key={t} className="help__group">
                  <h2>{t}</h2>
                  <div className="help__list">
                    {hits
                      .filter((h) => h.topic === t)
                      .map((h) => (
                        <details key={h.q} className="help__item" open={!!q.trim() || !!open[h.q]} onToggle={(e) => setOpen((o) => ({ ...o, [h.q]: (e.target as HTMLDetailsElement).open }))}>
                          <summary>{h.q}</summary>
                          {(!!q.trim() || open[h.q]) && (
                            <>
                              <p>{h.a}</p>
                              {h.link && (
                                <Link className="help__link" to={h.link.to}>
                                  {h.link.label}
                                </Link>
                              )}
                            </>
                          )}
                        </details>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
