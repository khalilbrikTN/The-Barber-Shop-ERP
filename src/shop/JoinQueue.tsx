import { FormEvent, useState } from "react";
import { NOW, serviceById, SERVICES } from "../lib/data";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";
import { ShopFrame } from "./ShopFrame";

export function JoinQueue() {
  const { queue, bookings, addToQueue, removeFromQueue } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("fade");
  const [mine, setMine] = useState<{ name: string; id?: string } | null>(null);
  const [error, setError] = useState("");

  const myIndex = mine ? queue.findIndex((q) => q.name === mine.name && q.via === "website") : -1;

  function join(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Add your name so the board can call you.");
      return;
    }
    setError("");
    addToQueue({ name: name.trim(), serviceId: service, joined: NOW, via: "website", phone });
    setMine({ name: name.trim() });
  }

  return (
    <ShopFrame narrow>
      <div className="book">
        {mine && myIndex >= 0 ? (
          <>
            <h1>You are in line</h1>
            <div className="shop-sign shop-sign--wide">
              <p className="shop-sign__label">Your place</p>
              <p className="shop-sign__figure num">{myIndex + 1}</p>
              <p>
                About {waitFor(myIndex, queue, bookings)} minutes for a {serviceById(queue[myIndex].serviceId).name.toLowerCase()}.
              </p>
            </div>
            <p>Leave when you are second. A WhatsApp message tells you, once messages are connected; until then keep this page open.</p>
            <button
              type="button"
              className="shop__btn"
              onClick={() => {
                removeFromQueue(queue[myIndex].id);
                setMine(null);
              }}
            >
              Leave the queue
            </button>
          </>
        ) : (
          <form onSubmit={join} noValidate>
            <h1>Join the queue from here</h1>
            <p>
              {queue.length} in line now, about {waitFor(queue.length, queue, bookings)} minutes.
            </p>
            <div className="ui-field">
              <label htmlFor="jq-name">First name</label>
              <input id="jq-name" className="ui-input" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error || undefined} />
              {error && <p className="ui-error">{error}</p>}
            </div>
            <div className="ui-field">
              <label htmlFor="jq-phone">Phone, for the “you are next” message</label>
              <input id="jq-phone" className="ui-input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="ui-field">
              <label htmlFor="jq-svc">For</label>
              <select id="jq-svc" className="ui-input" value={service} onChange={(e) => setService(e.target.value)}>
                {SERVICES.filter((s) => !s.deposit).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}, {s.minutes} min
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              Join the queue
            </button>
          </form>
        )}
      </div>
    </ShopFrame>
  );
}
