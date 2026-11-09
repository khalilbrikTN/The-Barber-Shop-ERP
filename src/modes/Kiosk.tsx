import { FormEvent, useState } from "react";
import { NOW, serviceById, SERVICES } from "../lib/data";
import { Lang, LANGS, useLang } from "../lib/i18n";
import { useSettings } from "../lib/settings";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";

const QUICK = ["fade", "fadebeard", "beard", "buzz", "kids", "shave"];

export function Kiosk() {
  const { settings } = useSettings();
  const { queue, bookings, addToQueue } = useStore();
  const { t, tp, s, lang, setLang, dir } = useLang();
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
    <div className="app-root kiosk" lang={lang} dir={dir}>
      <header className="kiosk__top">
        <strong>{settings.shopName}</strong>
        <span>{tp("kiosk.waiting", queue.length)}</span>
        <div className="ui-seg" role="radiogroup" aria-label={t("nav.language")}>
          {LANGS.map((l) => (
            <button key={l.id} type="button" role="radio" lang={l.id} aria-checked={lang === l.id} className="ui-segbtn" onClick={() => setLang(l.id as Lang)}>
              {l.label}
            </button>
          ))}
        </div>
      </header>
      {joined ? (
        <section className="kiosk__done" aria-live="polite">
          <p>{t("kiosk.number")}</p>
          <p className="kiosk__figure num">{joined.pos}</p>
          <p>{t("kiosk.done", { minutes: tp("min.count", joined.wait), name: joined.name })}</p>
        </section>
      ) : (
        <form className="kiosk__form" onSubmit={join}>
          <h1>{t("queue.join")}</h1>
          <fieldset className="ui-fieldset">
            <legend>{t("kiosk.what")}</legend>
            <div className="kiosk__grid">
              {QUICK.map((id) => (
                <label key={id} className="kiosk__choice">
                  <input type="radio" name="svc" checked={service === id} onChange={() => setService(id)} />
                  <span>
                    <strong>{s(serviceById(id).name)}</strong>
                    <small>{tp("min.count", serviceById(id).minutes)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="kiosk__name">
            <span>{t("kiosk.name")}</span>
            <input className="ui-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </label>
          <button type="submit" className="ui-btn ui-btn--primary kiosk__go" disabled={!service || !name.trim()}>
            {t("queue.join")}
          </button>
          <p className="kiosk__hint">{SERVICES.length > QUICK.length ? t("kiosk.desk") : ""}</p>
        </form>
      )}
    </div>
  );
}
