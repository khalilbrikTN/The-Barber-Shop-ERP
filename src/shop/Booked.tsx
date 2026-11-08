import { Link, useParams } from "react-router-dom";
import { clientById, serviceById, staffById } from "../lib/data";
import { useFormat } from "../lib/format";
import { useLang } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { loadSite } from "../lib/site";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "./ShopFrame";

function ics(opts: { id: string; start: string; end: string; title: string; where: string }) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chairside//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${opts.id}@chairside.app`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.where}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function Booked() {
  const { id } = useParams();
  const { t, s: tr, locale, lang } = useLang();
  const f = useFormat(locale);
  const sep = lang === "ar" ? "، " : ", ";
  const { settings } = useSettings();
  const { bookings } = useStore();
  const b = bookings.find((x) => x.id === id);
  const site = loadSite();

  if (!b)
    return (
      <ShopFrame narrow>
        <div className="book">
          <h1>{t("booked.missing")}</h1>
          <p>{t("booked.missingBody")}</p>
          <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
            {t("site.book")}
          </Link>
        </div>
      </ShopFrame>
    );

  const services = b.serviceIds.map((x) => tr(serviceById(x).name)).join(sep);
  const party = b.groupId ? bookings.filter((x) => x.groupId === b.groupId && x.id !== b.id) : [];

  return (
    <ShopFrame narrow>
      <div className="book">
        <h1>{t("booked.title")}</h1>
        <div className="shop-sign shop-sign--wide">
          <p className="shop-sign__label">{f.day(b.start)}</p>
          <p className="shop-sign__figure num">{f.time(b.start)}</p>
          <p>
            {services}
            {sep}
            {staffById(b.staffId).name}
          </p>
        </div>
        {party.map((p) => (
          <p key={p.id} className="book__party">
            {t("booked.and", { name: clientById(p.clientId)?.name ?? "", services: p.serviceIds.map((x) => tr(serviceById(x).name)).join(sep), time: f.time(p.start), barber: staffById(p.staffId).name })}
          </p>
        ))}
        <p>{t("booked.reminder")}</p>
        <div className="shop-hero__actions">
          <a className="shop__btn" href={ics({ id: b.id, start: b.start, end: b.end, title: `${b.serviceIds.map((x) => serviceById(x).name).join(", ")}, ${settings.shopName}`, where: site.address })} download="booking.ics">
            {t("booked.calendar")}
          </a>
          <Link className="shop__btn" to={`${SHOP}/manage/${b.id}`}>
            {t("booked.change")}
          </Link>
        </div>
      </div>
    </ShopFrame>
  );
}
