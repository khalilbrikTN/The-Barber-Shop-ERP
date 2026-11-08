import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../lib/settings";
import { loadSite } from "../lib/site";

export const SHOP = "/s/example-barbers";

export function ShopFrame({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  const { settings } = useSettings();
  const site = loadSite();
  const [menu, setMenu] = useState(false);
  return (
    <div className="shop" data-preset={site.preset} data-accent={site.accent} data-menu={menu || undefined}>
      <a className="skip" href="#shop-main">
        Skip to content
      </a>
      <header className="shop__bar">
        <div className="shop__container shop__barin">
          <Link to={SHOP} className="shop__mark" aria-label={`${settings.shopName}, home`}>
            {site.logo ? <img src={site.logo} alt="" className="shop__logo" width={120} height={40} /> : null}
            <span>{settings.shopName}</span>
          </Link>
          <nav aria-label="Shop" className="shop__nav">
            <button type="button" className="shop__menu" aria-expanded={menu} aria-controls="shop-links" onClick={() => setMenu((m) => !m)}>
              {menu ? "Close" : "Menu"}
            </button>
            <span className="shop__navlinks" id="shop-links">
              <Link to={`${SHOP}/queue`}>Join the queue</Link>
              <Link to="/account">My bookings</Link>
            </span>
            <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
              Book
            </Link>
          </nav>
        </div>
      </header>
      <main id="shop-main" className={narrow ? "shop__container shop__container--narrow" : undefined}>
        {children}
      </main>
      <footer className="shop__foot">
        <div className="shop__container">
          <p>
            {settings.shopName}, {site.address}
          </p>
          <p className="shop__powered">
            Bookings by <Link to="/">Chairside</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
