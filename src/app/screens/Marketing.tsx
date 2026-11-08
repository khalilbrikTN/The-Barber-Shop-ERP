import { useState } from "react";
import { OFFERS, PACKAGES, PROMO_CODES, REVIEWS, serviceById, SERVICES } from "../../lib/data";
import { useStore } from "../../lib/store";
import { useFormat } from "../../lib/format";
import { Field, NotConnected, PageHead, Region, Stat, Tabs, Toggle, useDataState, useTab } from "../../ui/kit";

export function Marketing() {
  const tab = useTab("tab", "offers");
  return (
    <>
      <PageHead title="Marketing" sub="Offers, loyalty and the messages that bring clients back." />
      <Tabs
        tabs={[
          { id: "offers", label: "Offers" },
          { id: "codes", label: "Promo codes" },
          { id: "gifts", label: "Gift cards and packages" },
          { id: "loyalty", label: "Loyalty" },
          { id: "messages", label: "Messages" },
          { id: "campaigns", label: "Campaigns" },
          { id: "memberships", label: "Memberships" },
          { id: "reviews", label: "Reviews" },
        ]}
      />
      <div className="app-tabpanel" role="tabpanel">
        {tab === "offers" && <Offers />}
        {tab === "codes" && <Codes />}
        {tab === "gifts" && <Gifts />}
        {tab === "loyalty" && <Loyalty />}
        {tab === "messages" && <Messages />}
        {tab === "campaigns" && <Campaigns />}
        {tab === "memberships" && <Memberships />}
        {tab === "reviews" && <Reviews />}
      </div>
    </>
  );
}

function Offers() {
  const f = useFormat();
  const state = useDataState();
  const [offers, setOffers] = useState(OFFERS);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="offers-title">
        <h2 id="offers-title" className="app-h2">
          On your website and client accounts
        </h2>
        <Region state={state} label="Offers" rows={3} empty={{ title: "No offers yet", body: "An offer shows on your website and in every client's account." }}>
          <ul className="offers">
            {offers.map((o) => (
              <li key={o.id} className="offer" data-live={o.live || undefined}>
                <div>
                  <strong>{o.title}</strong>
                  <p>{o.body}</p>
                  <p className="app-quiet">
                    Until {f.date(`${o.until}T12:00:00Z`)}
                    {o.code ? `, code ${o.code}` : ""}
                  </p>
                </div>
                <Toggle checked={o.live} onChange={(v) => setOffers((os) => os.map((x) => (x.id === o.id ? { ...x, live: v } : x)))} label={o.live ? "Showing" : "Hidden"} />
              </li>
            ))}
          </ul>
        </Region>
      </section>
      <section className="app-section app-panel" aria-labelledby="newoffer-title">
        <h2 id="newoffer-title" className="app-h2">
          New offer
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            setOffers((os) => [{ id: `o${Date.now()}`, title, body, until: "2027-01-31", live: true }, ...os]);
            setTitle("");
            setBody("");
          }}
        >
          <Field label="Title">{(id) => <input id={id} className="ui-input" value={title} onChange={(e) => setTitle(e.target.value)} required />}</Field>
          <Field label="What clients get">{(id) => <textarea id={id} className="ui-input ui-textarea" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />}</Field>
          <Field label="Ends on">{(id) => <input id={id} type="date" className="ui-input" defaultValue="2027-01-31" />}</Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            Publish offer
          </button>
        </form>
      </section>
    </div>
  );
}

function Codes() {
  const [codes, setCodes] = useState(PROMO_CODES);
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(10);
  const [max, setMax] = useState(100);
  const [error, setError] = useState("");
  return (
    <div className="app-split">
    <div className="ui-tablewrap">
      <table className="ui-table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Rule</th>
            <th scope="col" className="r">Used</th>
            <th scope="col" className="r">Limit</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((p) => (
            <tr key={p.code}>
              <th scope="row" className="num">
                {p.code}
              </th>
              <td>{p.rule}</td>
              <td className="r num">{p.uses}</td>
              <td className="r num">{p.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <form
        className="ui-form app-section app-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const c = code.trim().toUpperCase();
          if (!/^[A-Z0-9]{4,16}$/.test(c)) {
            setError("Use 4 to 16 letters or numbers, no spaces.");
            return;
          }
          if (codes.some((x) => x.code === c)) {
            setError("That code already exists.");
            return;
          }
          setError("");
          setCodes((cs) => [{ code: c, rule: `${pct}% off any service`, uses: 0, max }, ...cs]);
          setCode("");
        }}
      >
        <h2 className="app-h2">New promo code</h2>
        <Field label="Code">{(id) => <input id={id} className="ui-input num" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER15" aria-invalid={!!error || undefined} />}</Field>
        <Field label="Discount, percent">{(id) => <input id={id} type="number" min={5} max={50} step={5} className="ui-input num" value={pct} onChange={(e) => setPct(Number(e.target.value))} />}</Field>
        <Field label="How many times it can be used">{(id) => <input id={id} type="number" min={1} className="ui-input num" value={max} onChange={(e) => setMax(Number(e.target.value))} />}</Field>
        {error && (
          <p className="ui-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="ui-btn ui-btn--quiet">
          Create code
        </button>
      </form>
    </div>
  );
}

function Gifts() {
  const f = useFormat();
  const { giftCards, addGiftCard } = useStore();
  const [amount, setAmount] = useState("500");
  const [buyer, setBuyer] = useState("");
  const [to, setTo] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [packages, setPackages] = useState(PACKAGES);
  const [pkService, setPkService] = useState("fade");
  const [pkVisits, setPkVisits] = useState(5);
  const [pkPay, setPkPay] = useState(4);
  return (
    <>
      <div className="app-split">
        <section className="app-section" aria-labelledby="gc-title">
          <h2 id="gc-title" className="app-h2">
            Gift cards
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Bought by</th>
                  <th scope="col">For</th>
                  <th scope="col" className="r">Left</th>
                  <th scope="col">Until</th>
                </tr>
              </thead>
              <tbody>
                {giftCards.map((g) => (
                  <tr key={g.code} data-now={g.code === last || undefined}>
                    <th scope="row" className="num">
                      {g.code}
                    </th>
                    <td>{g.buyer}</td>
                    <td>{g.to}</td>
                    <td className="r num">
                      {f.money(g.balanceMinor, { whole: true })} of {f.money(g.initialMinor, { whole: true })}
                    </td>
                    <td>{f.date(`${g.expires}T12:00:00Z`)}</td>
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
            const minor = Math.round(parseFloat(amount) * 100);
            if (!minor || !buyer.trim()) return;
            const card = addGiftCard({ initialMinor: minor, balanceMinor: minor, buyer: buyer.trim(), to: to.trim() || "Not said", expires: "2027-12-31" });
            setLast(card.code);
            setBuyer("");
            setTo("");
          }}
        >
          <h2 className="app-h2">Sell a gift card</h2>
          <div className="ui-seg ui-seg--fill" role="group" aria-label="Amount">
            {["250", "500", "1000"].map((a) => (
              <button key={a} type="button" className="ui-segbtn" aria-pressed={amount === a} onClick={() => setAmount(a)}>
                {f.money(Number(a) * 100, { whole: true })}
              </button>
            ))}
          </div>
          <Field label="Amount">{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />}</Field>
          <Field label="Bought by">{(id) => <input id={id} className="ui-input" value={buyer} onChange={(e) => setBuyer(e.target.value)} required />}</Field>
          <Field label="A gift for">{(id) => <input id={id} className="ui-input" value={to} onChange={(e) => setTo(e.target.value)} />}</Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            Create the card
          </button>
          {last && (
            <p className="ui-live" role="status">
              Card {last} created. Take payment at checkout; nothing is charged here.
            </p>
          )}
        </form>
      </div>

      <div className="app-split">
        <section className="app-section" aria-labelledby="pk-title">
          <h2 id="pk-title" className="app-h2">
            Packages
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Package</th>
                  <th scope="col" className="r">Visits</th>
                  <th scope="col" className="r">Price</th>
                  <th scope="col" className="r">Instead of</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">{p.name}</th>
                    <td className="r num">{p.visits}</td>
                    <td className="r num">{f.money(p.priceMinor, { whole: true })}</td>
                    <td className="r num">{f.money(serviceById(p.serviceId).priceMinor * p.visits, { whole: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="app-quiet">Clients see their visits left in their account. Memberships with a monthly charge come later.</p>
        </section>
        <form
          className="ui-form app-section app-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const sv = serviceById(pkService);
            setPackages((ps) => [...ps, { id: `pk${Date.now()}`, name: `${pkVisits} × ${sv.name.toLowerCase()}`, serviceId: sv.id, visits: pkVisits, priceMinor: sv.priceMinor * pkPay, sold: 0 }]);
          }}
        >
          <h2 className="app-h2">New package</h2>
          <Field label="Service">
            {(id) => (
              <select id={id} className="ui-input" value={pkService} onChange={(e) => setPkService(e.target.value)}>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="setup__row">
            <Field label="Visits">{(id) => <input id={id} type="number" min={2} max={20} className="ui-input num" value={pkVisits} onChange={(e) => setPkVisits(Number(e.target.value))} />}</Field>
            <Field label="Priced as">{(id) => <input id={id} type="number" min={1} max={pkVisits} className="ui-input num" value={pkPay} onChange={(e) => setPkPay(Number(e.target.value))} />}</Field>
          </div>
          <p className="app-quiet num">
            {pkVisits} visits for the price of {pkPay}: {f.money(serviceById(pkService).priceMinor * pkPay, { whole: true })}
          </p>
          <button type="submit" className="ui-btn ui-btn--quiet">
            Add package
          </button>
        </form>
      </div>
    </>
  );
}

function Loyalty() {
  const [on, setOn] = useState(true);
  const [goal, setGoal] = useState(10);
  const [saved, setSaved] = useState(false);
  return (
    <div className="app-split">
      <section className="app-section app-panel" aria-labelledby="loy-title">
        <h2 id="loy-title" className="app-h2">
          Digital punch card
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <Toggle checked={on} onChange={setOn} label="Clients collect a punch on every paid visit" />
          <Field label="Visits for a free cut">{(id) => <input id={id} type="number" min={3} max={20} className="ui-input num" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />}</Field>
          <Field label="The free reward">
            {(id) => (
              <select id={id} className="ui-input">
                <option>Any haircut</option>
                <option>Beard trim</option>
                <option>Half price on any service</option>
              </select>
            )}
          </Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            Save
          </button>
          {saved && <NotConnected what="loyalty settings" />}
        </form>
      </section>
      <section className="app-section" aria-labelledby="card-title">
        <h2 id="card-title" className="app-h2">
          What the client sees
        </h2>
        <div className="punch" aria-label={`Punch card, 4 of ${goal}`}>
          {Array.from({ length: goal }, (_, i) => (
            <span key={i} className="punch__cell num" data-on={i < 4 || undefined}>
              {i + 1}
            </span>
          ))}
        </div>
        <p className="app-quiet">{goal - 4} more visits to a free cut.</p>
      </section>
    </div>
  );
}

function Messages() {
  const f = useFormat();
  const [rules, setRules] = useState([
    { id: "confirm", label: "Booking confirmation", when: "Right after booking", on: true },
    { id: "r24", label: "Reminder", when: "24 hours before", on: true },
    { id: "r2", label: "Reminder", when: "2 hours before", on: true },
    { id: "review", label: "Review request", when: "3 hours after the visit", on: false },
    { id: "rebook", label: "Time for a fresh cut", when: "When a client is a week past their usual gap", on: true },
    { id: "birthday", label: "Birthday", when: "On the morning of", on: false },
  ]);
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="auto-title">
        <h2 id="auto-title" className="app-h2">
          Sent for you
        </h2>
        <ul className="rules">
          {rules.map((r) => (
            <li key={r.id}>
              <div>
                <strong>{r.label}</strong>
                <span className="app-quiet">{r.when}. WhatsApp first, then SMS, then email.</span>
              </div>
              <Toggle checked={r.on} onChange={(v) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: v } : x)))} label={r.on ? "On" : "Off"} />
            </li>
          ))}
        </ul>
        <p className="app-quiet">Offers and birthday messages only go to clients who agreed to them.</p>
      </section>
      <section className="app-section app-panel" aria-labelledby="credits-title">
        <h2 id="credits-title" className="app-h2">
          Message credits
        </h2>
        <div className="ui-stats">
          <Stat label="Used this month" value={`${f.num(412)} of ${f.num(1500)}`} sub="Shop plan allowance" />
        </div>
        <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={1500} aria-valuenow={412} aria-label="Messages used">
          <span style={{ inlineSize: `${(412 / 1500) * 100}%` }} />
        </div>
        <button type="button" className="ui-btn ui-btn--quiet">
          Buy more credits
        </button>
      </section>
    </div>
  );
}

function Reviews() {
  const [ask, setAsk] = useState(true);
  return (
    <section className="app-section" aria-labelledby="rev-title">
      <h2 id="rev-title" className="app-h2">
        Reviews
      </h2>
      {REVIEWS.length === 0 && (
        <div className="ui-note">
          <p className="ui-note__title">No reviews yet</p>
          <p>Turn on review requests and clients get a short link after their visit. Five-star reviews can go on to your Google profile.</p>
          <Toggle checked={ask} onChange={setAsk} label="Ask clients for a review after each visit" />
        </div>
      )}
    </section>
  );
}

const SEGMENTS: { id: string; label: string; match: (c: { tags: string[]; lastVisit?: string }) => boolean }[] = [
  { id: "all", label: "Everyone", match: () => true },
  { id: "lapsed", label: "Not seen for 6 weeks", match: (c) => !!c.lastVisit && c.lastVisit < "2026-10-31" },
  { id: "vip", label: "VIP", match: (c) => c.tags.includes("VIP") },
  { id: "new", label: "New this month", match: (c) => c.tags.includes("New") },
  { id: "colour", label: "Colour clients", match: (c) => c.tags.includes("Colour") },
];

function Campaigns() {
  const { clients } = useStore();
  const [seg, setSeg] = useState("lapsed");
  const [text, setText] = useState("Hi {name}, it has been a while. Book this week and get 10% off with code MORNING10. Reply STOP to opt out.");
  const [channel, setChannel] = useState("WhatsApp");
  const [queued, setQueued] = useState(false);
  const group = clients.filter(SEGMENTS.find((x) => x.id === seg)!.match);
  const allowed = group.filter((c) => c.marketing);
  const sample = allowed[0] ?? group[0];
  const preview = text.replace(/\{name\}/g, sample?.name ?? "there");
  const tooLong = text.length > 600;
  const noOptOut = !/stop/i.test(text);

  return (
    <div className="app-split">
      <form
        className="ui-form app-section"
        onSubmit={(e) => {
          e.preventDefault();
          if (allowed.length && !tooLong && !noOptOut) setQueued(true);
        }}
      >
        <h2 className="app-h2">New campaign</h2>
        <Field label="Who gets it">
          {(id) => (
            <select
              id={id}
              className="ui-input"
              value={seg}
              onChange={(e) => {
                setSeg(e.target.value);
                setQueued(false);
              }}
            >
              {SEGMENTS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Send by">
          {(id) => (
            <select id={id} className="ui-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>WhatsApp</option>
              <option>SMS</option>
              <option>Email</option>
            </select>
          )}
        </Field>
        <Field label="Message" hint="{name} becomes each client’s first name.">
          {(id, hint) => <textarea id={id} aria-describedby={hint} className="ui-input ui-textarea" rows={5} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={tooLong || noOptOut || undefined} />}
        </Field>
        {noOptOut && <p className="ui-error">Add a way to stop these messages, such as “Reply STOP to opt out”. Offers need one by law in most countries.</p>}
        {tooLong && <p className="ui-error">Keep it under 600 characters so it arrives as one message.</p>}
        <button type="submit" className="ui-btn ui-btn--primary" disabled={!allowed.length || tooLong || noOptOut}>
          Send to {allowed.length} {allowed.length === 1 ? "client" : "clients"}
        </button>
        {queued && <NotConnected what={`the ${channel} campaign`} />}
      </form>
      <section className="app-section app-panel" aria-labelledby="camp-prev">
        <h2 id="camp-prev" className="app-h2">
          What {sample?.name ?? "a client"} sees
        </h2>
        <p className="campaign__bubble">{preview}</p>
        <dl className="ui-dl">
          <div>
            <dt>In this group</dt>
            <dd className="num">{group.length}</dd>
          </div>
          <div>
            <dt>Agreed to offers</dt>
            <dd className="num">{allowed.length}</dd>
          </div>
          <div>
            <dt>Left out, no consent</dt>
            <dd className="num">{group.length - allowed.length}</dd>
          </div>
        </dl>
        <p className="app-quiet">Clients who never agreed to offers are left out by themselves. Each message uses one credit.</p>
      </section>
    </div>
  );
}

function Memberships() {
  const f = useFormat();
  const [plans, setPlans] = useState([
    { id: "m1", name: "Unlimited cuts", priceMinor: 120000, what: "Any haircut, as often as you like", members: 0 },
    { id: "m2", name: "Cut and beard club", priceMinor: 90000, what: "Two cuts and two beard trims a month", members: 0 },
  ]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [what, setWhat] = useState("");
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="mem-title">
        <h2 id="mem-title" className="app-h2">
          Monthly memberships
        </h2>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Membership</th>
                <th scope="col">What it covers</th>
                <th scope="col" className="r">Each month</th>
                <th scope="col" className="r">Members</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{m.name}</th>
                  <td>{m.what}</td>
                  <td className="r num">{f.money(m.priceMinor, { whole: true })}</td>
                  <td className="r num">{m.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="app-quiet">Members are charged on the same day each month through your payment provider, once payments are connected.</p>
      </section>
      <form
        className="ui-form app-section app-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const minor = Math.round(parseFloat(price.replace(",", ".")) * 100);
          if (!name.trim() || !minor) return;
          setPlans((ps) => [...ps, { id: `m${Date.now()}`, name: name.trim(), priceMinor: minor, what: what.trim() || "Set what it covers", members: 0 }]);
          setName("");
          setPrice("");
          setWhat("");
        }}
      >
        <h2 className="app-h2">New membership</h2>
        <Field label="Name">{(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="Each month">{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />}</Field>
        <Field label="What it covers">{(id) => <input id={id} className="ui-input" value={what} onChange={(e) => setWhat(e.target.value)} />}</Field>
        <button type="submit" className="ui-btn ui-btn--quiet">
          Add membership
        </button>
      </form>
    </div>
  );
}
