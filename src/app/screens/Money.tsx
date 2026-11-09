import { useState } from "react";
import { BOOKABLE, BOOKINGS, CLIENTS, EXPENSES, SCHEDULE_HOURS, serviceById, SERVICES, TODAY, WEEK_SALES } from "../../lib/data";
import { minorDigits, toMinor, useFormat } from "../../lib/format";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Region, Stat, Tabs, useDataState, useTab } from "../../ui/kit";
import { useT } from "../i18n";

const FLOAT = 50000;

export function Money() {
  const tab = useTab("tab", "cashup");
  const { t } = useT();
  return (
    <>
      <PageHead title={t("nav.money")} sub={t("money.sub")} />
      <Tabs
        tabs={[
          { id: "cashup", label: t("money.tabCashup") },
          { id: "sales", label: t("money.tabSales") },
          { id: "expenses", label: t("money.tabExpenses") },
          { id: "products", label: t("money.tabProducts") },
          { id: "reports", label: t("money.tabReports") },
          { id: "report", label: t("money.tabPL") },
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
  const { t } = useT();
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
          {t("money.today", { day: f.day(`${TODAY}T12:00:00+02:00`) })}
        </h2>
        <div className="ui-stats ui-stats--row">
          <Stat label={t("method.cash")} value={f.money(sum("cash"))} />
          <Stat label={t("method.card")} value={f.money(sum("card"))} />
          <Stat label={t("method.wallet")} value={f.money(sum("wallet"))} />
          <Stat label={t("money.float")} value={f.money(FLOAT)} />
        </div>
        <div className="plate">
          <span>{t("money.drawerHolds")}</span>
          <strong className="num">{f.money(expected)}</strong>
        </div>
      </section>
      <section className="app-section app-panel" aria-labelledby="count-title">
        <h2 id="count-title" className="app-h2">
          {t("money.count")}
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (countedMinor !== null) setClosed(true);
          }}
        >
          <Field label={t("money.counted")} hint={t("money.countedHint")}>
            {(id, hint) => <input id={id} aria-describedby={hint} className="ui-input num" inputMode="decimal" value={counted} onChange={(e) => setCounted(e.target.value)} />}
          </Field>
          {diff !== null && (
            <p className={diff === 0 ? "ui-live" : "ui-error"} aria-live="polite">
              {diff === 0 ? t("money.matches") : diff > 0 ? t("money.over", { amount: f.money(diff) }) : t("money.short", { amount: f.money(-diff) })}
            </p>
          )}
          <button type="submit" className="ui-btn ui-btn--primary" disabled={countedMinor === null}>
            {t("money.close")}
          </button>
          {closed && <NotConnected what={t("money.cashupThing")} />}
        </form>
      </section>
    </div>
  );
}

function Receipts() {
  const f = useFormat();
  const { t } = useT();
  const { sales, refundSale } = useStore();
  const [asking, setAsking] = useState<string | null>(null);
  const [reason, setReason] = useState("Client not happy");
  const recent = sales.slice(0, 8);
  const sum = (x: (typeof sales)[number]) => x.lines.reduce((t, l) => t + l.minor, 0) + x.tipMinor;
  return (
    <section className="app-section" aria-labelledby="rc-title">
      <h2 id="rc-title" className="app-h2">
        {t("money.latest")}
      </h2>
      {recent.length === 0 ? (
        <div className="ui-note">
          <p className="ui-note__title">{t("money.noSales")}</p>
          <p>{t("money.noSalesBody")}</p>
        </div>
      ) : (
        <div className="ui-tablewrap">
          <table className="ui-table ui-table--stack receipts">
            <thead>
              <tr>
                <th scope="col">{t("common.when")}</th>
                <th scope="col">{t("money.what")}</th>
                <th scope="col">{t("money.paidBy")}</th>
                <th scope="col" className="r">{t("money.amount")}</th>
                <th scope="col">
                  <span className="visually-hidden">{t("money.refund")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((x) => (
                <tr key={x.id}>
                  <td>{t("cp.dateTime", { date: f.day(x.time, "short"), time: f.time(x.time) })}</td>
                  <th scope="row">{x.lines.map((l) => l.label).join(", ")}</th>
                  <td>{t(`method.${x.method}` as const)}</td>
                  <td className="r num">{x.refunded ? <s>{f.money(sum(x))}</s> : f.money(sum(x))}</td>
                  <td className="r">
                    {x.refunded ? (
                      <span className="ui-status ui-status--cancelled">{t("money.refunded")}</span>
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
                          {t("money.refundWhy")}
                        </label>
                        <select id={`why-${x.id}`} className="ui-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                          {(["Client not happy", "Charged twice", "Wrong service rung up", "Other"] as const).map((r) => (
                            <option key={r} value={r}>
                              {t(`refund.${r}`)}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="ui-btn ui-btn--primary">
                          {t("money.refundAmount", { amount: f.money(sum(x)) })}
                        </button>
                        <button type="button" className="ui-btn ui-btn--text" onClick={() => setAsking(null)}>
                          {t("money.keepIt")}
                        </button>
                      </form>
                    ) : (
                      <button type="button" className="ui-btn ui-btn--text" onClick={() => setAsking(x.id)}>
                        {t("money.refund")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="app-quiet">{t("money.refundNote")}</p>
    </section>
  );
}

function Sales() {
  const f = useFormat();
  const { t } = useT();
  const state = useDataState();
  const total = WEEK_SALES.reduce((t, d) => t + d.cash + d.card + d.wallet, 0);
  return (
    <>
    <Receipts />
    <section className="app-section" aria-labelledby="sales-title">
      <h2 id="sales-title" className="app-h2">
        {t("money.week")}
      </h2>
      <Region state={state} label={t("money.tabSales")} rows={6} empty={{ title: t("money.noWeek"), body: t("money.noWeekBody") }}>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">{t("money.day")}</th>
                <th scope="col" className="r">{t("money.bookings")}</th>
                <th scope="col" className="r">{t("method.cash")}</th>
                <th scope="col" className="r opt">{t("method.card")}</th>
                <th scope="col" className="r opt">{t("method.wallet")}</th>
                <th scope="col" className="r">{t("common.total")}</th>
              </tr>
            </thead>
            <tbody>
              {WEEK_SALES.map((d) => (
                <tr key={d.day}>
                  <th scope="row">{f.day(`${d.day}T12:00:00+02:00`, "short")}</th>
                  <td className="r num">{d.bookings || t("money.closed")}</td>
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
                <th scope="row">{t("money.weekTotal")}</th>
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
  const { t, label } = useT();
  const state = useDataState();
  const [added, setAdded] = useState(false);
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="exp-title">
        <h2 id="exp-title" className="app-h2">
          {f.month(`${TODAY}T12:00:00+02:00`)}
        </h2>
        <Region state={state} label={t("money.expensesLabel")} rows={4} empty={{ title: t("money.noExpenses"), body: t("money.noExpensesBody") }}>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">{t("common.date")}</th>
                  <th scope="col">{t("money.what")}</th>
                  <th scope="col">{t("money.type")}</th>
                  <th scope="col" className="r">{t("money.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map((e) => (
                  <tr key={e.id}>
                    <td>{f.date(`${e.date}T12:00:00Z`)}</td>
                    <th scope="row">{e.label}</th>
                    <td>{label("expense", e.category)}</td>
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
          {t("money.addExpense")}
        </h2>
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            setAdded(true);
          }}
        >
          <Field label={t("money.what")}>{(id) => <input id={id} className="ui-input" required />}</Field>
          <Field label={t("money.amount")}>{(id) => <input id={id} className="ui-input num" inputMode="decimal" required />}</Field>
          <Field label={t("money.type")}>
            {(id) => (
              <select id={id} className="ui-input">
                {(["Products", "Rent", "Bills", "Equipment", "Other"] as const).map((c) => (
                  <option key={c} value={c}>
                    {t(`expense.${c}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t("money.receipt")} hint={t("money.receiptHint")}>
            {(id, hint) => <input id={id} aria-describedby={hint} className="ui-file" type="file" accept="image/*" />}
          </Field>
          <button type="submit" className="ui-btn ui-btn--quiet">
            {t("money.addExpenseBtn")}
          </button>
          {added && <NotConnected what={t("money.expensesThing")} />}
        </form>
      </section>
    </div>
  );
}

function Report() {
  const f = useFormat();
  const { t } = useT();
  const income = WEEK_SALES.reduce((t, d) => t + d.cash + d.card + d.wallet, 0);
  const costs = EXPENSES.reduce((t, e) => t + e.minor, 0);
  const commission = Math.round(income * 0.18);
  return (
    <section className="app-section" aria-labelledby="pl-title">
      <h2 id="pl-title" className="app-h2">
        {t("money.soFar", { month: f.month(`${TODAY}T12:00:00+02:00`) })}
      </h2>
      <div className="ui-tablewrap app-narrow">
        <table className="ui-table">
          <tbody>
            <tr>
              <th scope="row">{t("money.takings")}</th>
              <td className="r num">{f.money(income, { whole: true })}</td>
            </tr>
            <tr>
              <th scope="row">{t("money.commission")}</th>
              <td className="r num">−{f.money(commission, { whole: true })}</td>
            </tr>
            <tr>
              <th scope="row">{t("money.expensesLabel")}</th>
              <td className="r num">−{f.money(costs, { whole: true })}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t("money.profit")}</th>
              <td className="r num">
                <strong>{f.money(income - commission - costs, { whole: true })}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="rebook">
        <button type="button" className="ui-btn ui-btn--quiet">
          {t("money.export")}
        </button>
      </div>
    </section>
  );
}

function Products() {
  const f = useFormat();
  const { t } = useT();
  const { products, adjustStock, addProduct } = useStore();
  const { currency } = f;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const low = products.filter((p) => p.stock <= p.low);
  return (
    <div className="app-split">
      <section className="app-section" aria-labelledby="pr-title">
        <h2 id="pr-title" className="app-h2">
          {t("money.shelf")}
        </h2>
        {low.length > 0 && (
          <p className="ui-live" role="status">
            {t("money.low", { names: low.map((p) => p.name).join(", ") })}
          </p>
        )}
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">{t("money.product")}</th>
                <th scope="col" className="r">{t("common.price")}</th>
                <th scope="col" className="r">{t("money.margin")}</th>
                <th scope="col" className="r">{t("money.inStock")}</th>
                <th scope="col">
                  <span className="visually-hidden">{t("money.adjust")}</span>
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
                      <button type="button" className="ui-btn ui-btn--quiet" onClick={() => adjustStock(p.id, -1)} aria-label={t("money.oneLess", { name: p.name })}>
                        −1
                      </button>
                      <button type="button" className="ui-btn ui-btn--quiet" onClick={() => adjustStock(p.id, 6)} aria-label={t("money.sixMore", { name: p.name })}>
                        +6
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="app-quiet">{t("money.stockNote")}</p>
      </section>
      <form
        className="ui-form app-section app-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const pm = toMinor(parseFloat(price.replace(",", ".")), currency);
          const cm = toMinor(parseFloat(cost.replace(",", ".")), currency);
          if (!name.trim() || !pm) return;
          addProduct({ name: name.trim(), priceMinor: pm, costMinor: cm || 0, stock: 0, low: 3 });
          setName("");
          setPrice("");
          setCost("");
        }}
      >
        <h2 className="app-h2">{t("money.newProduct")}</h2>
        <Field label={t("common.name")}>{(id) => <input id={id} className="ui-input" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <div className="setup__row">
          <Field label={t("money.sellsFor")}>{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />}</Field>
          <Field label={t("money.costs")}>{(id) => <input id={id} className="ui-input num" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />}</Field>
        </div>
        <button type="submit" className="ui-btn ui-btn--quiet">
          {t("money.addProduct")}
        </button>
      </form>
    </div>
  );
}

function Reports() {
  const f = useFormat();
  const { t } = useT();
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
        <Stat label={t("money.returning")} value={f.pct(returning / CLIENTS.length)} sub={t("money.returningSub", { a: f.num(returning), b: f.num(CLIENTS.length) })} />
        <Stat label={t("money.noShowRate")} value={f.pct(noShows / visits)} sub={t("money.noShowSub", { a: f.num(noShows), b: f.num(visits) })} />
        <Stat label={t("money.bookingsToday")} value={f.num(today.length)} />
      </div>
      <div className="app-split app-split--checkout">
        <section className="app-section" aria-labelledby="ut-title">
          <h2 id="ut-title" className="app-h2">
            {t("money.chairs")}
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">{t("common.barber")}</th>
                  <th scope="col" className="r">{t("money.booked")}</th>
                  <th scope="col" className="r">{t("money.ofDay")}</th>
                </tr>
              </thead>
              <tbody>
                {BOOKABLE.map((s) => (
                  <tr key={s.id}>
                    <th scope="row">{s.name}</th>
                    <td className="r num">{t("common.minutes", { n: Math.round(minutes(s.id)) })}</td>
                    <td className="r num">{f.pct(minutes(s.id) / open)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="app-section" aria-labelledby="sv-title">
          <h2 id="sv-title" className="app-h2">
            {t("money.most")}
          </h2>
          <div className="ui-tablewrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th scope="col">{t("common.service")}</th>
                  <th scope="col" className="r">{t("money.bookings")}</th>
                  <th scope="col" className="r">{t("money.worth")}</th>
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
          {t("money.eachBarber")}
        </h2>
        <div className="ui-tablewrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">{t("common.barber")}</th>
                <th scope="col" className="r">{t("money.clients")}</th>
                <th scope="col" className="r">{t("money.worth")}</th>
                <th scope="col" className="r opt">{t("money.avg")}</th>
                <th scope="col" className="r opt">{t("money.regulars")}</th>
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
                    <td className="r num opt">{mine.length ? f.money(Math.round(worth / mine.length), { whole: true }) : t("money.noneYet")}</td>
                    <td className="r num opt">{CLIENTS.filter((c) => c.favourite === s.id).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="app-quiet">{t("money.sample")}</p>
    </>
  );
}
