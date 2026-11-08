import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BOOKABLE, OFFERS, SERVICES } from "../lib/data";
import { useFormat } from "../lib/format";
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
  const f = useFormat();
  const { settings } = useSettings();
  const { queue, bookings } = useStore();
  const site = loadSite();
  const categories = Array.from(new Set(SERVICES.map((s) => s.category)));
  const offers = OFFERS.filter((o) => o.live);
  const wait = queue.length ? waitFor(queue.length, queue, bookings) : 0;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
  const wa = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

  useEffect(() => {
    document.title = `${settings.shopName}, book a chair`;
    const data = {
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: settings.shopName,
      description: site.about,
      address: site.address,
      telephone: site.phone,
      url: window.location.href,
      openingHours: HOURS.filter(([, o]) => o).map(([d, o, c]) => `${d.slice(0, 2)} ${o}-${c}`),
      makesOffer: SERVICES.map((s) => ({ "@type": "Offer", name: s.name, price: s.priceMinor / 100, priceCurrency: settings.currency })),
    };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
    return () => tag.remove();
  }, [settings.shopName, settings.currency, site.about, site.address, site.phone]);

  return (
    <ShopFrame>
      <section className="shop-hero" aria-labelledby="shop-title">
        <div className="shop__container shop-hero__grid">
          <div>
            <h1 id="shop-title">{settings.shopName}</h1>
            <p className="shop-hero__line">{site.about}</p>
            <div className="shop-hero__actions">
              <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
                Book a chair
              </Link>
              <a href={wa} className="shop__btn" target="_blank" rel="noreferrer">
                WhatsApp us
              </a>
            </div>
          </div>
          <div className="shop-sign" aria-label="Right now">
            <p className="shop-sign__label">Walk-in wait right now</p>
            <p className="shop-sign__figure num">
              {wait}
              <small>min</small>
            </p>
            <p>{queue.length} in line. Open until 21:00 today.</p>
            <Link to={`${SHOP}/queue`} className="shop__btn shop__btn--onink">
              Join from here
            </Link>
          </div>
        </div>
      </section>

      {site.sections.services && (
        <section className="shop-sec" aria-labelledby="svc-title">
          <div className="shop__container">
            <h2 id="svc-title">Services and prices</h2>
            <div className="shop-menu">
              {categories.map((c) => (
                <div key={c} className="shop-menu__group">
                  <h3>{c}</h3>
                  <ul>
                    {SERVICES.filter((s) => s.category === c).map((s) => (
                      <li key={s.id}>
                        <span className="shop-menu__name">
                          <strong>{s.name}</strong>
                          <small>
                            {s.description} {s.minutes} min.
                          </small>
                        </span>
                        <span className="shop-menu__price num">{f.money(s.priceMinor, { whole: true })}</span>
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
            <h2 id="off-title">This month</h2>
            <ul className="shop-offers">
              {offers.map((o) => (
                <li key={o.id}>
                  <strong>{o.title}</strong>
                  <p>{o.body}</p>
                  <small>
                    Until {f.date(`${o.until}T12:00:00Z`)}
                    {o.code ? `. Code ${o.code}` : ""}
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
            <h2 id="team-title">Book with someone you know</h2>
            <ul className="shop-team">
              {BOOKABLE.map((s) => (
                <li key={s.id}>
                  <strong>{s.name}</strong>
                  <span>{s.role}</span>
                  <Link to={`${SHOP}/book?staff=${s.id}`}>Book with {s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="shop__container shop-info">
        {site.sections.hours && (
          <section aria-labelledby="hours-title">
            <h2 id="hours-title">Opening hours</h2>
            <table className="shop-hours">
              <tbody>
                {HOURS.map(([d, o, c]) => (
                  <tr key={d} data-today={d === "Saturday" || undefined}>
                    <th scope="row">{d}</th>
                    <td className="num">{o ? `${o} to ${c}` : "Closed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {site.sections.find && (
          <section aria-labelledby="find-title">
            <h2 id="find-title">Find us</h2>
            <p className="shop-find__addr">{site.address}</p>
            <div className="shop-hero__actions">
              <a href={mapUrl} className="shop__btn" target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="shop__btn">
                Call
              </a>
            </div>
            <p className="shop-find__ig">
              Instagram: <a href={`https://instagram.com/${site.instagram}`}>@{site.instagram}</a>
            </p>
          </section>
        )}
      </div>
    </ShopFrame>
  );
}
