import { useState } from "react";
import { HOLIDAYS_EG_2027, NOW, SERVICES } from "../../lib/data";
import { minorDigits, toMinor, useFormat } from "../../lib/format";
import { COUNTRY_PRESETS, useSettings } from "../../lib/settings";
import { Field, NotConnected, PageHead, Tabs, Toggle, useTab } from "../../ui/kit";
import { useT } from "../i18n";

const ZONES = ["Africa/Cairo", "Africa/Tunis", "Europe/Rome", "Europe/Paris", "Europe/Berlin", "Europe/London", "Asia/Dubai"];
const CURRENCIES = ["EGP", "TND", "EUR", "GBP", "AED", "USD"];
/** Format locales; their names come from Intl in the staff's language, so the list needs no translating. */
const LOCALES = ["en-EG", "en-GB", "fr-TN", "fr-FR", "it-IT", "de-DE", "ar-EG"];

export function SettingsScreen() {
  const tab = useTab("tab", "region");
  const { t } = useT();
  return (
    <>
      <PageHead title={t("nav.settings")} />
      <Tabs
        tabs={[
          { id: "region", label: t("set.tabRegion") },
          { id: "business", label: t("set.tabBusiness") },
          { id: "services", label: t("set.tabServices") },
          { id: "booking", label: t("set.tabBooking") },
          { id: "holidays", label: t("set.tabHolidays") },
          { id: "payments", label: t("set.tabPayments") },
          { id: "plan", label: t("set.tabPlan") },
        ]}
      />
      <div className="app-tabpanel" role="tabpanel">
        {tab === "region" && <Region />}
        {tab === "business" && <Business />}
        {tab === "services" && <Services />}
        {tab === "booking" && <BookingRules />}
        {tab === "holidays" && <Holidays />}
        {tab === "payments" && <Payments />}
        {tab === "plan" && <Plan />}
      </div>
    </>
  );
}

function Region() {
  const { settings, update } = useSettings();
  const f = useFormat();
  const { t, label, lang } = useT();
  const names = new Intl.DisplayNames([lang], { type: "language" });
  return (
    <div className="app-split">
      <form className="ui-form app-section" onSubmit={(e) => e.preventDefault()}>
        <Field label={t("set.country")} hint={t("set.countryHint")}>
          {(id, hint) => (
            <select id={id} aria-describedby={hint} className="ui-input" defaultValue="" onChange={(e) => e.target.value && update(COUNTRY_PRESETS[e.target.value])}>
              <option value="">{t("set.countryChoose")}</option>
              {Object.keys(COUNTRY_PRESETS).map((c) => (
                <option key={c} value={c}>
                  {label("country", c)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t("set.formats")}>
          {(id) => (
            <select id={id} className="ui-input" value={settings.locale} onChange={(e) => update({ locale: e.target.value })}>
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {names.of(l)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t("set.currency")} hint={t("set.currencyHint")}>
          {(id, hint) => (
            <select id={id} aria-describedby={hint} className="ui-input" value={settings.currency} onChange={(e) => update({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t("set.zone")}>
          {(id) => (
            <select id={id} className="ui-input" value={settings.timeZone} onChange={(e) => update({ timeZone: e.target.value })}>
              {ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          )}
        </Field>
        <Toggle checked={settings.hour12} onChange={(v) => update({ hour12: v })} label={t("set.hour12")} />
        <Toggle checked={settings.dir === "rtl"} onChange={(v) => update({ dir: v ? "rtl" : "ltr" })} label={t("set.rtl")} />
        <p className="app-quiet">{t("set.launchLang")}</p>
      </form>
      <section className="app-section app-panel" aria-labelledby="looks-title">
        <h2 id="looks-title" className="app-h2">
          {t("set.looks")}
        </h2>
        <dl className="ui-dl">
          <div>
            <dt>{t("set.haircut")}</dt>
            <dd className="num">{f.money(25000)}</dd>
          </div>
          <div>
            <dt>{t("set.now")}</dt>
            <dd>{t("cp.dateTime", { date: f.day(NOW), time: f.time(NOW) })}</dd>
          </div>
          <div>
            <dt>{t("set.zone")}</dt>
            <dd>{settings.timeZone}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Business() {
  const { settings, update } = useSettings();
  const { t } = useT();
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="ui-form app-section app-narrow"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <Field label={t("set.shopName")}>{(id) => <input id={id} className="ui-input" value={settings.shopName} onChange={(e) => update({ shopName: e.target.value })} />}</Field>
      <Field label={t("set.taxNumber")}>{(id) => <input id={id} className="ui-input" autoComplete="off" />}</Field>
      <Toggle checked={settings.pricesIncludeTax} onChange={(v) => update({ pricesIncludeTax: v })} label={t("set.taxIncluded")} />
      <Field label={t("set.taxRate")} hint={t("set.taxRateHint")}>
        {(id, hint) => (
          <input id={id} aria-describedby={hint} className="ui-input num" type="number" step="0.01" min={0} max={0.5} value={settings.taxRate} onChange={(e) => update({ taxRate: Number(e.target.value) })} />
        )}
      </Field>
      <button type="submit" className="ui-btn ui-btn--quiet">
        {t("common.save")}
      </button>
      {saved && <NotConnected what={t("set.businessThing")} />}
    </form>
  );
}

function Services() {
  const f = useFormat();
  const { t, label } = useT();
  const unit = 10 ** minorDigits(f.currency);
  const [rows, setRows] = useState(SERVICES.map((s) => ({ ...s })));
  const [saved, setSaved] = useState(false);
  const edit = (id: string, patch: Partial<(typeof rows)[number]>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  return (
    <form
      className="app-section"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <div className="ui-tablewrap">
        <table className="ui-table ui-table--form">
          <thead>
            <tr>
              <th scope="col">{t("common.service")}</th>
              <th scope="col">{t("money.type")}</th>
              <th scope="col" className="r">{t("set.minutes")}</th>
              <th scope="col" className="r">{t("common.price")}</th>
              <th scope="col">{t("set.processing")}</th>
              <th scope="col" className="c">{t("set.deposit")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">
                  <input className="ui-input ui-input--name" value={r.name} onChange={(e) => edit(r.id, { name: e.target.value })} aria-label={t("set.serviceName")} />
                </th>
                <td data-label={t("money.type")}>{label("category", r.category)}</td>
                <td className="r" data-label={t("set.minutes")}>
                  <input className="ui-input ui-input--short num" type="number" min={5} step={5} value={r.minutes} onChange={(e) => edit(r.id, { minutes: Number(e.target.value) })} aria-label={t("set.serviceMinutes", { name: r.name })} />
                </td>
                <td className="r" data-label={t("common.price")}>
                  <input className="ui-input ui-input--short num" inputMode="decimal" value={r.priceMinor / unit} onChange={(e) => edit(r.id, { priceMinor: toMinor(parseFloat(e.target.value.replace(",", ".")) || 0, f.currency) })} aria-label={t("set.servicePrice", { name: r.name })} />
                </td>
                <td data-label={t("set.processingShort")}>{r.segments ? r.segments.map((g) => t(g.kind === "work" ? "set.segWork" : "set.segWait", { n: g.minutes })).join(", ") : t("common.none")}</td>
                <td className="c" data-label={t("set.deposit")}>
                  <input type="checkbox" checked={!!r.deposit} onChange={(e) => edit(r.id, { deposit: e.target.checked })} aria-label={t("set.depositFor", { name: r.name })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="app-quiet">{t("set.processingNote")}</p>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--quiet">
          {t("set.addService")}
        </button>
        <button type="submit" className="ui-btn ui-btn--primary">
          {t("set.saveServices")}
        </button>
      </div>
      {saved && <NotConnected what={t("set.servicesThing")} />}
    </form>
  );
}

function BookingRules() {
  const { t, tp } = useT();
  const [saved, setSaved] = useState(false);
  const [deposit, setDeposit] = useState(true);
  const [gender, setGender] = useState(false);
  return (
    <form
      className="ui-form app-section app-narrow"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <Field label={t("set.notice")}>
        {(id) => (
          <select id={id} className="ui-input" defaultValue="30">
            <option value="0">{t("common.none")}</option>
            <option value="30">{tp("set.mins", 30)}</option>
            <option value="120">{tp("set.hours", 2)}</option>
            <option value="1440">{tp("set.days", 1)}</option>
          </select>
        )}
      </Field>
      <Field label={t("set.ahead")}>
        {(id) => (
          <select id={id} className="ui-input" defaultValue="30">
            <option value="14">{tp("set.weeks", 2)}</option>
            <option value="30">{tp("set.days", 30)}</option>
            <option value="90">{tp("set.months", 3)}</option>
          </select>
        )}
      </Field>
      <Field label={t("set.step")}>
        {(id) => (
          <select id={id} className="ui-input" defaultValue="15">
            {[10, 15, 30].map((m) => (
              <option key={m} value={m}>
                {tp("set.mins", m)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label={t("set.cancel")}>
        {(id) => (
          <select id={id} className="ui-input" defaultValue="2">
            {[1, 2, 24].map((h) => (
              <option key={h} value={h}>
                {tp("set.hoursBefore", h)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Toggle checked={deposit} onChange={setDeposit} label={t("set.depositRule")} />
      <Toggle checked={gender} onChange={setGender} label={t("set.gender")} />
      <button type="submit" className="ui-btn ui-btn--quiet">
        {t("set.saveRules")}
      </button>
      {saved && <NotConnected what={t("set.rulesThing")} />}
    </form>
  );
}

function Payments() {
  const { settings } = useSettings();
  const { t } = useT();
  const provider = settings.currency === "EGP" ? "Paymob" : settings.currency === "TND" ? "Konnect" : "Stripe";
  return (
    <div className="app-section app-narrow">
      <dl className="ui-dl">
        <div>
          <dt>{t("set.cash")}</dt>
          <dd>{t("set.cashBody")}</dd>
        </div>
        <div>
          <dt>{t("set.terminal")}</dt>
          <dd>{t("set.terminalBody")}</dd>
        </div>
        <div>
          <dt>{t("set.online")}</dt>
          <dd>{t("set.onlineBody", { provider })}</dd>
        </div>
      </dl>
      <button type="button" className="ui-btn ui-btn--primary">
        {t("set.connect", { provider })}
      </button>
      <p className="app-quiet">{t("set.connectNote", { provider })}</p>
    </div>
  );
}

function Plan() {
  const { t } = useT();
  return (
    <div className="app-section app-narrow">
      <dl className="ui-dl">
        <div>
          <dt>{t("set.plan")}</dt>
          <dd>{t("set.planValue")}</dd>
        </div>
        <div>
          <dt>{t("set.trial")}</dt>
          <dd>{t("set.trialValue")}</dd>
        </div>
        <div>
          <dt>{t("set.commission")}</dt>
          <dd>{t("common.none")}</dd>
        </div>
      </dl>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--quiet">
          {t("set.changePlan")}
        </button>
        <button type="button" className="ui-btn ui-btn--text">
          {t("set.export")}
        </button>
      </div>
    </div>
  );
}

function Holidays() {
  const f = useFormat();
  const { t } = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [extra, setExtra] = useState<{ date: string; name: string }[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const all = [...HOLIDAYS_EG_2027, ...extra].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="hol-title">
        <h2 id="hol-title" className="app-h2">
          {t("set.closedIn", { year: 2027 })}
        </h2>
        <p className="app-quiet">{t("set.holidayNote")}</p>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">{t("common.date")}</th>
                <th scope="col">{t("set.holiday")}</th>
                <th scope="col">{t("set.shop")}</th>
              </tr>
            </thead>
            <tbody>
              {all.map((h) => (
                <tr key={h.date + h.name}>
                  <td>{f.date(`${h.date}T12:00:00Z`)}</td>
                  <th scope="row">{h.name}</th>
                  <td>
                    <label className="ui-check">
                      <input type="checkbox" checked={!!open[h.date]} onChange={(e) => setOpen((o) => ({ ...o, [h.date]: e.target.checked }))} />
                      <span>{open[h.date] ? t("set.open") : t("set.closed")}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form
        className="ui-form app-section app-panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (!date || !name.trim()) return;
          setExtra((x) => [...x, { date, name: name.trim() }]);
          setDate("");
          setName("");
        }}
      >
        <h2 className="app-h2">{t("set.closeAnother")}</h2>
        <Field label={t("common.date")}>{(id) => <input id={id} type="date" className="ui-input" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label={t("cal.reason")}>{(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("set.refit")} />}</Field>
        <button type="submit" className="ui-btn ui-btn--quiet">
          {t("set.closeDay")}
        </button>
        <p className="app-quiet">{t("set.closedNote")}</p>
      </form>
    </div>
  );
}
