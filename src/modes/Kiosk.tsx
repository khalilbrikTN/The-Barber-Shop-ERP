import { FormEvent, useState } from "react";
import { NOW, serviceById, SERVICES } from "../lib/data";
import { useSettings } from "../lib/settings";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";

const QUICK = ["fade", "fadebeard", "beard", "buzz", "kids", "shave"];

export function Kiosk() {
  const { settings } = useSettings();
  const { queue, bookings, addToQueue } = useStore();
  const [service, setService] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState<{ name: string; pos: number; wait: number } | null>(null);

  function join(e: FormEvent) {
    e.preventDefault();
    if (!service || !name.trim()) return;
    addToQueue({ name: name.trim(), serviceId: service, joined: NOW, via: "kiosk" });
    setJoined({ name: name.trim(), pos: queue.length + 1, wait: waitFor(queue.length, queue, bookings) });
    setName("");
    setService(null);
    window.setTimeout(() => setJoined(null), 8000);
  }

  return (
    <div className="app-root kiosk">
      <header className="kiosk__top">
        <strong>{settings.shopName}</strong>
        <span>{queue.length} waiting</span>
      </header>
      {joined ? (
        <section className="kiosk__done" aria-live="polite">
          <p>You are number</p>
          <p className="kiosk__figure num">{joined.pos}</p>
          <p>
            About {joined.wait} minutes, {joined.name}. Take a seat; your name comes up on the screen.
          </p>
        </section>
      ) : (
        <form className="kiosk__form" onSubmit={join}>
          <h1>Join the queue</h1>
          <fieldset className="ui-fieldset">
            <legend>What are you having?</legend>
            <div className="kiosk__grid">
              {QUICK.map((id) => (
                <label key={id} className="kiosk__choice">
                  <input type="radio" name="svc" checked={service === id} onChange={() => setService(id)} />
                  <span>
                    <strong>{serviceById(id).name}</strong>
                    <small>{serviceById(id).minutes} min</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="kiosk__name">
            <span>Your first name</span>
            <input className="ui-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </label>
          <button type="submit" className="ui-btn ui-btn--primary kiosk__go" disabled={!service || !name.trim()}>
            Join the queue
          </button>
          <p className="kiosk__hint">{SERVICES.length > QUICK.length ? "Colour and longer services: ask at the desk." : ""}</p>
        </form>
      )}
    </div>
  );
}
