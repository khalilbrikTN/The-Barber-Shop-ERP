import { useState } from "react";
import { OFFERS, PACKAGES, PROMO_CODES, REVIEWS, serviceById, SERVICES } from "../../lib/data";
import { useStore } from "../../lib/store";
import { toMinor, useFormat } from "../../lib/format";
import { Field, NotConnected, PageHead, Region, Stat, Tabs, Toggle, useDataState, useTab } from "../../ui/kit";
import { TextKey, useT } from "../i18n";

export function Marketing() {
  const tab = useTab("tab", "offers");
  const { t } = useT();
  return (
    <>
      <PageHead title={t("nav.marketing")} sub={t("mk.sub")} />
      <Tabs
        tabs={[
          { id: "offers", label: t("mk.tabOffers") },
          { id: "codes", label: t("mk.tabCodes") },
          { id: "gifts", label: t("mk.tabGifts") },
          { id: "loyalty", label: t("mk.tabLoyalty") },
          { id: "messages", label: t("mk.tabMessages") },
          { id: "campaigns", label: t("mk.tabCampaigns") },
          { id: "memberships", label: t("mk.tabMemberships") },
          { id: "reviews", label: t("mk.tabReviews") },
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
  const { t } = useT();
  const state = useDataState();
  const [offers, setOffers] = useState(OFFERS);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="offers-title">
        <h2 id="offers-title" className="app-h2">
          {t("mk.onSite")}
        </h2>
        <Region state={state} label={t("mk.tabOffers")} rows={3} empty={{ title: t("mk.noOffers"), body: t("mk.noOffersBody") }}>
          <ul className="offers">
            {offers.map((o) => (
              <li key={o.id} className="offer" data-live={o.live || undefined}>
                <div>
                  <strong>{o.title}</strong>
                  <p>{o.body}</p>
                  <p className="app-quiet">
                    {o.code ? t("mk.untilCode", { date: f.date(`${o.until}T12:00:00Z`), code: o.code }) : t("mk.until", { date: f.date(`${o.until}T12:00:00Z`) })}
                  </p>
                </div>
                <Toggle checked={o.live} onChange={(v) => setOffers((os) => os.map((x) => (x.id === o.id ? { ...x, live: v } : x)))} label={o.live ? t("mk.showing") : t("mk.hidden")} />
              </li>
            ))}
          </ul>
        </Region>
      </section>
      <section className="app-section app-panel" aria-labelledby="newoffer-title">
        <h2 id="newoffer-title" className="app-h2">
          {t("mk.newOffer")}
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
          <Field label={t("mk.title")}>{(id) => <input id={id} className="ui-input" value={title} onChange={(e) => setTitle(e.target.value)} required />}</Field>
          <Field label={t("mk.clientsGet")}>{(id) => <textarea id={id} className="ui-input ui-textarea" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />}</Field>
          <Field label={t("mk.ends")}>{(id) => <input id={id} type="date" className="ui-input" defaultValue="2027-01-31" />}</Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            {t("mk.publish")}
          </button>
        </form>
      </section>
    </div>
  );
}

function Codes() {
  const { t } = useT();
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
            <th scope="col">{t("mk.code")}</th>
            <th scope="col">{t("mk.rule")}</th>
            <th scope="col" className="r">{t("mk.used")}</th>
            <th scope="col" className="r">{t("mk.limit")}</th>
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
            setError(t("mk.errCodeShape"));
            return;
          }
          if (codes.some((x) => x.code === c)) {
            setError(t("mk.errCodeTaken"));
            return;
          }
          setError("");
          setCodes((cs) => [{ code: c, rule: t("mk.pctOff", { n: pct }), uses: 0, max }, ...cs]);
          setCode("");
        }}
      >
        <h2 className="app-h2">{t("mk.newCode")}</h2>
        <Field label={t("mk.code")}>{(id) => <input id={id} className="ui-input num" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER15" aria-invalid={!!error || undefined} />}</Field>
        <Field label={t("mk.discount")}>{(id) => <input id={id} type="number" min={5} max={50} step={5} className="ui-input num" value={pct} onChange={(e) => setPct(Number(e.target.value))} />}</Field>
        <Field label={t("mk.maxUses")}>{(id) => <input id={id} type="number" min={1} className="ui-input num" value={max} onChange={(e) => setMax(Number(e.target.value))} />}</Field>
        {error && (
          <p className="ui-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="ui-btn ui-btn--quiet">
          {t("mk.createCode")}
        </button>
      </form>
    </div>
  );
}

function Gifts() {
  const f = useFormat();
  const { t } = useT();
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
            {t("mk.giftCards")}
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">{t("mk.code")}</th>
                  <th scope="col">{t("mk.boughtBy")}</th>
                  <th scope="col">{t("mk.for")}</th>
                  <th scope="col" className="r">{t("mk.left")}</th>
                  <th scope="col">{t("mk.untilCol")}</th>
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
                      {t("mk.balance", { left: f.money(g.balanceMinor, { whole: true }), total: f.money(g.initialMinor, { whole: true }) })}
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
            const minor = toMinor(parseFloat(amount.replace(",", ".")), f.currency);
            if (!minor || !buyer.trim()) return;
            const card = addGiftCard({ initialMinor: minor, balanceMinor: minor, buyer: buyer.trim(), to: to.trim() || t("co.notSaid"), expires: "2027-12-31" });
            setLast(card.code);
            setBuyer("");
            setTo("");
          }}
        >
          <h2 className="app-h2">{t("mk.sellGift")}</h2>
          <div className="ui-seg ui-seg--fill" role="group" aria-label={t("mk.amount")}>
            {["250", "500", "1000"].map((a) => (
              <button key={a} type="button" className="ui-segbtn" aria-pressed={amount === a} onClick={() => setAmount(a)}>
                {f.money(toMinor(Number(a), f.currency), { whole: true })}
              </button>
            ))}
          </div>
          <Field label={t("mk.amount")}>{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />}</Field>
          <Field label={t("mk.boughtBy")}>{(id) => <input id={id} className="ui-input" value={buyer} onChange={(e) => setBuyer(e.target.value)} required />}</Field>
          <Field label={t("mk.giftFor")}>{(id) => <input id={id} className="ui-input" value={to} onChange={(e) => setTo(e.target.value)} />}</Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            {t("mk.createCard")}
          </button>
          {last && (
            <p className="ui-live" role="status">
              {t("mk.cardCreated", { code: last })}
            </p>
          )}
        </form>
      </div>

      <div className="app-split">
        <section className="app-section" aria-labelledby="pk-title">
          <h2 id="pk-title" className="app-h2">
            {t("mk.packages")}
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">{t("mk.package")}</th>
                  <th scope="col" className="r">{t("mk.visits")}</th>
                  <th scope="col" className="r">{t("common.price")}</th>
                  <th scope="col" className="r">{t("mk.insteadOf")}</th>
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
          <p className="app-quiet">{t("mk.packagesNote")}</p>
        </section>
        <form
          className="ui-form app-section app-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const sv = serviceById(pkService);
            setPackages((ps) => [...ps, { id: `pk${Date.now()}`, name: t("mk.pkName", { n: pkVisits, service: sv.name.toLowerCase() }), serviceId: sv.id, visits: pkVisits, priceMinor: sv.priceMinor * pkPay, sold: 0 }]);
          }}
        >
          <h2 className="app-h2">{t("mk.newPackage")}</h2>
          <Field label={t("common.service")}>
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
            <Field label={t("mk.visits")}>{(id) => <input id={id} type="number" min={2} max={20} className="ui-input num" value={pkVisits} onChange={(e) => setPkVisits(Number(e.target.value))} />}</Field>
            <Field label={t("mk.pricedAs")}>{(id) => <input id={id} type="number" min={1} max={pkVisits} className="ui-input num" value={pkPay} onChange={(e) => setPkPay(Number(e.target.value))} />}</Field>
          </div>
          <p className="app-quiet num">
            {t("mk.pkSummary", { visits: pkVisits, pay: pkPay, amount: f.money(serviceById(pkService).priceMinor * pkPay, { whole: true }) })}
          </p>
          <button type="submit" className="ui-btn ui-btn--quiet">
            {t("mk.addPackage")}
          </button>
        </form>
      </div>
    </>
  );
}

function Loyalty() {
  const { t, tp } = useT();
  const [on, setOn] = useState(true);
  const [goal, setGoal] = useState(10);
  const [saved, setSaved] = useState(false);
  return (
    <div className="app-split">
      <section className="app-section app-panel" aria-labelledby="loy-title">
        <h2 id="loy-title" className="app-h2">
          {t("mk.punchCard")}
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <Toggle checked={on} onChange={setOn} label={t("mk.punchOn")} />
          <Field label={t("mk.goal")}>{(id) => <input id={id} type="number" min={3} max={20} className="ui-input num" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />}</Field>
          <Field label={t("mk.reward")}>
            {(id) => (
              <select id={id} className="ui-input">
                <option>{t("mk.rewardCut")}</option>
                <option>{t("mk.rewardBeard")}</option>
                <option>{t("mk.rewardHalf")}</option>
              </select>
            )}
          </Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            {t("common.save")}
          </button>
          {saved && <NotConnected what={t("mk.loyaltyThing")} />}
        </form>
      </section>
      <section className="app-section" aria-labelledby="card-title">
        <h2 id="card-title" className="app-h2">
          {t("mk.clientSees")}
        </h2>
        <div className="punch" aria-label={t("mk.punchLabel", { n: 4, goal })}>
          {Array.from({ length: goal }, (_, i) => (
            <span key={i} className="punch__cell num" data-on={i < 4 || undefined}>
              {i + 1}
            </span>
          ))}
        </div>
        <p className="app-quiet">{tp("mk.toFree", goal - 4)}</p>
      </section>
    </div>
  );
}

function Messages() {
  const f = useFormat();
  const { t } = useT();
  const [rules, setRules] = useState<{ id: string; label: TextKey; when: TextKey; on: boolean }[]>([
    { id: "confirm", label: "mk.msgConfirm", when: "mk.whenBooked", on: true },
    { id: "r24", label: "mk.msgReminder", when: "mk.when24", on: true },
    { id: "r2", label: "mk.msgReminder", when: "mk.when2", on: true },
    { id: "review", label: "mk.msgReview", when: "mk.whenAfter", on: false },
    { id: "rebook", label: "mk.msgRebook", when: "mk.whenGap", on: true },
    { id: "birthday", label: "mk.msgBirthday", when: "mk.whenMorning", on: false },
  ]);
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="auto-title">
        <h2 id="auto-title" className="app-h2">
          {t("mk.sentForYou")}
        </h2>
        <ul className="rules">
          {rules.map((r) => (
            <li key={r.id}>
              <div>
                <strong>{t(r.label)}</strong>
                <span className="app-quiet">{t("mk.channels", { when: t(r.when) })}</span>
              </div>
              <Toggle checked={r.on} onChange={(v) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: v } : x)))} label={r.on ? t("common.on") : t("common.off")} />
            </li>
          ))}
        </ul>
        <p className="app-quiet">{t("mk.consentNote")}</p>
      </section>
      <section className="app-section app-panel" aria-labelledby="credits-title">
        <h2 id="credits-title" className="app-h2">
          {t("mk.credits")}
        </h2>
        <div className="ui-stats">
          <Stat label={t("mk.usedMonth")} value={t("mk.usedOf", { a: f.num(412), b: f.num(1500) })} sub={t("mk.allowance")} />
        </div>
        <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={1500} aria-valuenow={412} aria-label={t("mk.messagesUsed")}>
          <span style={{ inlineSize: `${(412 / 1500) * 100}%` }} />
        </div>
        <button type="button" className="ui-btn ui-btn--quiet">
          {t("mk.buy")}
        </button>
      </section>
    </div>
  );
}

function Reviews() {
  const { t } = useT();
  const [ask, setAsk] = useState(true);
  return (
    <section className="app-section" aria-labelledby="rev-title">
      <h2 id="rev-title" className="app-h2">
        {t("mk.tabReviews")}
      </h2>
      {REVIEWS.length === 0 && (
        <div className="ui-note">
          <p className="ui-note__title">{t("mk.noReviews")}</p>
          <p>{t("mk.noReviewsBody")}</p>
          <Toggle checked={ask} onChange={setAsk} label={t("mk.askReview")} />
        </div>
      )}
    </section>
  );
}

const SEGMENTS: { id: string; label: TextKey; match: (c: { tags: string[]; lastVisit?: string }) => boolean }[] = [
  { id: "all", label: "mk.segAll", match: () => true },
  { id: "lapsed", label: "mk.segLapsed", match: (c) => !!c.lastVisit && c.lastVisit < "2026-10-31" },
  { id: "vip", label: "mk.segVip", match: (c) => c.tags.includes("VIP") },
  { id: "new", label: "mk.segNew", match: (c) => c.tags.includes("New") },
  { id: "colour", label: "mk.segColour", match: (c) => c.tags.includes("Colour") },
];

function Campaigns() {
  const { clients } = useStore();
  const { t, tp } = useT();
  const [seg, setSeg] = useState("lapsed");
  const [text, setText] = useState(() => t("mk.sampleText", { name: "{name}" }));
  const [channel, setChannel] = useState("WhatsApp");
  const [queued, setQueued] = useState(false);
  const group = clients.filter(SEGMENTS.find((x) => x.id === seg)!.match);
  const allowed = group.filter((c) => c.marketing);
  const sample = allowed[0] ?? group[0];
  const preview = text.replace(/\{name\}/g, sample?.name ?? t("mk.there"));
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
        <h2 className="app-h2">{t("mk.newCampaign")}</h2>
        <Field label={t("mk.who")}>
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
                  {t(x.label)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t("mk.sendBy")}>
          {(id) => (
            <select id={id} className="ui-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>WhatsApp</option>
              <option>SMS</option>
              <option value="Email">{t("common.email")}</option>
            </select>
          )}
        </Field>
        <Field label={t("mk.message")} hint={t("mk.messageHint", { name: "{name}" })}>
          {(id, hint) => <textarea id={id} aria-describedby={hint} className="ui-input ui-textarea" rows={5} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={tooLong || noOptOut || undefined} />}
        </Field>
        {noOptOut && <p className="ui-error">{t("mk.errOptOut")}</p>}
        {tooLong && <p className="ui-error">{t("mk.errLong")}</p>}
        <button type="submit" className="ui-btn ui-btn--primary" disabled={!allowed.length || tooLong || noOptOut}>
          {tp("mk.send", allowed.length)}
        </button>
        {queued && <NotConnected what={t("mk.campaignThing", { channel })} />}
      </form>
      <section className="app-section app-panel" aria-labelledby="camp-prev">
        <h2 id="camp-prev" className="app-h2">
          {t("mk.sees", { name: sample?.name ?? t("mk.aClient") })}
        </h2>
        <p className="campaign__bubble">{preview}</p>
        <dl className="ui-dl">
          <div>
            <dt>{t("mk.inGroup")}</dt>
            <dd className="num">{group.length}</dd>
          </div>
          <div>
            <dt>{t("mk.agreed")}</dt>
            <dd className="num">{allowed.length}</dd>
          </div>
          <div>
            <dt>{t("mk.leftOut")}</dt>
            <dd className="num">{group.length - allowed.length}</dd>
          </div>
        </dl>
        <p className="app-quiet">{t("mk.campaignNote")}</p>
      </section>
    </div>
  );
}

function Memberships() {
  const f = useFormat();
  const { t } = useT();
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
          {t("mk.monthly")}
        </h2>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">{t("mk.membership")}</th>
                <th scope="col">{t("mk.covers")}</th>
                <th scope="col" className="r">{t("mk.eachMonth")}</th>
                <th scope="col" className="r">{t("mk.members")}</th>
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
        <p className="app-quiet">{t("mk.memberNote")}</p>
      </section>
      <form
        className="ui-form app-section app-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const minor = toMinor(parseFloat(price.replace(",", ".")), f.currency);
          if (!name.trim() || !minor) return;
          setPlans((ps) => [...ps, { id: `m${Date.now()}`, name: name.trim(), priceMinor: minor, what: what.trim() || t("mk.setCovers"), members: 0 }]);
          setName("");
          setPrice("");
          setWhat("");
        }}
      >
        <h2 className="app-h2">{t("mk.newMembership")}</h2>
        <Field label={t("common.name")}>{(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label={t("mk.eachMonth")}>{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />}</Field>
        <Field label={t("mk.covers")}>{(id) => <input id={id} className="ui-input" value={what} onChange={(e) => setWhat(e.target.value)} />}</Field>
        <button type="submit" className="ui-btn ui-btn--quiet">
          {t("mk.addMembership")}
        </button>
      </form>
    </div>
  );
}
