import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findSlots } from "../lib/availability";
import { clientById, serviceById, staffById } from "../lib/data";
import { useFormat } from "../lib/format";
import { useStore } from "../lib/store";
import { SHOP, ShopFrame } from "./ShopFrame";

export function Manage() {
  const { id } = useParams();
  const f = useFormat();
  const { bookings, moveBooking, setStatus } = useStore();
  const b = bookings.find((x) => x.id === id);
  const [mode, setMode] = useState<"view" | "move" | "cancel">("view");
  const [slot, setSlot] = useState("");

  if (!b)
    return (
      <ShopFrame narrow>
        <div className="book">
          <h1>That booking link has expired</h1>
          <p>Ask the shop on WhatsApp, or book a new time.</p>
          <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
            Book a chair
          </Link>
        </div>
      </ShopFrame>
    );

  const day = b.start.slice(0, 10);
  const slots = findSlots({ date: day, serviceIds: b.serviceIds, staffId: b.staffId, bookings: bookings.filter((x) => x.id !== b.id) });

  return (
    <ShopFrame narrow>
      <div className="book">
        <h1>{b.status === "cancelled" ? "Booking cancelled" : `Your booking, ${clientById(b.clientId)?.name}`}</h1>
        <dl className="book__summary">
          <div>
            <dt>When</dt>
            <dd>
              {f.day(b.start)}, {f.time(b.start)}
            </dd>
          </div>
          <div>
            <dt>With</dt>
            <dd>{staffById(b.staffId).name}</dd>
          </div>
          <div>
            <dt>For</dt>
            <dd>{b.serviceIds.map((s) => serviceById(s).name).join(", ")}</dd>
          </div>
        </dl>

        {b.status !== "cancelled" && mode === "view" && (
          <div className="shop-hero__actions">
            <button type="button" className="shop__btn shop__btn--primary" onClick={() => setMode("move")}>
              Move it
            </button>
            <button type="button" className="shop__btn" onClick={() => setMode("cancel")}>
              Cancel it
            </button>
          </div>
        )}

        {mode === "move" && (
          <section aria-labelledby="move-title">
            <h2 id="move-title">Free times that day with {staffById(b.staffId).name}</h2>
            <div className="slot-grid slot-grid--big">
              {slots.map((s) => (
                <label key={s.start} className="slot">
                  <input type="radio" name="slot" checked={slot === s.start} onChange={() => setSlot(s.start)} />
                  <span className="num">{f.time(s.start)}</span>
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
                Move to {slot ? f.time(slot) : "this time"}
              </button>
              <button type="button" className="shop__btn" onClick={() => setMode("view")}>
                Keep it as it is
              </button>
            </div>
          </section>
        )}

        {mode === "cancel" && (
          <section aria-labelledby="cancel-title" className="shop-confirm">
            <h2 id="cancel-title">Cancel this booking?</h2>
            <p>The time goes to the next person on the waitlist. Cancelling now is free.</p>
            <div className="shop-hero__actions">
              <button
                type="button"
                className="shop__btn shop__btn--primary"
                onClick={() => {
                  setStatus(b.id, "cancelled");
                  setMode("view");
                }}
              >
                Yes, cancel it
              </button>
              <button type="button" className="shop__btn" onClick={() => setMode("view")}>
                Keep my booking
              </button>
            </div>
          </section>
        )}

        {b.status === "cancelled" && (
          <Link to={`${SHOP}/book`} className="shop__btn shop__btn--primary">
            Book another time
          </Link>
        )}
      </div>
    </ShopFrame>
  );
}
