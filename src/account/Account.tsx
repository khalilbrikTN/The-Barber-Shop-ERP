import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { clientById, NOW, OFFERS, serviceById, staffById } from "../lib/data";
import { useFormat } from "../lib/format";
import { useLang } from "../lib/i18n";
import { useSession } from "../lib/session";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "../shop/ShopFrame";
import { Toggle } from "../ui/kit";

const GOAL = 10;

export function Account() {
  const { t, tp, s, locale, lang } = useLang();
  const f = useFormat(locale);
  const sep = lang === "ar" ? "، " : ", ";
  const { bookings, sales, updateClient } = useStore();
  const { client: session, signOutClient } = useSession();
  const navigate = useNavigate();
  const ME = session?.clientId ?? "";
  const me = clientById(ME);
  const [offersOn, setOffersOn] = useState(me?.marketing ?? false);
  if (!me) return <Navigate to="/account/login" replace />;
  const now = new Date(NOW).getTime();
  const mine = bookings.filter((b) => b.clientId === ME);
  const upcoming = mine.filter((b) => new Date(b.end).getTime() > now && b.status !== "cancelled" && b.status !== "done");
  const past = mine.filter((b) => !upcoming.includes(b) && b.status !== "cancelled");
  const receipts = sales.filter((x) => x.clientId === ME);

  return (
    <ShopFrame narrow>
      <div className="book account">
        <h1>{t("acc.hello", { name: me.name })}</h1>

        <section aria-labelledby="up-title">
          <h2 id="up-title">{t("acc.upcoming")}</h2>
          {upcoming.length === 0 ? (
            <div className="ui-note">
              <p>{t("acc.nothing")}</p>
              <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
                {t("site.book")}
              </Link>
            </div>
          ) : (
            <ul className="account__list">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <span>
                    <strong>
                      {f.day(b.start, "short")}
                      {sep}
                      {f.time(b.start)}
                    </strong>
                    <span>
                      {b.serviceIds.map((x) => s(serviceById(x).name)).join(sep)}
                      {sep}
                      {staffById(b.staffId).name}
                    </span>
                  </span>
                  <Link to={`${SHOP}/manage/${b.id}`}>{t("acc.change")}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="loy-title">
          <h2 id="loy-title">{t("acc.loyalty")}</h2>
          <div className="punch" role="img" aria-label={`${f.num(me.punches)} / ${f.num(GOAL)}`}>
            {Array.from({ length: GOAL }, (_, i) => (
              <span key={i} className="punch__cell num" data-on={i < me.punches || undefined} aria-hidden="true">
                {f.num(i + 1)}
              </span>
            ))}
          </div>
          <p>{tp("acc.toFree", GOAL - me.punches)}</p>
        </section>

        <section aria-labelledby="off-title">
          <h2 id="off-title">{t("acc.offers")}</h2>
          <ul className="shop-offers shop-offers--stack">
            {OFFERS.filter((o) => o.live).map((o) => (
              <li key={o.id}>
                <strong>{s(o.title)}</strong>
                <p>{s(o.body)}</p>
                {o.code && <small>{t("site.code", { code: o.code })}</small>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="past-title">
          <h2 id="past-title">{t("acc.past")}</h2>
          {past.length === 0 ? (
            <p className="app-quiet">{t("acc.pastEmpty")}</p>
          ) : (
            <ul className="account__list">
              {past.map((b) => (
                <li key={b.id}>
                  <span>
                    <strong>{f.date(b.start)}</strong>
                    <span>{b.serviceIds.map((x) => s(serviceById(x).name)).join(sep)}</span>
                  </span>
                  <Link to={`${SHOP}/book?staff=${b.staffId}&service=${b.serviceIds[0]}`}>{t("acc.again")}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="rec-title">
          <h2 id="rec-title">{t("acc.receipts")}</h2>
          {receipts.length === 0 ? (
            <p className="app-quiet">{t("acc.receiptsEmpty")}</p>
          ) : (
            <ul className="account__list">
              {receipts.map((r) => (
                <li key={r.id}>
                  <span>
                    <strong>{f.date(r.time)}</strong>
                    <span>{r.lines.map((l) => s(l.label)).join(sep)}</span>
                  </span>
                  <span className="num">{f.money(r.lines.reduce((sum, l) => sum + l.minor, 0) + r.tipMinor)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="pref-title">
          <h2 id="pref-title">{t("acc.prefs")}</h2>
          <dl className="book__summary">
            <div>
              <dt>{t("acc.phone")}</dt>
              <dd dir="ltr">{me.phone}</dd>
            </div>
            <div>
              <dt>{t("acc.usual")}</dt>
              <dd>{me.favourite ? staffById(me.favourite).name : t("book.anyone")}</dd>
            </div>
            <div>
              <dt>{t("acc.gift")}</dt>
              <dd className="num">{f.money(0)}</dd>
            </div>
          </dl>
          <Toggle
            checked={offersOn}
            onChange={(v) => {
              setOffersOn(v);
              updateClient(ME, { marketing: v });
            }}
            label={t("acc.offersToggle")}
          />
          <p className="app-quiet">{t("acc.always")}</p>
          <button
            type="button"
            className="shop__btn shop__btn--text"
            onClick={() => {
              signOutClient();
              navigate(SHOP, { replace: true });
            }}
          >
            {t("acc.signOut")}
          </button>
        </section>
      </div>
    </ShopFrame>
  );
}
