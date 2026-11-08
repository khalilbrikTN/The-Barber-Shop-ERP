import { useState } from "react";
import { Link } from "react-router-dom";

/** Nav and footer shared by the marketing pages. On the home page the links are anchors; elsewhere they lead home. */
export function SiteNav({ home = false }: { home?: boolean }) {
  const a = (id: string) => (home ? `#${id}` : `/#${id}`);
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="nav" data-open={open || undefined}>
        <div className="container nav__bar">
          <Link className="nav__mark" to="/" aria-label="Chairside, home">
            Chairside
          </Link>
          <button type="button" className="nav__menu" aria-expanded={open} aria-controls="site-links" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Menu"}
          </button>
          <nav aria-label="Site" id="site-links">
            <ul className="nav__links">
              <li>
                <a href={a("day")}>A Saturday</a>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <Link to="/switch">Switching</Link>
              </li>
              <li>
                <a href="/app">See the app</a>
              </li>
              <li className="nav__phone-only">
                <a href={a("start")}>Start free</a>
              </li>
            </ul>
          </nav>
          <a className="btn btn--on-ink nav__action" href={a("start")}>
            Start free
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
        <nav className="footer__col" aria-label="Product">
          <h2 className="footer__title">Product</h2>
          <ul>
            <li>
              <a href={a("top")}>Queue board</a>
            </li>
            <li>
              <a href={a("cities")}>Cities</a>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/switch">Switching</Link>
            </li>
          </ul>
        </nav>
        <nav className="footer__col" aria-label="Help">
          <h2 className="footer__title">Help</h2>
          <ul>
            <li>
              <Link to="/help">Help centre</Link>
            </li>
            <li>
              <a href={a("start")}>Start a trial</a>
            </li>
            <li>
              <span className="fill" data-fill="contact">Contact email to come</span>
            </li>
          </ul>
        </nav>
        <p className="footer__legal">Chairside, 2026. Made for barbershops and salons in any country.</p>
      </div>
    </footer>
  );
}
