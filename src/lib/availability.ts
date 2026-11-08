import { Booking, BOOKABLE, NOW, SCHEDULE_HOURS, serviceById } from "./data";

/* A frontend stand-in for the booking engine (PLAN.md section 15): free slots per barber for one day,
   respecting existing bookings, a slot step and minimum notice. The server will own this later. */

export type Slot = { start: string; staffId: string };
type Seg = { kind: "work" | "wait"; minutes: number };

const MIN = 60000;

function pattern(serviceIds: string[]): Seg[] {
  return serviceIds.flatMap((id) => {
    const s = serviceById(id);
    return s.segments ?? [{ kind: "work" as const, minutes: s.minutes }];
  });
}

/** When a booking actually needs the barber: its work segments only, so a colour's processing time stays bookable.
    Blocked time, and any booking whose length no longer matches its services, holds the whole range. */
export function busyIntervals(b: Booking): [number, number][] {
  const start = new Date(b.start).getTime();
  const end = new Date(b.end).getTime();
  if (b.status === "blocked" || b.serviceIds.length === 0) return [[start, end]];
  const segs = pattern(b.serviceIds);
  if (segs.reduce((m, s) => m + s.minutes, 0) * MIN !== end - start) return [[start, end]];
  const out: [number, number][] = [];
  let t = start;
  for (const seg of segs) {
    const next = t + seg.minutes * MIN;
    if (seg.kind === "work") out.push([t, next]);
    t = next;
  }
  return out;
}

export function findSlots(opts: { date: string; serviceIds: string[]; staffId?: string; bookings: Booking[]; step?: number; noticeMin?: number }) {
  const { date, serviceIds, bookings, step = 15, noticeMin = 30 } = opts;
  const staff = BOOKABLE.filter((s) => (opts.staffId ? s.id === opts.staffId : true)).filter((s) => serviceIds.every((id) => s.services.includes(id)));
  const segs = pattern(serviceIds);
  const total = segs.reduce((m, s) => m + s.minutes, 0);
  const dayStart = new Date(`${date}T00:00:00+02:00`).getTime();
  const earliest = new Date(NOW).getTime() + noticeMin * MIN;
  const busyByStaff = new Map(
    staff.map((s) => [s.id, bookings.filter((b) => b.staffId === s.id && b.status !== "cancelled" && b.status !== "no-show").flatMap(busyIntervals)]),
  );
  const out: Slot[] = [];

  for (let m = SCHEDULE_HOURS.open; m + total <= SCHEDULE_HOURS.close; m += step) {
    const start = dayStart + m * MIN;
    if (start < earliest) continue;
    for (const s of staff) {
      const busy = busyByStaff.get(s.id)!;
      let t = start;
      const fits = segs.every((seg) => {
        const a = t;
        t += seg.minutes * MIN;
        if (seg.kind === "wait") return true;
        return busy.every(([b0, b1]) => t <= b0 || a >= b1);
      });
      if (fits) {
        out.push({ start: new Date(start).toISOString(), staffId: s.id });
        if (!opts.staffId) break; // "anyone": first free barber takes the slot
      }
    }
  }
  return out;
}
