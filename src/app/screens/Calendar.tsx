import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { findSlots } from "../../lib/availability";
import { Booking, BOOKABLE, clientById, CLIENTS, NOW, SCHEDULE_HOURS, serviceById, SERVICES, staffById, TODAY } from "../../lib/data";
import { minutesInZone, useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Region, Status, useDataState } from "../../ui/kit";
import { useT } from "../i18n";

const STEP = 15;
const ROWS = (SCHEDULE_HOURS.close - SCHEDULE_HOURS.open) / STEP;

function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function Calendar() {
  const f = useFormat();
  const { t } = useT();
  const state = useDataState();
  const [params, setParams] = useSearchParams();
  const { bookings, moveBooking } = useStore();
  const date = params.get("date") ?? TODAY;
  const view = params.get("view") ?? "day";
  const colour = params.get("colour") ?? "status";
  const weekStaff = params.get("staff") ?? BOOKABLE[0].id;
  const selected = params.get("booking");
  const creating = params.get("new") === "1";
  const [dragging, setDragging] = useState<string | null>(null);

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  const columns = useMemo(() => {
    if (view === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(date, i);
        return { key: d, label: f.day(`${d}T12:00:00+02:00`, "short"), staffId: weekStaff, date: d };
      });
    }
    return BOOKABLE.map((s) => ({ key: s.id, label: s.name, staffId: s.id, date }));
  }, [view, date, weekStaff, f]);

  const nowMin = minutesInZone(NOW, f.timeZone);
  const nowRow = Math.floor((nowMin - SCHEDULE_HOURS.open) / STEP);
  const nowOffset = ((nowMin - SCHEDULE_HOURS.open) % STEP) / STEP;

  function drop(col: (typeof columns)[number], row: number) {
    if (!dragging) return;
    const minutes = SCHEDULE_HOURS.open + row * STEP;
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    moveBooking(dragging, col.staffId, `${col.date}T${hh}:${mm}:00+02:00`);
    setDragging(null);
  }

  const booking = bookings.find((b) => b.id === selected);

  return (
    <>
      <PageHead
        title={t("cal.label")}
        sub={view === "week" ? t("cal.weekOf", { day: f.day(`${date}T12:00:00+02:00`), name: staffById(weekStaff).name }) : f.day(`${date}T12:00:00+02:00`)}
        actions={
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => set({ new: "1", booking: null })}>
            {t("cal.newBooking")}
          </button>
        }
      />

      <div className="cal-toolbar">
        <div className="ui-seg" role="group" aria-label={t("cal.dayNav")}>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ date: addDays(date, view === "week" ? -7 : -1) })}>
            {t("cal.previous")}
          </button>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ date: null })}>
            {t("cal.today")}
          </button>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ date: addDays(date, view === "week" ? 7 : 1) })}>
            {t("cal.next")}
          </button>
        </div>
        <div className="ui-seg" role="radiogroup" aria-label={t("cal.view")}>
          {["day", "week"].map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} className="ui-segbtn" onClick={() => set({ view: v })}>
              {v === "day" ? t("cal.viewDay") : t("cal.viewWeek")}
            </button>
          ))}
        </div>
        {view === "week" && (
          <label className="cal-pick">
            <span>{t("common.barber")}</span>
            <select className="ui-input" value={weekStaff} onChange={(e) => set({ staff: e.target.value })}>
              {BOOKABLE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="cal-pick">
          <span>{t("cal.colourBy")}</span>
          <select className="ui-input" value={colour} onChange={(e) => set({ colour: e.target.value })}>
            <option value="status">{t("cal.colourStatus")}</option>
            <option value="category">{t("cal.colourCategory")}</option>
            <option value="source">{t("cal.colourSource")}</option>
          </select>
        </label>
      </div>

      <div className="cal-layout" data-panel={booking || creating ? "open" : undefined}>
        <Region
          state={state}
          label={t("cal.label")}
          rows={8}
          empty={{
            title: t("cal.empty"),
            body: t("cal.emptyBody"),
            action: (
              <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ new: "1", booking: null })}>
                {t("cal.newBooking")}
              </button>
            ),
          }}
        >
          <div className="cal" style={{ ["--cols" as string]: columns.length, ["--rows" as string]: ROWS }} data-colour={colour}>
            <div className="cal__corner" />
            {columns.map((c, ci) => (
              <div key={c.key} className="cal__colhead" style={{ gridColumn: ci + 2 }}>
                {c.label}
              </div>
            ))}
            {Array.from({ length: ROWS / 4 }, (_, h) => (
              <div key={h} className="cal__hour num" style={{ gridRow: `${h * 4 + 2} / span 4` }}>
                {f.time(`${TODAY}T${String(SCHEDULE_HOURS.open / 60 + h).padStart(2, "0")}:00:00+02:00`)}
              </div>
            ))}
            {columns.map((c, ci) =>
              Array.from({ length: ROWS }, (_, r) => (
                <div
                  key={`${c.key}-${r}`}
                  className="cal__cell"
                  data-hour={r % 4 === 0 || undefined}
                  style={{ gridColumn: ci + 2, gridRow: r + 2 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(c, r)}
                />
              )),
            )}
            {date === TODAY && view === "day" && nowRow >= 0 && nowRow < ROWS && (
              <div className="cal__now" style={{ gridColumn: `2 / span ${columns.length}`, gridRow: nowRow + 2, ["--now-offset" as string]: nowOffset }} aria-hidden="true" />
            )}
            {columns.map((c, ci) =>
              bookings
                .filter((b) => b.staffId === c.staffId && b.start.startsWith(c.date) && b.status !== "cancelled")
                .map((b, _i, day) => {
                  // a booking that starts inside another one (a colour's processing time) sits beside it, not on top
                  const inset = day.some((o) => o.id !== b.id && o.start < b.start && o.end > b.start);
                  return <Block key={b.id} b={b} col={ci + 2} inset={inset} onDrag={setDragging} onOpen={() => set({ booking: b.id, new: null })} selected={b.id === selected} />;
                }),
            )}
          </div>
        </Region>

        {booking && <BookingPanel key={booking.id} b={booking} onClose={() => set({ booking: null })} />}
        {creating && <NewBookingPanel date={date} onClose={() => set({ new: null })} onCreated={(id) => set({ new: null, booking: id })} />}
      </div>
      {state === "full" && <p className="app-quiet cal-hint">{t("cal.dragHint")}</p>}
    </>
  );
}

function Block({ b, col, inset, onDrag, onOpen, selected }: { b: Booking; col: number; inset?: boolean; onDrag: (id: string | null) => void; onOpen: () => void; selected: boolean }) {
  const f = useFormat();
  const { t } = useT();
  const start = minutesInZone(b.start, f.timeZone);
  const end = minutesInZone(b.end, f.timeZone);
  const row = Math.round((start - SCHEDULE_HOURS.open) / STEP) + 2;
  const span = Math.max(1, Math.round((end - start) / STEP));
  const first = b.serviceIds.length ? serviceById(b.serviceIds[0]) : undefined;
  const segs = b.serviceIds.flatMap((id) => serviceById(id).segments ?? [{ kind: "work" as const, minutes: serviceById(id).minutes }]);
  const hasWait = segs.some((g) => g.kind === "wait");
  return (
    <button
      type="button"
      className="cal__block"
      draggable
      onDragStart={() => onDrag(b.id)}
      onDragEnd={() => onDrag(null)}
      onClick={onOpen}
      aria-pressed={selected}
      data-inset={inset || undefined}
      data-status={b.status.replace(/\s+/g, "-")}
      data-category={first?.category}
      data-source={b.source}
      style={{ gridColumn: col, gridRow: `${row} / span ${span}` }}
    >
      <span className="cal__block-time num">{f.time(b.start)}</span>
      <strong>{b.status === "blocked" ? b.label ?? t("cal.blocked") : clientById(b.clientId)?.name}</strong>
      <span>{b.status === "blocked" ? t("cal.notBookable") : b.serviceIds.map((id) => serviceById(id).name).join(", ")}</span>
      {hasWait && (
        <span className="cal__segs" aria-label={t("cal.processingLabel")}>
          {segs.map((g, i) => (
            <span key={i} className="cal__seg" data-kind={g.kind} style={{ flexGrow: g.minutes }}>
              {g.kind === "wait" ? t("cal.processing", { n: g.minutes }) : ""}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

function BookingPanel({ b, onClose }: { b: Booking; onClose: () => void }) {
  const f = useFormat();
  const { t, tp } = useT();
  const { setStatus, moveBooking, waitlist } = useStore();
  const client = clientById(b.clientId);
  const [undo, setUndo] = useState<{ from: Booking["status"]; said: string } | null>(null);
  const startMin = minutesInZone(b.start, f.timeZone);
  const [moveTime, setMoveTime] = useState(startMin);
  const [moveStaff, setMoveStaff] = useState(b.staffId);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // on a phone the panel sits under the calendar; bring it to the barber's thumb
    if (window.matchMedia("(max-width: 60rem)").matches) panelRef.current?.scrollIntoView({ block: "start" });
  }, []);

  function act(to: Booking["status"], said: string) {
    setUndo({ from: b.status, said });
    setStatus(b.id, to);
  }

  if (b.status === "blocked")
    return (
      <aside className="cal-panel" aria-labelledby="panel-title">
        <header className="cal-panel__head">
          <h2 id="panel-title" className="app-h2">
            {b.label ?? t("cal.blockedTime")}
          </h2>
          <button type="button" className="ui-btn ui-btn--text" onClick={onClose}>
            {t("common.close")}
          </button>
        </header>
        <p>
          {t("cal.blockedBody", { name: staffById(b.staffId).name, from: f.time(b.start), to: f.time(b.end) })}
        </p>
        <div className="cal-panel__actions">
          <button
            type="button"
            className="ui-btn ui-btn--quiet"
            onClick={() => {
              setStatus(b.id, "cancelled");
              onClose();
            }}
          >
            {t("cal.removeBlock")}
          </button>
        </div>
      </aside>
    );
  const total = b.serviceIds.reduce((m, id) => m + serviceById(id).priceMinor, 0);
  const next: Record<string, { label: string; to: Booking["status"] } | null> = {
    confirmed: { label: t("cal.checkIn"), to: "checked in" },
    "checked in": { label: t("cal.start"), to: "in the chair" },
    "in the chair": null,
    done: null,
    "no-show": null,
    cancelled: null,
    blocked: null,
  };
  const step = next[b.status];
  const movable = b.status === "confirmed" || b.status === "checked in";
  const times = Array.from({ length: (SCHEDULE_HOURS.close - SCHEDULE_HOURS.open) / STEP }, (_, i) => SCHEDULE_HOURS.open + i * STEP);
  const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  return (
    <aside className="cal-panel" aria-labelledby="panel-title" ref={panelRef}>
      <header className="cal-panel__head">
        <h2 id="panel-title" className="app-h2">
          {client?.name}
        </h2>
        <button type="button" className="ui-btn ui-btn--text" onClick={onClose}>
          {t("common.close")}
        </button>
      </header>
      {undo && (
        <p className="ui-live cal-panel__undo" role="status">
          <span>{undo.said}</span>
          <button
            type="button"
            className="ui-btn ui-btn--text"
            onClick={() => {
              setStatus(b.id, undo.from);
              setUndo(null);
            }}
          >
            {t("common.undo")}
          </button>
        </p>
      )}
      <dl className="ui-dl">
        <div>
          <dt>{t("common.when")}</dt>
          <dd>{t("cal.whenValue", { from: f.time(b.start), to: f.time(b.end), name: staffById(b.staffId).name })}</dd>
        </div>
        <div>
          <dt>{t("common.services")}</dt>
          <dd>{b.serviceIds.map((id) => serviceById(id).name).join(", ")}</dd>
        </div>
        <div>
          <dt>{t("common.price")}</dt>
          <dd className="num">{f.money(total)}</dd>
        </div>
        {b.deposit && (
          <div>
            <dt>{t("cal.depositPaid")}</dt>
            <dd className="num">{f.money(b.deposit)}</dd>
          </div>
        )}
        <div>
          <dt>{t("cal.booked")}</dt>
          <dd>{b.repeatId ? t("cal.repeating", { source: t(`source.${b.source}` as const) }) : t(`source.${b.source}` as const)}</dd>
        </div>
        <div>
          <dt>{t("common.status")}</dt>
          <dd>
            <Status value={b.status} />
          </dd>
        </div>
      </dl>
      {client?.notes && (
        <div className="cal-panel__notes">
          <p className="ui-field__label">{t("cal.notes")}</p>
          <p>{client.notes}</p>
        </div>
      )}
      {b.status === "cancelled" && waitlist.length > 0 && (
        <div className="cal-panel__notes">
          <p className="ui-field__label">{t("cal.freeAgain")}</p>
          <p>{tp("cal.onWaitlist", waitlist.length)}</p>
          <Link className="app-more" to="/app/queue#waitlist">
            {t("cal.openWaitlist")}
          </Link>
        </div>
      )}
      <div className="cal-panel__actions">
        {step && (
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => setStatus(b.id, step.to)}>
            {step.label}
          </button>
        )}
        {(b.status === "in the chair" || b.status === "checked in") && (
          <Link className="ui-btn ui-btn--primary" to={`/app/checkout?booking=${b.id}`}>
            {t("cal.checkOut")}
          </Link>
        )}
        {b.status === "confirmed" && (
          <>
            <button type="button" className="ui-btn ui-btn--quiet" onClick={() => act("no-show", t("cal.markedNoShow", { name: client?.name ?? t("cal.theClient") }))}>
              {t("cal.noShow")}
            </button>
            <button type="button" className="ui-btn ui-btn--text" onClick={() => act("cancelled", t("cal.cancelled"))}>
              {t("cal.cancel")}
            </button>
          </>
        )}
        <Link className="ui-btn ui-btn--text" to={`/app/clients/${b.clientId}`}>
          {t("cal.profile")}
        </Link>
      </div>
      {movable && (
        <form
          className="cal-move"
          onSubmit={(e) => {
            e.preventDefault();
            moveBooking(b.id, moveStaff, `${b.start.slice(0, 10)}T${hhmm(moveTime)}:00+02:00`);
          }}
        >
          <p className="ui-field__label">{t("cal.moveTitle")}</p>
          <div className="setup__row">
            <Field label={t("common.time")}>
              {(id) => (
                <select id={id} className="ui-input" value={moveTime} onChange={(e) => setMoveTime(Number(e.target.value))}>
                  {times.map((m) => (
                    <option key={m} value={m}>
                      {hhmm(m)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t("common.barber")}>
              {(id) => (
                <select id={id} className="ui-input" value={moveStaff} onChange={(e) => setMoveStaff(e.target.value)}>
                  {BOOKABLE.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <button type="submit" className="ui-btn ui-btn--quiet" disabled={moveTime === startMin && moveStaff === b.staffId}>
            {t("cal.move")}
          </button>
        </form>
      )}
    </aside>
  );
}

function NewBookingPanel({ date, onClose, onCreated }: { date: string; onClose: () => void; onCreated: (id: string) => void }) {
  const f = useFormat();
  const { t } = useT();
  const { bookings, addBooking } = useStore();
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [serviceIds, setServiceIds] = useState<string[]>(["fade"]);
  const [staffId, setStaffId] = useState("");
  const [slot, setSlot] = useState("");
  const [kind, setKind] = useState<"booking" | "block">("booking");
  const [repeat, setRepeat] = useState(0);
  const [blockStaff, setBlockStaff] = useState(BOOKABLE[0].id);
  const [blockFrom, setBlockFrom] = useState("13:00");
  const [blockMin, setBlockMin] = useState(30);
  const [blockLabel, setBlockLabel] = useState(() => t("cal.lunch"));
  const slots = findSlots({ date, serviceIds, staffId: staffId || undefined, bookings });

  function submit(e: FormEvent) {
    e.preventDefault();
    const s = slots.find((x) => `${x.start}|${x.staffId}` === slot);
    if (!s) return;
    const repeatId = repeat ? `r${Date.now()}` : undefined;
    const created = addBooking({ clientId, serviceIds, staffId: s.staffId, start: s.start, status: "confirmed", source: "phone", repeatId });
    for (let i = 1; repeat && i < 6; i++) {
      const start = new Date(new Date(s.start).getTime() + i * repeat * 7 * 86400000).toISOString();
      addBooking({ clientId, serviceIds, staffId: s.staffId, start, status: "confirmed", source: "phone", repeatId });
    }
    onCreated(created.id);
  }

  return (
    <aside className="cal-panel" aria-labelledby="new-title">
      <header className="cal-panel__head">
        <h2 id="new-title" className="app-h2">
          {t("cal.newBooking")}
        </h2>
        <button type="button" className="ui-btn ui-btn--text" onClick={onClose}>
          {t("common.close")}
        </button>
      </header>
      <div className="ui-seg ui-seg--fill" role="radiogroup" aria-label={t("cal.whatToAdd")}>
        <button type="button" role="radio" aria-checked={kind === "booking"} className="ui-segbtn" onClick={() => setKind("booking")}>
          {t("cal.booking")}
        </button>
        <button type="button" role="radio" aria-checked={kind === "block"} className="ui-segbtn" onClick={() => setKind("block")}>
          {t("cal.blockedTime")}
        </button>
      </div>
      {kind === "block" ? (
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            const created = addBooking({ clientId: "", serviceIds: [], staffId: blockStaff, start: `${date}T${blockFrom}:00+02:00`, status: "blocked", source: "phone", label: blockLabel || t("cal.blocked"), minutes: blockMin });
            onCreated(created.id);
          }}
        >
          <Field label={t("cal.who")}>
            {(id) => (
              <select id={id} className="ui-input" value={blockStaff} onChange={(e) => setBlockStaff(e.target.value)}>
                {BOOKABLE.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t("cal.reason")}>{(id) => <input id={id} className="ui-input" value={blockLabel} onChange={(e) => setBlockLabel(e.target.value)} />}</Field>
          <div className="setup__row">
            <Field label={t("cal.from")}>{(id) => <input id={id} type="time" step={900} className="ui-input" value={blockFrom} onChange={(e) => setBlockFrom(e.target.value)} />}</Field>
            <Field label={t("cal.for")}>
              {(id) => (
                <select id={id} className="ui-input" value={blockMin} onChange={(e) => setBlockMin(Number(e.target.value))}>
                  {[15, 30, 45, 60, 90, 120, 240].map((m) => (
                    <option key={m} value={m}>
                      {t("common.minutes", { n: m })}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <button type="submit" className="ui-btn ui-btn--primary">
            {t("cal.block")}
          </button>
        </form>
      ) : (
      <form className="ui-form" onSubmit={submit}>
        <Field label={t("common.client")}>
          {(id) => (
            <select id={id} className="ui-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {t("cal.clientOption", { name: c.name, phone: c.phone })}
                </option>
              ))}
            </select>
          )}
        </Field>
        <fieldset className="ui-fieldset">
          <legend>{t("common.services")}</legend>
          {SERVICES.map((s) => (
            <label key={s.id} className="ui-check">
              <input
                type="checkbox"
                checked={serviceIds.includes(s.id)}
                onChange={(e) => {
                  setSlot("");
                  setServiceIds((ids) => (e.target.checked ? [...ids, s.id] : ids.filter((x) => x !== s.id)));
                }}
              />
              <span>
                {t("common.serviceMin", { name: s.name, n: s.minutes })}
              </span>
            </label>
          ))}
        </fieldset>
        <Field label={t("common.barber")}>
          {(id) => (
            <select
              id={id}
              className="ui-input"
              value={staffId}
              onChange={(e) => {
                setSlot("");
                setStaffId(e.target.value);
              }}
            >
              <option value="">{t("common.anyoneFree")}</option>
              {BOOKABLE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <fieldset className="ui-fieldset">
          <legend>{t("common.time")}</legend>
          {serviceIds.length === 0 ? (
            <p className="app-quiet">{t("cal.pickService")}</p>
          ) : slots.length === 0 ? (
            <p className="app-quiet">{t("cal.noTime")}</p>
          ) : (
            <div className="slot-grid">
              {slots.slice(0, 24).map((s) => {
                const v = `${s.start}|${s.staffId}`;
                return (
                  <label key={v} className="slot">
                    <input type="radio" name="slot" value={v} checked={slot === v} onChange={() => setSlot(v)} />
                    <span className="num">{f.time(s.start)}</span>
                    {!staffId && <small>{staffById(s.staffId).name}</small>}
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
        <Field label={t("cal.repeat")}>
          {(id) => (
            <select id={id} className="ui-input" value={repeat} onChange={(e) => setRepeat(Number(e.target.value))}>
              <option value={0}>{t("cal.once")}</option>
              {[2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {t("cal.every", { n })}
                </option>
              ))}
            </select>
          )}
        </Field>
        <button type="submit" className="ui-btn ui-btn--primary" disabled={!slot}>
          {t("cal.bookIt")}
        </button>
        <NotConnected what={t("cal.thing")} />
      </form>
      )}
    </aside>
  );
}
