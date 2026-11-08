import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findSlots } from "../lib/availability";
import { clientById, serviceById, staffById } from "../lib/data";
import { useFormat } from "../lib/format";
import { useLang } from "../lib/i18n";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "./ShopFrame";

export function Manage() {
  const { id } = useParams();
  const { t, s, locale, lang } = useLang();
  const f = useFormat(locale);
  const sep = lang === "ar" ? "، " : ", ";
  const { bookings, moveBooking, setStatus } = useStore();
  const b = bookings.find((x) => x.id === id);
  const [mode, setMode] = useState<"view" | "move" | "cancel">("view");
  const [slot, setSlot] = useState("");

  if (!b)
    return (
      <ShopFrame narrow>
        <div className="book">
          <h1>{t("manage.expired")}</h1>
          <p>{t("manage.expiredBody")}</p>
          <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
            {t("site.book")}
          </Link>
        </div>
      </ShopFrame>
    );

  const day = b.start.slice(0, 10);
  const slots = findSlots({ date: day, serviceIds: b.serviceIds, staffId: b.staffId, bookings: bookings.filter((x) => x.id !== b.id) });

  return (
    <ShopFrame narrow>
      <div className="book">
        <h1>{b.status === "cancelled" ? t("manage.cancelled") : t("manage.yours", { name: clientById(b.clientId)?.name ?? "" })}</h1>
        <dl className="book__summary">
          <div>
            <dt>{t("book.when")}</dt>
            <dd>
              {f.day(b.start)}
              {sep}
              {f.time(b.start)}
            </dd>
          </div>
          <div>
            <dt>{t("book.with")}</dt>
            <dd>{staffById(b.staffId).name}</dd>
          </div>
          <div>
            <dt>{t("book.for")}</dt>
            <dd>{b.serviceIds.map((x) => s(serviceById(x).name)).join(sep)}</dd>
          </div>
        </dl>

        {b.status !== "cancelled" && mode === "view" && (
          <div className="shop-hero__actions">
            <button type="button" className="shop__btn shop__btn--primary" onClick={() => setMode("move")}>
              {t("manage.move")}
            </button>
            <button type="button" className="shop__btn" onClick={() => setMode("cancel")}>
              {t("manage.cancel")}
            </button>
          </div>
        )}

        {mode === "move" && (
          <section aria-labelledby="move-title">
            <h2 id="move-title">{t("manage.free", { name: staffById(b.staffId).name })}</h2>
            <div className="slot-grid slot-grid--big">
              {slots.map((x) => (
                <label key={x.start} className="slot">
                  <input type="radio" name="slot" checked={slot === x.start} onChange={() => setSlot(x.start)} />
                  <span className="num">{f.time(x.start)}</span>
                </label>
              ))}
            </div>
            <div className="shop-hero__actions">
              <button
                type="button"
                className="shop__btn shop__btn--primary"
                disabled={!slot}
                onClick={() => {
                  moveBooking(b.id, b.staffId, slot);
                  setMode("view");
                  setSlot("");
                }}
              >
                {t("manage.moveTo", { time: slot ? f.time(slot) : t("manage.thisTime") })}
              </button>
              <button type="button" className="shop__btn" onClick={() => setMode("view")}>
                {t("manage.keep")}
              </button>
            </div>
          </section>
        )}

        {mode === "cancel" && (
          <section aria-labelledby="cancel-title" className="shop-confirm">
            <h2 id="cancel-title">{t("manage.sure")}</h2>
            <p>{t("manage.sureBody")}</p>
            <div className="shop-hero__actions">
              <button
                type="button"
                className="shop__btn shop__btn--primary"
                onClick={() => {
                  setStatus(b.id, "cancelled");
                  setMode("view");
                }}
              >
                {t("manage.yes")}
              </button>
              <button type="button" className="shop__btn" onClick={() => setMode("view")}>
                {t("manage.keepMine")}
              </button>
            </div>
          </section>
        )}

        {b.status === "cancelled" && (
          <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
            {t("manage.another")}
          </Link>
        )}
      </div>
    </ShopFrame>
  );
}
