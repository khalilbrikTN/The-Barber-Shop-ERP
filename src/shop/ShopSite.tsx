import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BOOKABLE, OFFERS, SERVICES, TODAY } from "../lib/data";
import { useFormat } from "../lib/format";
import { useLang } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { loadSite } from "../lib/site";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";
import { SHOP, ShopFrame } from "./ShopFrame";

const HOURS = [
  ["Saturday", "10:00", "21:00"],
  ["Sunday", "10:00", "21:00"],
  ["Monday", "10:00", "21:00"],
  ["Tuesday", "10:00", "21:00"],
  ["Wednesday", "10:00", "21:00"],
  ["Thursday", "10:00", "22:00"],
  ["Friday", "", ""],
];

export function ShopSite() {
  const { t, s, locale, lang } = useLang();

  const f = useFormat(locale);
  const { settings } = useSettings();
  const { queue, bookings } = useStore();
  const site = loadSite();
  const about = (lang === "ar" && site.aboutAr) || (lang === "fr" && site.aboutFr) || s(site.about);
  const categories = Array.from(new Set(SERVICES.map((x) => x.category)));
  const offers = OFFERS.filter((o) => o.live);
  const wait = queue.length ? waitFor(queue.length, queue, bookings) : 0;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
  const wa = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

  useEffect(() => {
    document.title = `${settings.shopName}, ${t("site.book")}`;
    const data = {
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: settings.shopName,
      description: site.about,
      address: site.address,
      telephone: site.phone,
      url: window.location.href,
      openingHours: HOURS.filter(([, o]) => o).map(([d, o, c]) => `${d.slice(0, 2)} ${o}-${c}`),
      makesOffer: SERVICES.map((x) => ({ "@type": "Offer", name: x.name, price: x.priceMinor / 100, priceCurrency: settings.currency })),
    };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
    return () => tag.remove();
    // the title follows the language through locale
  }, [settings.shopName, settings.currency, site.about, site.address, site.phone, locale]);

  return (
    <ShopFrame>
      <section className="shop-hero" aria-labelledby="shop-title">
        <div className="shop__container shop-hero__grid">
          <div>
            <h1 id="shop-title" dir="auto">
              {settings.shopName}
            </h1>
            <p className="shop-hero__line" dir="auto">
              {about}
            </p>
            <div className="shop-hero__actions">
              <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
                {t("site.book")}
              </Link>
              <a href={wa} className="shop__btn" target="_blank" rel="noreferrer">
                {t("site.whatsapp")}
              </a>
            </div>
          </div>
          <div className="shop-sign" aria-labelledby="sign-label">
            <p className="shop-sign__label" id="sign-label">
              {t("site.waitNow")}
            </p>
            <p className="shop-sign__figure num">
              {f.num(wait)}
              <small>{t("min")}</small>
            </p>
            <p>{t("site.inLine", { n: f.num(queue.length), time: f.time(`${TODAY}T21:00:00+02:00`) })}</p>
            <Link to={`${SHOP}/queue`} className="shop__btn shop__btn--onink">
              {t("site.joinHere")}
            </Link>
          </div>
        </div>
      </section>

      {site.hero && (
        <figure className="shop-photo">
          <img src={site.hero} alt={t("site.heroAlt", { shop: settings.shopName })} />
        </figure>
      )}

      {site.sections.services && (
        <section className="shop-sec" aria-labelledby="svc-title">
          <div className="shop__container">
            <h2 id="svc-title">{t("site.services")}</h2>
            <div className="shop-menu">
              {categories.map((c) => (
                <div key={c} className="shop-menu__group">
                  <h3>{s(c)}</h3>
                  <ul>
                    {SERVICES.filter((x) => x.category === c).map((x) => (
                      <li key={x.id}>
                        <span className="shop-menu__name">
                          <strong>{s(x.name)}</strong>
                          <small>
                            {s(x.description)} {f.num(x.minutes)} {t("min")}
                          </small>
                        </span>
                        <span className="shop-menu__price num">{f.money(x.priceMinor, { whole: true })}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {site.sections.offers && offers.length > 0 && (
        <section className="shop-sec shop-sec--band" aria-labelledby="off-title">
          <div className="shop__container">
            <h2 id="off-title">{t("site.thisMonth")}</h2>
            <ul className="shop-offers">
              {offers.map((o) => (
                <li key={o.id}>
                  <strong>{s(o.title)}</strong>
                  <p>{s(o.body)}</p>
                  <small>
                    {t("site.until", { date: f.date(`${o.until}T12:00:00Z`) })}
                    {o.code ? `. ${t("site.code", { code: o.code })}` : ""}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {site.sections.team && (
        <section className="shop-sec" aria-labelledby="team-title">
          <div className="shop__container">
            <h2 id="team-title">{t("site.team")}</h2>
            <ul className="shop-team">
              {BOOKABLE.map((x) => (
                <li key={x.id}>
                  {x.photo && <img className="shop-team__photo" src={x.photo} alt="" loading="lazy" />}
                  <strong>{x.name}</strong>
                  <span>{s(x.role)}</span>
                  <Link to={`${SHOP}/book?staff=${x.id}`}>{t("site.bookWith", { name: x.name })}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {site.sections.gallery && site.gallery.length > 0 && (
        <section className="shop-sec" aria-labelledby="gal-title">
          <div className="shop__container">
            <h2 id="gal-title">{t("site.gallery")}</h2>
            <ul className="shop-gallery">
              {site.gallery.map((p, i) => (
                <li key={i}>
                  <img src={p.src} alt={p.alt} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="shop__container shop-info">
        {site.sections.hours && (
          <section aria-labelledby="hours-title">
            <h2 id="hours-title">{t("site.hours")}</h2>
            <table className="shop-hours">
              <tbody>
                {HOURS.map(([d, o, c]) => (
                  <tr key={d} data-today={d === "Saturday" || undefined}>
                    <th scope="row">{s(d)}</th>
                    <td className="num">{o ? t("site.to", { from: f.time(`${TODAY}T${o}:00+02:00`), to: f.time(`${TODAY}T${c}:00+02:00`) }) : t("site.closed")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {site.sections.find && (
          <section aria-labelledby="find-title">
            <h2 id="find-title">{t("site.find")}</h2>
            <p className="shop-find__addr" dir="auto">
              {s(site.address)}
            </p>
            <div className="shop-hero__actions">
              <a href={mapUrl} className="shop__btn" target="_blank" rel="noreferrer">
                {t("site.maps")}
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="shop__btn">
                {t("site.call")}
              </a>
            </div>
            <p className="shop-find__ig">
              {t("site.instagram")}:{" "}
              <a href={`https://instagram.com/${site.instagram}`}>
                <bdi>@{site.instagram}</bdi>
              </a>
            </p>
          </section>
        )}
      </div>
    </ShopFrame>
  );
}
