import { useState } from "react";
import { BOOKABLE, BOOKINGS, CLIENTS, EXPENSES, SCHEDULE_HOURS, serviceById, SERVICES, TODAY, WEEK_SALES } from "../../lib/data";
import { minorDigits, useFormat } from "../../lib/format";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Region, Stat, Tabs, useDataState, useTab } from "../../ui/kit";

const FLOAT = 50000;

export function Money() {
  const tab = useTab("tab", "cashup");
  return (
    <>
      <PageHead title="Money" sub="Cash-up, sales, expenses and the month at a glance." />
      <Tabs
        tabs={[
          { id: "cashup", label: "Cash-up" },
          { id: "sales", label: "Sales" },
          { id: "expenses", label: "Expenses" },
          { id: "products", label: "Products" },
          { id: "reports", label: "Reports" },
          { id: "report", label: "Profit and loss" },
        ]}
      />
      <div className="app-tabpanel" role="tabpanel">
        {tab === "cashup" && <CashUp />}
        {tab === "sales" && <Sales />}
        {tab === "expenses" && <Expenses />}
        {tab === "products" && <Products />}
        {tab === "reports" && <Reports />}
        {tab === "report" && <Report />}
      </div>
    </>
  );
}

function CashUp() {
  const f = useFormat();
  const { settings } = useSettings();
  const { sales } = useStore();
  const [counted, setCounted] = useState("");
  const [closed, setClosed] = useState(false);
  const today = sales.filter((s) => s.time.startsWith(TODAY) && !s.refunded);
  const sum = (m: string) => today.filter((s) => s.method === m).reduce((t, s) => t + s.lines.reduce((a, l) => a + l.minor, 0) + s.tipMinor, 0);
  const expected = FLOAT + sum("cash");
  const unit = 10 ** minorDigits(settings.currency);
  const countedMinor = counted ? Math.round(parseFloat(counted.replace(",", ".")) * unit) : null;
  const diff = countedMinor === null ? null : countedMinor - expected;

  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="cu-title">
        <h2 id="cu-title" className="app-h2">
          Today, {f.day(`${TODAY}T12:00:00+02:00`)}
        </h2>
        <div className="ui-stats ui-stats--row">
          <Stat label="Cash" value={f.money(sum("cash"))} />
          <Stat label="Card" value={f.money(sum("card"))} />
          <Stat label="Wallet" value={f.money(sum("wallet"))} />
          <Stat label="Opening float" value={f.money(FLOAT)} />
        </div>
        <div className="plate">
          <span>The drawer should hold</span>
          <strong className="num">{f.money(expected)}</strong>
        </div>
      </section>
      <section className="app-section app-panel" aria-labelledby="count-title">
        <h2 id="count-title" className="app-h2">
          Count the drawer
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (countedMinor !== null) setClosed(true);
          }}
        >
          <Field label="Cash counted" hint="Notes and coins, float included.">
            {(id, hint) => <input id={id} aria-describedby={hint} className="ui-input num" inputMode="decimal" value={counted} onChange={(e) => setCounted(e.target.value)} />}
          </Field>
          {diff !== null && (
            <p className={diff === 0 ? "ui-live" : "ui-error"} aria-live="polite">
              {diff === 0 ? "The drawer matches." : diff > 0 ? `${f.money(diff)} over.` : `${f.money(-diff)} short.`}
            </p>
          )}
          <button type="submit" className="ui-btn ui-btn--primary" disabled={countedMinor === null}>
            Close the day
          </button>
          {closed && <NotConnected what="the cash-up" />}
        </form>
      </section>
    </div>
  );
}

function Receipts() {
  const f = useFormat();
  const { sales, refundSale } = useStore();
  const [asking, setAsking] = useState<string | null>(null);
  const [reason, setReason] = useState("Client not happy");
  const recent = sales.slice(0, 8);
  const sum = (x: (typeof sales)[number]) => x.lines.reduce((t, l) => t + l.minor, 0) + x.tipMinor;
  return (
    <section className="app-section" aria-labelledby="rc-title">
      <h2 id="rc-title" className="app-h2">
        Latest sales
      </h2>
      {recent.length === 0 ? (
        <div className="ui-note">
          <p className="ui-note__title">No sales yet</p>
          <p>Sales show here as you check clients out.</p>
        </div>
      ) : (
        <div className="ui-tablewrap">
          <table className="ui-table ui-table--stack receipts">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">What</th>
                <th scope="col">Paid by</th>
                <th scope="col" className="r">Amount</th>
                <th scope="col">
                  <span className="visually-hidden">Refund</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((x) => (
                <tr key={x.id}>
                  <td>
                    {f.day(x.time, "short")}, {f.time(x.time)}
                  </td>
                  <th scope="row">{x.lines.map((l) => l.label).join(", ")}</th>
                  <td>{x.method}</td>
                  <td className="r num">{x.refunded ? <s>{f.money(sum(x))}</s> : f.money(sum(x))}</td>
                  <td className="r">
                    {x.refunded ? (
                      <span className="ui-status ui-status--cancelled">Refunded</span>
                    ) : asking === x.id ? (
                      <form
                        className="refund"
                        onSubmit={(e) => {
                          e.preventDefault();
                          refundSale(x.id, reason);
                          setAsking(null);
                        }}
                      >
                        <label className="visually-hidden" htmlFor={`why-${x.id}`}>
                          Reason for the refund
                        </label>
                        <select id={`why-${x.id}`} className="ui-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                          <option>Client not happy</option>
                          <option>Charged twice</option>
                          <option>Wrong service rung up</option>
                          <option>Other</option>
                        </select>
                        <button type="submit" className="ui-btn ui-btn--primary">
                          Refund {f.money(sum(x))}
                        </button>
                        <button type="button" className="ui-btn ui-btn--text" onClick={() => setAsking(null)}>
                          Keep it
                        </button>
                      </form>
                    ) : (
                      <button type="button" className="ui-btn ui-btn--text" onClick={() => setAsking(x.id)}>
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="app-quiet">Card refunds go back through your payment provider once it is connected; cash refunds come out of the drawer and show in the cash-up.</p>
    </section>
  );
}

function Sales() {
  const f = useFormat();
  const state = useDataState();
  const total = WEEK_SALES.reduce((t, d) => t + d.cash + d.card + d.wallet, 0);
  return (
    <>
    <Receipts />
    <section className="app-section" aria-labelledby="sales-title">
      <h2 id="sales-title" className="app-h2">
        This week
      </h2>
      <Region state={state} label="Sales" rows={6} empty={{ title: "No sales this week", body: "Sales appear as you check clients out." }}>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col" className="r">Bookings</th>
                <th scope="col" className="r">Cash</th>
                <th scope="col" className="r opt">Card</th>
                <th scope="col" className="r opt">Wallet</th>
                <th scope="col" className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              {WEEK_SALES.map((d) => (
                <tr key={d.day}>
                  <th scope="row">{f.day(`${d.day}T12:00:00+02:00`, "short")}</th>
                  <td className="r num">{d.bookings || "Closed"}</td>
                  <td className="r num">{f.money(d.cash, { whole: true })}</td>
                  <td className="r num opt">{f.money(d.card, { whole: true })}</td>
                  <td className="r num opt">{f.money(d.wallet, { whole: true })}</td>
                  <td className="r num">
                    <strong>{f.money(d.cash + d.card + d.wallet, { whole: true })}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Week</th>
                <td className="r num">{WEEK_SALES.reduce((t, d) => t + d.bookings, 0)}</td>
                <td />
                <td className="opt" />
                <td className="opt" />
                <td className="r num">
                  <strong>{f.money(total, { whole: true })}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Region>
    </section>
    </>
  );
}

function Expenses() {
  const f = useFormat();
  const state = useDataState();
  const [added, setAdded] = useState(false);
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="exp-title">
        <h2 id="exp-title" className="app-h2">
          December
        </h2>
        <Region state={state} label="Expenses" rows={4} empty={{ title: "No expenses this month", body: "Add rent, products and bills to see your real profit." }}>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">What</th>
                  <th scope="col">Type</th>
                  <th scope="col" className="r">Amount</th>
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map((e) => (
                  <tr key={e.id}>
                    <td>{f.date(`${e.date}T12:00:00Z`)}</td>
                    <th scope="row">{e.label}</th>
                    <td>{e.category}</td>
                    <td className="r num">{f.money(e.minor, { whole: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Region>
      </section>
      <section className="app-section app-panel" aria-labelledby="addexp-title">
        <h2 id="addexp-title" className="app-h2">
          Add an expense
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            setAdded(true);
          }}
        >
          <Field label="What">{(id) => <input id={id} className="ui-input" required />}</Field>
          <Field label="Amount">{(id) => <input id={id} className="ui-input num" inputMode="decimal" required />}</Field>
          <Field label="Type">
            {(id) => (
              <select id={id} className="ui-input">
                <option>Products</option>
                <option>Rent</option>
                <option>Bills</option>
                <option>Equipment</option>
                <option>Other</option>
              </select>
            )}
          </Field>
          <Field label="Receipt photo" hint="Optional. Your accountant will thank you.">
            {(id, hint) => <input id={id} aria-describedby={hint} className="ui-file" type="file" accept="image/*" />}
          </Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            Add expense
          </button>
          {added && <NotConnected what="expenses" />}
        </form>
      </section>
    </div>
  );
}

function Report() {
  const f = useFormat();
  const income = WEEK_SALES.reduce((t, d) => t + d.cash + d.card + d.wallet, 0);
  const costs = EXPENSES.reduce((t, e) => t + e.minor, 0);
  const commission = Math.round(income * 0.18);
  return (
    <section className="app-section" aria-labelledby="pl-title">
      <h2 id="pl-title" className="app-h2">
        December so far
      </h2>
      <div className="ui-tablewrap app-narrow">
        <table className="ui-table">
          <tbody>
            <tr>
              <th scope="row">Takings</th>
              <td className="r num">{f.money(income, { whole: true })}</td>
            </tr>
            <tr>
              <th scope="row">Commission to barbers</th>
              <td className="r num">−{f.money(commission, { whole: true })}</td>
            </tr>
            <tr>
              <th scope="row">Expenses</th>
              <td className="r num">−{f.money(costs, { whole: true })}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Profit</th>
              <td className="r num">
                <strong>{f.money(income - commission - costs, { whole: true })}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--quiet">
          Export as CSV
        </button>
      </div>
    </section>
  );
}

function Products() {
  const f = useFormat();
  const { products, adjustStock, addProduct } = useStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const low = products.filter((p) => p.stock <= p.low);
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="pr-title">
        <h2 id="pr-title" className="app-h2">
          On the shelf
        </h2>
        {low.length > 0 && (
          <p className="ui-live" role="status">
            Running low: {low.map((p) => p.name).join(", ")}.
          </p>
        )}
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col" className="r">Price</th>
                <th scope="col" className="r">Margin</th>
                <th scope="col" className="r">In stock</th>
                <th scope="col">
                  <span className="visually-hidden">Adjust</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.name}</th>
                  <td className="r num">{f.money(p.priceMinor, { whole: true })}</td>
                  <td className="r num">{f.pct((p.priceMinor - p.costMinor) / p.priceMinor)}</td>
                  <td className="r num" data-warn={p.stock <= p.low || undefined}>
                    {p.stock}
                  </td>
                  <td className="r">
                    <span className="row-actions">
                      <button type="button" className="ui-btn ui-btn--quiet" onClick={() => adjustStock(p.id, -1)} aria-label={`One less ${p.name}`}>
                        −1
                      </button>
                      <button type="button" className="ui-btn ui-btn--quiet" onClick={() => adjustStock(p.id, 6)} aria-label={`Six more ${p.name}`}>
                        +6
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="app-quiet">Stock goes down by itself when a product is sold at checkout.</p>
      </section>
      <form
        className="ui-form app-section app-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const pm = Math.round(parseFloat(price) * 100);
          const cm = Math.round(parseFloat(cost) * 100);
          if (!name.trim() || !pm) return;
          addProduct({ name: name.trim(), priceMinor: pm, costMinor: cm || 0, stock: 0, low: 3 });
          setName("");
          setPrice("");
          setCost("");
        }}
      >
        <h2 className="app-h2">New product</h2>
        <Field label="Name">{(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <div className="setup__row">
          <Field label="Sells for">{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />}</Field>
          <Field label="Costs you">{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />}</Field>
        </div>
        <button type="submit" className="ui-btn ui-btn--quiet">
          Add product
        </button>
      </form>
    </div>
  );
}

function Reports() {
  const f = useFormat();
  const today = BOOKINGS.filter((b) => b.start.startsWith(TODAY) && b.status !== "cancelled");
  const open = SCHEDULE_HOURS.close - SCHEDULE_HOURS.open;
  const minutes = (staffId: string) => today.filter((b) => b.staffId === staffId).reduce((m, b) => m + (new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000, 0);
  const byService = SERVICES.map((s) => ({ s, n: today.filter((b) => b.serviceIds.includes(s.id)).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const returning = CLIENTS.filter((c) => c.visits > 1).length;
  const noShows = CLIENTS.reduce((t, c) => t + c.noShows, 0);
  const visits = CLIENTS.reduce((t, c) => t + c.visits, 0);
  return (
    <>
      <div className="ui-stats ui-stats--row">
        <Stat label="Returning clients" value={f.pct(returning / CLIENTS.length)} sub={`${returning} of ${CLIENTS.length} have come back`} />
        <Stat label="No-show rate" value={f.pct(noShows / visits)} sub={`${noShows} of ${visits} visits`} />
        <Stat label="Bookings today" value={`${today.length}`} />
      </div>
      <div className="app-split app-split--checkout">
        <section className="app-section" aria-labelledby="ut-title">
          <h2 id="ut-title" className="app-h2">
            How full each chair is today
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Barber</th>
                  <th scope="col" className="r">Booked</th>
                  <th scope="col" className="r">Of the day</th>
                </tr>
              </thead>
              <tbody>
                {BOOKABLE.map((s) => (
                  <tr key={s.id}>
                    <th scope="row">{s.name}</th>
                    <td className="r num">{Math.round(minutes(s.id))} min</td>
                    <td className="r num">{f.pct(minutes(s.id) / open)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="app-section" aria-labelledby="sv-title">
          <h2 id="sv-title" className="app-h2">
            Most booked today
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col" className="r">Bookings</th>
                  <th scope="col" className="r">Worth</th>
                </tr>
              </thead>
              <tbody>
                {byService.map(({ s, n }) => (
                  <tr key={s.id}>
                    <th scope="row">{serviceById(s.id).name}</th>
                    <td className="r num">{n}</td>
                    <td className="r num">{f.money(n * s.priceMinor, { whole: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="app-section" aria-labelledby="perf-title">
        <h2 id="perf-title" className="app-h2">
          Each barber today
        </h2>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">Barber</th>
                <th scope="col" className="r">Clients</th>
                <th scope="col" className="r">Worth</th>
                <th scope="col" className="r opt">Average ticket</th>
                <th scope="col" className="r opt">Regulars who prefer them</th>
              </tr>
            </thead>
            <tbody>
              {BOOKABLE.map((s) => {
                const mine = today.filter((b) => b.staffId === s.id && b.status !== "blocked");
                const worth = mine.reduce((t, b) => t + b.serviceIds.reduce((m, id) => m + serviceById(id).priceMinor, 0), 0);
                return (
                  <tr key={s.id}>
                    <th scope="row">{s.name}</th>
                    <td className="r num">{mine.length}</td>
                    <td className="r num">{f.money(worth, { whole: true })}</td>
                    <td className="r num opt">{mine.length ? f.money(Math.round(worth / mine.length), { whole: true }) : "None yet"}</td>
                    <td className="r num opt">{CLIENTS.filter((c) => c.favourite === s.id).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="app-quiet">Figures come from the sample data in this preview.</p>
    </>
  );
}
