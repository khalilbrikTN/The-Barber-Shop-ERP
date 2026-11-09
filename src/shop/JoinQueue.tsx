import { FormEvent, useState } from "react";
import { NOW, serviceById, SERVICES } from "../lib/data";
import { useFormat } from "../lib/format";
import { useLang } from "../lib/i18n";
import { useStore } from "../lib/store";
import { waitFor } from "../app/screens/Queue";
import { ShopFrame } from "./ShopFrame";

export function JoinQueue() {
  const { t, tp, s, locale, lang } = useLang();
  const sep = lang === "ar" ? "، " : ", ";
  const f = useFormat(locale);
  const { queue, bookings, addToQueue, removeFromQueue } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("fade");
  const [mine, setMine] = useState<string | null>(null);
  const [error, setError] = useState("");

  const myIndex = mine ? queue.findIndex((q) => q.name === mine && q.via === "website") : -1;

  function join(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("queue.errName"));
      document.getElementById("jq-name")?.focus();
      return;
    }
    setError("");
    addToQueue({ name: name.trim(), serviceId: service, joined: NOW, via: "website", phone });
    setMine(name.trim());
  }

  return (
    <ShopFrame narrow>
      <div className="book">
        {mine && myIndex >= 0 ? (
          <>
            <h1>{t("queue.inLine")}</h1>
            <div className="shop-sign shop-sign--wide" role="status">
              <p className="shop-sign__label">{t("queue.place")}</p>
              <p className="shop-sign__figure num">{f.num(myIndex + 1)}</p>
              <p>{t("queue.about", { minutes: tp("min.count", waitFor(myIndex, queue, bookings)), service: s(serviceById(queue[myIndex].serviceId).name) })}</p>
            </div>
            <p>{t("queue.leaveWhen")}</p>
            <button
              type="button"
              className="shop__btn"
              onClick={() => {
                removeFromQueue(queue[myIndex].id);
                setMine(null);
              }}
            >
              {t("queue.leave")}
            </button>
          </>
        ) : (
          <form onSubmit={join} noValidate>
            <h1>{t("queue.title")}</h1>
            <p>{t("queue.now", { n: f.num(queue.length), minutes: tp("min.count", waitFor(queue.length, queue, bookings)) })}</p>
            <div className="ui-field">
              <label htmlFor="jq-name">{t("queue.first")}</label>
              <input id="jq-name" className="ui-input" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error || undefined} aria-describedby={error ? "jq-err" : undefined} />
              {error && (
                <p className="ui-error" id="jq-err">
                  {error}
                </p>
              )}
            </div>
            <div className="ui-field">
              <label htmlFor="jq-phone">{t("queue.phone")}</label>
              <input id="jq-phone" className="ui-input" type="tel" autoComplete="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="ui-field">
              <label htmlFor="jq-svc">{t("queue.forWhat")}</label>
              <select id="jq-svc" className="ui-input" value={service} onChange={(e) => setService(e.target.value)}>
                {SERVICES.filter((x) => !x.deposit).map((x) => (
                  <option key={x.id} value={x.id}>
                    {`${s(x.name)}${sep}${f.num(x.minutes)} ${t("min")}`}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="shop__btn shop__btn--primary shop__btn--block">
              {t("queue.join")}
            </button>
          </form>
        )}
      </div>
    </ShopFrame>
  );
}
