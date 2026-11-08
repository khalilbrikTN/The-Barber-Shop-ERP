import { Link, useParams } from "react-router-dom";
import { clientById, serviceById, staffById } from "../lib/data";
import { useFormat } from "../lib/format";
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
  const f = useFormat();
  const { settings } = useSettings();
  const { bookings } = useStore();
  const b = bookings.find((x) => x.id === id);
  const site = loadSite();

  if (!b)
    return (
      <ShopFrame narrow>
        <div className="book">
          <h1>We could not find that booking</h1>
          <p>Bookings in this preview are saved in the browser they were made in. Book again here to see the confirmation.</p>
          <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
            Book a chair
          </Link>
        </div>
      </ShopFrame>
    );

  const services = b.serviceIds.map((s) => serviceById(s).name).join(", ");
  const party = b.groupId ? bookings.filter((x) => x.groupId === b.groupId && x.id !== b.id) : [];

  return (
    <ShopFrame narrow>
      <div className="book">
        <h1>You are booked</h1>
        <div className="shop-sign shop-sign--wide">
          <p className="shop-sign__label">{f.day(b.start)}</p>
          <p className="shop-sign__figure num">{f.time(b.start)}</p>
          <p>
            {services} with {staffById(b.staffId).name}
          </p>
        </div>
        {party.map((p) => (
          <p key={p.id} className="book__party">
            And {clientById(p.clientId)?.name}: {p.serviceIds.map((s) => serviceById(s).name).join(", ")} at {f.time(p.start)} with {staffById(p.staffId).name}.
          </p>
        ))}
        <p>A WhatsApp reminder goes out the day before, once messages are connected.</p>
        <div className="shop-hero__actions">
          <a className="shop__btn" href={ics({ id: b.id, start: b.start, end: b.end, title: `${services}, ${settings.shopName}`, where: site.address })} download="booking.ics">
            Add to my calendar
          </a>
          <Link className="shop__btn" to={`${SHOP}/manage/${b.id}`}>
            Change or cancel
          </Link>
        </div>
      </div>
    </ShopFrame>
  );
}
