import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { findSlots } from "../../lib/availability";
import { Booking, BOOKABLE, clientById, CLIENTS, NOW, SCHEDULE_HOURS, serviceById, SERVICES, staffById, TODAY } from "../../lib/data";
import { minutesInZone, useFormat } from "../../lib/format";
import { useStore } from "../../lib/store";
import { Field, NotConnected, PageHead, Region, Status, useDataState } from "../../ui/kit";

const STEP = 15;
const ROWS = (SCHEDULE_HOURS.close - SCHEDULE_HOURS.open) / STEP;

function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function Calendar() {
  const f = useFormat();
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
        title="Calendar"
        sub={view === "week" ? `Week of ${f.day(`${date}T12:00:00+02:00`)}, ${staffById(weekStaff).name}` : f.day(`${date}T12:00:00+02:00`)}
        actions={
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => set({ new: "1", booking: null })}>
            New booking
          </button>
        }
      />

      <div className="cal-toolbar">
        <div className="ui-seg" role="group" aria-label="Day">
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ date: addDays(date, view === "week" ? -7 : -1) })}>
            Previous
          </button>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ date: null })}>
            Today
          </button>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ date: addDays(date, view === "week" ? 7 : 1) })}>
            Next
          </button>
        </div>
        <div className="ui-seg" role="radiogroup" aria-label="View">
          {["day", "week"].map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} className="ui-segbtn" onClick={() => set({ view: v })}>
              {v === "day" ? "Day, all barbers" : "Week, one barber"}
            </button>
          ))}
        </div>
        {view === "week" && (
          <label className="cal-pick">
            <span>Barber</span>
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
          <span>Colour by</span>
          <select className="ui-input" value={colour} onChange={(e) => set({ colour: e.target.value })}>
            <option value="status">Status</option>
            <option value="category">Service type</option>
            <option value="source">Where it was booked</option>
          </select>
        </label>
      </div>

      <div className="cal-layout" data-panel={booking || creating ? "open" : undefined}>
        <Region
          state={state}
          label="Calendar"
          rows={8}
          empty={{
            title: "Nothing booked this day",
            body: "Bookings appear here as clients book online or you add them.",
            action: (
              <button type="button" className="ui-btn ui-btn--quiet" onClick={() => set({ new: "1", booking: null })}>
                New booking
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
                .map((b) => <Block key={b.id} b={b} col={ci + 2} onDrag={setDragging} onOpen={() => set({ booking: b.id, new: null })} selected={b.id === selected} />),
            )}
          </div>
        </Region>

        {booking && <BookingPanel b={booking} onClose={() => set({ booking: null })} />}
        {creating && <NewBookingPanel date={date} onClose={() => set({ new: null })} onCreated={(id) => set({ new: null, booking: id })} />}
      </div>
      {state === "full" && <p className="app-quiet cal-hint">Drag a booking to another time or barber to move it.</p>}
    </>
  );
}

function Block({ b, col, onDrag, onOpen, selected }: { b: Booking; col: number; onDrag: (id: string | null) => void; onOpen: () => void; selected: boolean }) {
  const f = useFormat();
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
      data-status={b.status.replace(/\s+/g, "-")}
      data-category={first?.category}
      data-source={b.source}
      style={{ gridColumn: col, gridRow: `${row} / span ${span}` }}
    >
      <span className="cal__block-time num">{f.time(b.start)}</span>
      <strong>{b.status === "blocked" ? b.label ?? "Blocked" : clientById(b.clientId)?.name}</strong>
      <span>{b.status === "blocked" ? "Not bookable" : b.serviceIds.map((id) => serviceById(id).name).join(", ")}</span>
      {hasWait && (
        <span className="cal__segs" aria-label="Processing time, the stylist is free">
          {segs.map((g, i) => (
            <span key={i} className="cal__seg" data-kind={g.kind} style={{ flexGrow: g.minutes }}>
              {g.kind === "wait" ? `${g.minutes} min processing, free` : ""}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

function BookingPanel({ b, onClose }: { b: Booking; onClose: () => void }) {
  const f = useFormat();
  const { setStatus } = useStore();
  const client = clientById(b.clientId);
  const { waitlist } = useStore();
  if (b.status === "blocked")
    return (
      <aside className="cal-panel" aria-labelledby="panel-title">
        <header className="cal-panel__head">
          <h2 id="panel-title" className="app-h2">
            {b.label ?? "Blocked time"}
          </h2>
          <button type="button" className="ui-btn ui-btn--text" onClick={onClose}>
            Close
          </button>
        </header>
        <p>
          {staffById(b.staffId).name}, {f.time(b.start)} to {f.time(b.end)}. Clients cannot book this time online.
        </p>
        <div className="cal-panel__actions">
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setStatus(b.id, "cancelled")}>
            Remove the block
          </button>
        </div>
      </aside>
    );
  const total = b.serviceIds.reduce((m, id) => m + serviceById(id).priceMinor, 0);
  const next: Record<string, { label: string; to: Booking["status"] } | null> = {
    confirmed: { label: "Check in", to: "checked in" },
    "checked in": { label: "Start", to: "in the chair" },
    "in the chair": null,
    done: null,
    "no-show": null,
    cancelled: null,
    blocked: null,
  };
  const step = next[b.status];

  return (
    <aside className="cal-panel" aria-labelledby="panel-title">
      <header className="cal-panel__head">
        <h2 id="panel-title" className="app-h2">
          {client?.name}
        </h2>
        <button type="button" className="ui-btn ui-btn--text" onClick={onClose}>
          Close
        </button>
      </header>
      <dl className="ui-dl">
        <div>
          <dt>When</dt>
          <dd>
            {f.time(b.start)} to {f.time(b.end)}, {staffById(b.staffId).name}
          </dd>
        </div>
        <div>
          <dt>Services</dt>
          <dd>{b.serviceIds.map((id) => serviceById(id).name).join(", ")}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd className="num">{f.money(total)}</dd>
        </div>
        {b.deposit && (
          <div>
            <dt>Deposit paid</dt>
            <dd className="num">{f.money(b.deposit)}</dd>
          </div>
        )}
        <div>
          <dt>Booked</dt>
          <dd>{b.source}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <Status value={b.status} />
          </dd>
        </div>
      </dl>
      {client?.notes && (
        <div className="cal-panel__notes">
          <p className="ui-field__label">Haircut notes</p>
          <p>{client.notes}</p>
        </div>
      )}
      {b.status === "cancelled" && waitlist.length > 0 && (
        <div className="cal-panel__notes">
          <p className="ui-field__label">This time is free again</p>
          <p>{waitlist.length} on the waitlist today. Offer it from the Queue screen.</p>
          <Link className="app-more" to="/app/queue#waitlist">
            Open the waitlist
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
            Check out
          </Link>
        )}
        {b.status === "confirmed" && (
          <>
            <button type="button" className="ui-btn ui-btn--quiet" onClick={() => setStatus(b.id, "no-show")}>
              No-show
            </button>
            <button type="button" className="ui-btn ui-btn--text" onClick={() => setStatus(b.id, "cancelled")}>
              Cancel booking
            </button>
          </>
        )}
        <Link className="ui-btn ui-btn--text" to={`/app/clients/${b.clientId}`}>
          Client profile
        </Link>
      </div>
    </aside>
  );
}

function NewBookingPanel({ date, onClose, onCreated }: { date: string; onClose: () => void; onCreated: (id: string) => void }) {
  const f = useFormat();
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
  const [blockLabel, setBlockLabel] = useState("Lunch");
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
          New booking
        </h2>
        <button type="button" className="ui-btn ui-btn--text" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="ui-seg ui-seg--fill" role="radiogroup" aria-label="What to add">
        <button type="button" role="radio" aria-checked={kind === "booking"} className="ui-segbtn" onClick={() => setKind("booking")}>
          Booking
        </button>
        <button type="button" role="radio" aria-checked={kind === "block"} className="ui-segbtn" onClick={() => setKind("block")}>
          Blocked time
        </button>
      </div>
      {kind === "block" ? (
        <form
          className="ui-form"
          onSubmit={(e) => {
            e.preventDefault();
            const created = addBooking({ clientId: "", serviceIds: [], staffId: blockStaff, start: `${date}T${blockFrom}:00+02:00`, status: "blocked", source: "phone", label: blockLabel || "Blocked", minutes: blockMin });
            onCreated(created.id);
          }}
        >
          <Field label="Who">
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
          <Field label="Reason">{(id) => <input id={id} className="ui-input" value={blockLabel} onChange={(e) => setBlockLabel(e.target.value)} />}</Field>
          <div className="setup__row">
            <Field label="From">{(id) => <input id={id} type="time" step={900} className="ui-input" value={blockFrom} onChange={(e) => setBlockFrom(e.target.value)} />}</Field>
            <Field label="For">
              {(id) => (
                <select id={id} className="ui-input" value={blockMin} onChange={(e) => setBlockMin(Number(e.target.value))}>
                  {[15, 30, 45, 60, 90, 120, 240].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <button type="submit" className="ui-btn ui-btn--primary">
            Block the time
          </button>
        </form>
      ) : (
      <form className="ui-form" onSubmit={submit}>
        <Field label="Client">
          {(id) => (
            <select id={id} className="ui-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.phone}
                </option>
              ))}
            </select>
          )}
        </Field>
        <fieldset className="ui-fieldset">
          <legend>Services</legend>
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
                {s.name}, {s.minutes} min
              </span>
            </label>
          ))}
        </fieldset>
        <Field label="Barber">
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
              <option value="">Anyone free</option>
              {BOOKABLE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <fieldset className="ui-fieldset">
          <legend>Time</legend>
          {serviceIds.length === 0 ? (
            <p className="app-quiet">Pick a service to see free times.</p>
          ) : slots.length === 0 ? (
            <p className="app-quiet">No free time that day for this. Try another barber or day.</p>
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
        <Field label="Repeat">
          {(id) => (
            <select id={id} className="ui-input" value={repeat} onChange={(e) => setRepeat(Number(e.target.value))}>
              <option value={0}>Just this once</option>
              <option value={2}>Every 2 weeks, 6 visits</option>
              <option value={3}>Every 3 weeks, 6 visits</option>
              <option value={4}>Every 4 weeks, 6 visits</option>
            </select>
          )}
        </Field>
        <button type="submit" className="ui-btn ui-btn--primary" disabled={!slot}>
          Book it
        </button>
        <NotConnected what="booking" />
      </form>
      )}
    </aside>
  );
}
