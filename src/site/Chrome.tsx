import { useState } from "react";
import { Link } from "react-router-dom";

/** Nav and footer shared by the marketing pages. On the home page the links are anchors; elsewhere they lead home. */
export function SiteNav({ home = false }: { home?: boolean }) {
  const a = (id: string) => (home ? `#${id}` : `/#${id}`);
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      <header className="nav" data-open={open || undefined}>
        <div className="container nav__bar">
          <Link className="nav__mark" to="/" aria-label="Chairside, accueil">
            Chairside
          </Link>
          <button type="button" className="nav__menu" aria-expanded={open} aria-controls="site-links" onClick={() => setOpen((o) => !o)}>
            {open ? "Fermer" : "Menu"}
          </button>
          <nav aria-label="Site" id="site-links">
            <ul className="nav__links">
              <li>
                <a href={a("day")}>Un samedi</a>
              </li>
              <li>
                <Link to="/pricing">Tarifs</Link>
              </li>
              <li>
                <Link to="/switch">Changer d’application</Link>
              </li>
              <li>
                <a href="/app">Voir l’application</a>
              </li>
              <li className="nav__phone-only">
                <a href={a("start")}>Essai gratuit</a>
              </li>
            </ul>
          </nav>
          <a className="btn btn--on-ink nav__action" href={a("start")}>
            Essai gratuit
          </a>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ home = false }: { home?: boolean }) {
  const a = (id: string) => (home ? `#${id}` : `/#${id}`);
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <Link className="footer__mark" to="/">
          Chairside
        </Link>
        <nav className="footer__col" aria-label="Produit">
          <h2 className="footer__title">Produit</h2>
          <ul>
            <li>
              <a href={a("top")}>Écran de file d’attente</a>
            </li>
            <li>
              <a href={a("cities")}>Langues</a>
            </li>
            <li>
              <Link to="/pricing">Tarifs</Link>
            </li>
            <li>
              <Link to="/switch">Changer d’application</Link>
            </li>
          </ul>
        </nav>
        <nav className="footer__col" aria-label="Aide">
          <h2 className="footer__title">Aide</h2>
          <ul>
            <li>
              <Link to="/help">Centre d’aide</Link>
            </li>
            <li>
              <a href={a("start")}>Commencer un essai</a>
            </li>
            <li>
              <span className="fill" data-fill="contact">Adresse de contact à venir</span>
            </li>
          </ul>
        </nav>
        <p className="footer__legal">Chairside, 2026. Fait pour les barbiers et les salons de coiffure en Tunisie.</p>
      </div>
    </footer>
  );
}
