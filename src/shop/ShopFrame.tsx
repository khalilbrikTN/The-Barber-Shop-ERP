import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lang, LANGS, useLang } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { loadSite } from "../lib/site";

export const SHOP = "/s/example-barbers";

export function ShopFrame({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  const { settings } = useSettings();
  const { t, lang, setLang, dir } = useLang();
  const site = loadSite();
  const [menu, setMenu] = useState(false);

  /* The page itself speaks the client's language, so screen readers and the browser's own controls follow it. */
  useEffect(() => {
    const html = document.documentElement;
    const prev = { lang: html.lang, dir: html.dir };
    html.lang = lang;
    html.dir = dir;
    return () => {
      html.lang = prev.lang;
      html.dir = prev.dir;
    };
  }, [lang, dir]);

  return (
    <div className="shop" data-preset={site.preset} data-accent={site.accent} data-menu={menu || undefined} lang={lang} dir={dir}>
      <a className="skip" href="#shop-main">
        {t("skip")}
      </a>
      <header className="shop__bar">
        <div className="shop__container shop__barin">
          <Link to={SHOP} className="shop__mark" aria-label={settings.shopName}>
            {site.logo ? <img src={site.logo} alt="" className="shop__logo" width={120} height={40} /> : null}
            <span dir="auto">{settings.shopName}</span>
          </Link>
          <nav aria-label={settings.shopName} className="shop__nav">
            <button type="button" className="shop__menu" aria-expanded={menu} aria-controls="shop-links" onClick={() => setMenu((m) => !m)}>
              {menu ? t("nav.close") : t("nav.menu")}
            </button>
            <span className="shop__navlinks" id="shop-links">
              <Link to={`${SHOP}/queue`}>{t("nav.queue")}</Link>
              <Link to="/account">{t("nav.bookings")}</Link>
            </span>
            <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
              {t("nav.book")}
            </Link>
          </nav>
        </div>
      </header>
      <main id="shop-main" className={narrow ? "shop__container shop__container--narrow" : undefined}>
        {children}
      </main>
      <footer className="shop__foot">
        <div className="shop__container">
          <p dir="auto">
            {settings.shopName}, {site.address}
          </p>
          <label className="shop__lang">
            <span>{t("nav.language")}</span>
            <select className="ui-input" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              {LANGS.map((l) => (
                <option key={l.id} value={l.id} lang={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <p className="shop__powered">
            {t("foot.by")} <Link to="/">Chairside</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
