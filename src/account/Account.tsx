import { useState } from "react";
import { Link } from "react-router-dom";
import { clientById, NOW, OFFERS, serviceById, staffById } from "../lib/data";
import { useFormat } from "../lib/format";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "../shop/ShopFrame";
import { Toggle } from "../ui/kit";

const ME = "c1";
const GOAL = 10;

export function Account() {
  const f = useFormat();
  const { bookings } = useStore();
  const me = clientById(ME)!;
  const [offersOn, setOffersOn] = useState(me.marketing);
  const now = new Date(NOW).getTime();
  const mine = bookings.filter((b) => b.clientId === ME);
  const upcoming = mine.filter((b) => new Date(b.end).getTime() > now && b.status !== "cancelled" && b.status !== "done");
  const past = mine.filter((b) => !upcoming.includes(b));

  return (
    <ShopFrame narrow>
      <div className="book account">
        <h1>Hello, {me.name}</h1>

        <section aria-labelledby="up-title">
          <h2 id="up-title">Coming up</h2>
          {upcoming.length === 0 ? (
            <div className="ui-note">
              <p>Nothing booked.</p>
              <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
                Book a chair
              </Link>
            </div>
          ) : (
            <ul className="account__list">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <span>
                    <strong>
                      {f.day(b.start, "short")}, {f.time(b.start)}
                    </strong>
                    <span>
                      {b.serviceIds.map((s) => serviceById(s).name).join(", ")} with {staffById(b.staffId).name}
                    </span>
                  </span>
                  <Link to={`${SHOP}/manage/${b.id}`}>Change</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="loy-title">
          <h2 id="loy-title">Loyalty card</h2>
          <div className="punch" aria-label={`${me.punches} of ${GOAL} visits`}>
            {Array.from({ length: GOAL }, (_, i) => (
              <span key={i} className="punch__cell num" data-on={i < me.punches || undefined}>
                {i + 1}
              </span>
            ))}
          </div>
          <p>{GOAL - me.punches} more visits to a free cut.</p>
        </section>

        <section aria-labelledby="off-title">
          <h2 id="off-title">Offers for you</h2>
          <ul className="shop-offers shop-offers--stack">
            {OFFERS.filter((o) => o.live).map((o) => (
              <li key={o.id}>
                <strong>{o.title}</strong>
                <p>{o.body}</p>
                {o.code && <small>Code {o.code}</small>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="past-title">
          <h2 id="past-title">Past visits</h2>
          {past.length === 0 ? (
            <p className="app-quiet">Your past visits show here.</p>
          ) : (
            <ul className="account__list">
              {past.map((b) => (
                <li key={b.id}>
                  <span>
                    <strong>{f.date(b.start)}</strong>
                    <span>{b.serviceIds.map((s) => serviceById(s).name).join(", ")}</span>
                  </span>
                  <Link to={`${SHOP}/book?staff=${b.staffId}&service=${b.serviceIds[0]}`}>Book again</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="pref-title">
          <h2 id="pref-title">Preferences</h2>
          <dl className="book__summary">
            <div>
              <dt>Phone</dt>
              <dd>{me.phone}</dd>
            </div>
            <div>
              <dt>Usual barber</dt>
              <dd>{me.favourite ? staffById(me.favourite).name : "Anyone"}</dd>
            </div>
            <div>
              <dt>Gift card balance</dt>
              <dd className="num">{f.money(0)}</dd>
            </div>
          </dl>
          <Toggle checked={offersOn} onChange={setOffersOn} label="Send me offers on WhatsApp" />
          <p className="app-quiet">Reminders for your bookings always come. Offers only if you say yes.</p>
          <Link to="/account/login" className="shop__btn shop__btn--text">
            Sign out
          </Link>
        </section>
      </div>
    </ShopFrame>
  );
}
