import { useState } from "react";
import { HOLIDAYS_EG_2027, NOW, SERVICES } from "../../lib/data";
import { useFormat } from "../../lib/format";
import { COUNTRY_PRESETS, useSettings } from "../../lib/settings";
import { Field, NotConnected, PageHead, Tabs, Toggle, useTab } from "../../ui/kit";

const ZONES = ["Africa/Cairo", "Africa/Tunis", "Europe/Rome", "Europe/Paris", "Europe/Berlin", "Europe/London", "Asia/Dubai"];
const CURRENCIES = ["EGP", "TND", "EUR", "GBP", "AED", "USD"];
const LOCALES = [
  { id: "en-EG", label: "English (Egypt)" },
  { id: "en-GB", label: "English (UK)" },
  { id: "fr-TN", label: "French (Tunisia)" },
  { id: "fr-FR", label: "French (France)" },
  { id: "it-IT", label: "Italian" },
  { id: "de-DE", label: "German" },
  { id: "ar-EG", label: "Arabic (Egypt)" },
];

export function SettingsScreen() {
  const tab = useTab("tab", "region");
  return (
    <>
      <PageHead title="Settings" />
      <Tabs
        tabs={[
          { id: "region", label: "Language and region" },
          { id: "business", label: "Business" },
          { id: "services", label: "Services" },
          { id: "booking", label: "Booking rules" },
          { id: "holidays", label: "Holidays" },
          { id: "payments", label: "Payments" },
          { id: "plan", label: "Your plan" },
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
  return (
    <div className="app-split">
      <form className="ui-form app-section" onSubmit={(e) => e.preventDefault()}>
        <Field label="Country" hint="Sets currency, time zone, week start and tax together. Change any of them after.">
          {(id, hint) => (
            <select id={id} aria-describedby={hint} className="ui-input" defaultValue="" onChange={(e) => e.target.value && update(COUNTRY_PRESETS[e.target.value])}>
              <option value="">Choose to fill in the rest</option>
              {Object.keys(COUNTRY_PRESETS).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Formats">
          {(id) => (
            <select id={id} className="ui-input" value={settings.locale} onChange={(e) => update({ locale: e.target.value })}>
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Currency" hint="Prices you entered keep their numbers; only the currency changes.">
          {(id, hint) => (
            <select id={id} aria-describedby={hint} className="ui-input" value={settings.currency} onChange={(e) => update({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Time zone">
          {(id) => (
            <select id={id} className="ui-input" value={settings.timeZone} onChange={(e) => update({ timeZone: e.target.value })}>
              {ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          )}
        </Field>
        <Toggle checked={settings.hour12} onChange={(v) => update({ hour12: v })} label="12-hour clock" />
        <Toggle checked={settings.dir === "rtl"} onChange={(v) => update({ dir: v ? "rtl" : "ltr" })} label="Right-to-left layout (preview for Arabic)" />
        <p className="app-quiet">The app is in English at launch. Arabic, French, Italian and German follow.</p>
      </form>
      <section className="app-section app-panel" aria-labelledby="looks-title">
        <h2 id="looks-title" className="app-h2">
          How it looks now
        </h2>
        <dl className="ui-dl">
          <div>
            <dt>A haircut</dt>
            <dd className="num">{f.money(25000)}</dd>
          </div>
          <div>
            <dt>Now</dt>
            <dd>
              {f.day(NOW)}, {f.time(NOW)}
            </dd>
          </div>
          <div>
            <dt>Time zone</dt>
            <dd>{settings.timeZone}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Business() {
  const { settings, update } = useSettings();
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="ui-form app-section app-narrow"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <Field label="Shop name">{(id) => <input id={id} className="ui-input" value={settings.shopName} onChange={(e) => update({ shopName: e.target.value })} />}</Field>
      <Field label="Tax number">{(id) => <input id={id} className="ui-input" autoComplete="off" />}</Field>
      <Toggle checked={settings.pricesIncludeTax} onChange={(v) => update({ pricesIncludeTax: v })} label="Prices include tax" />
      <Field label="Tax rate" hint="A default for your country. Check it with your accountant.">
        {(id, hint) => (
          <input id={id} aria-describedby={hint} className="ui-input num" type="number" step="0.01" min={0} max={0.5} value={settings.taxRate} onChange={(e) => update({ taxRate: Number(e.target.value) })} />
        )}
      </Field>
      <button type="submit" className="ui-btn ui-btn--quiet">
        Save
      </button>
      {saved && <NotConnected what="business details" />}
    </form>
  );
}

function Services() {
  const f = useFormat();
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
              <th scope="col">Service</th>
              <th scope="col">Type</th>
              <th scope="col" className="r">Minutes</th>
              <th scope="col" className="r">Price</th>
              <th scope="col">Processing time</th>
              <th scope="col" className="c">Deposit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">
                  <input className="ui-input ui-input--name" value={r.name} onChange={(e) => edit(r.id, { name: e.target.value })} aria-label="Service name" />
                </th>
                <td data-label="Type">{r.category}</td>
                <td className="r" data-label="Minutes">
                  <input className="ui-input ui-input--short num" type="number" min={5} step={5} value={r.minutes} onChange={(e) => edit(r.id, { minutes: Number(e.target.value) })} aria-label={`${r.name} minutes`} />
                </td>
                <td className="r" data-label="Price">
                  <input className="ui-input ui-input--short num" inputMode="decimal" value={r.priceMinor / 100} onChange={(e) => edit(r.id, { priceMinor: Math.round((parseFloat(e.target.value.replace(",", ".")) || 0) * 100) })} aria-label={`${r.name} price`} />
                </td>
                <td data-label="Processing">{r.segments ? r.segments.map((g) => `${g.minutes} ${g.kind}`).join(", ") : "None"}</td>
                <td className="c" data-label="Deposit">
                  <input type="checkbox" checked={!!r.deposit} onChange={(e) => edit(r.id, { deposit: e.target.checked })} aria-label={`Deposit for ${r.name}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="app-quiet">Processing time is when the stylist is free during a service, such as colour developing. Other clients can be booked into it.</p>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--quiet">
          Add a service
        </button>
        <button type="submit" className="ui-btn ui-btn--primary">
          Save services
        </button>
      </div>
      {saved && <NotConnected what="services" />}
    </form>
  );
}

function BookingRules() {
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
      <Field label="Shortest notice for an online booking">
        {(id) => (
          <select id={id} className="ui-input" defaultValue="30">
            <option value="0">None</option>
            <option value="30">30 minutes</option>
            <option value="120">2 hours</option>
            <option value="1440">1 day</option>
          </select>
        )}
      </Field>
      <Field label="Furthest ahead clients can book">
        {(id) => (
          <select id={id} className="ui-input" defaultValue="30">
            <option value="14">2 weeks</option>
            <option value="30">30 days</option>
            <option value="90">3 months</option>
          </select>
        )}
      </Field>
      <Field label="Times start every">
        {(id) => (
          <select id={id} className="ui-input" defaultValue="15">
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        )}
      </Field>
      <Field label="Free cancellation until">
        {(id) => (
          <select id={id} className="ui-input" defaultValue="2">
            <option value="1">1 hour before</option>
            <option value="2">2 hours before</option>
            <option value="24">24 hours before</option>
          </select>
        )}
      </Field>
      <Toggle checked={deposit} onChange={setDeposit} label="Ask a deposit from clients with two or more no-shows" />
      <Toggle checked={gender} onChange={setGender} label="Clients can pick a barber by gender" />
      <button type="submit" className="ui-btn ui-btn--quiet">
        Save rules
      </button>
      {saved && <NotConnected what="booking rules" />}
    </form>
  );
}

function Payments() {
  const { settings } = useSettings();
  const provider = settings.currency === "EGP" ? "Paymob" : settings.currency === "TND" ? "Konnect" : "Stripe";
  return (
    <div className="app-section app-narrow">
      <dl className="ui-dl">
        <div>
          <dt>Cash</dt>
          <dd>On. Counted in the evening cash-up.</dd>
        </div>
        <div>
          <dt>Card terminal</dt>
          <dd>Your own terminal. Mark card payments at checkout.</dd>
        </div>
        <div>
          <dt>Online deposits</dt>
          <dd>Paid straight into your {provider} account. We never hold your money.</dd>
        </div>
      </dl>
      <button type="button" className="ui-btn ui-btn--primary">
        Connect {provider}
      </button>
      <p className="app-quiet">The connection opens {provider}'s own page. It is not wired up in this preview.</p>
    </div>
  );
}

function Plan() {
  return (
    <div className="app-section app-narrow">
      <dl className="ui-dl">
        <div>
          <dt>Plan</dt>
          <dd>Shop, up to 6 bookable staff</dd>
        </div>
        <div>
          <dt>Trial</dt>
          <dd>14 days, no card on file</dd>
        </div>
        <div>
          <dt>Commission on bookings</dt>
          <dd>None</dd>
        </div>
      </dl>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--quiet">
          Change plan
        </button>
        <button type="button" className="ui-btn ui-btn--text">
          Export all my data
        </button>
      </div>
    </div>
  );
}

function Holidays() {
  const f = useFormat();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [extra, setExtra] = useState<{ date: string; name: string }[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const all = [...HOLIDAYS_EG_2027, ...extra].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="hol-title">
        <h2 id="hol-title" className="app-h2">
          Closed days in 2027
        </h2>
        <p className="app-quiet">Public holidays load for your country. Religious holidays move with the moon, so check the dates nearer the time.</p>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Holiday</th>
                <th scope="col">Shop</th>
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
                      <span>{open[h.date] ? "Open" : "Closed"}</span>
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
        <h2 className="app-h2">Close another day</h2>
        <Field label="Date">{(id) => <input id={id} type="date" className="ui-input" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="Reason">{(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop refit" />}</Field>
        <button type="submit" className="ui-btn ui-btn--quiet">
          Close the shop that day
        </button>
        <p className="app-quiet">Bookings already on a closed day stay, and the calendar warns you about them.</p>
      </form>
    </div>
  );
}
