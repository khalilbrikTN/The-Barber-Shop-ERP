import { Booking, BOOKABLE, NOW, SCHEDULE_HOURS, serviceById } from "./data";

/* A frontend stand-in for the booking engine (PLAN.md section 15): free slots per barber for one day,
   respecting existing bookings, a slot step and minimum notice. The server will own this later. */

export type Slot = { start: string; staffId: string };

const MIN = 60000;

function pattern(serviceIds: string[]) {
  const segs: { kind: "work" | "wait"; minutes: number }[] = [];
  serviceIds.forEach((id) => {
    const s = serviceById(id);
    (s.segments ?? [{ kind: "work", minutes: s.minutes }]).forEach((seg) => segs.push(seg));
  });
  return segs;
}

export function findSlots(opts: { date: string; serviceIds: string[]; staffId?: string; bookings: Booking[]; step?: number; noticeMin?: number }) {
  const { date, serviceIds, bookings, step = 15, noticeMin = 30 } = opts;
  const staff = BOOKABLE.filter((s) => (opts.staffId ? s.id === opts.staffId : true)).filter((s) => serviceIds.every((id) => s.services.includes(id)));
  const segs = pattern(serviceIds);
  const total = segs.reduce((m, s) => m + s.minutes, 0);
  const dayStart = new Date(`${date}T00:00:00+02:00`).getTime();
  const earliest = new Date(NOW).getTime() + noticeMin * MIN;
  const out: Slot[] = [];

  for (let m = SCHEDULE_HOURS.open; m + total <= SCHEDULE_HOURS.close; m += step) {
    const start = dayStart + m * MIN;
    if (start < earliest) continue;
    for (const s of staff) {
      const busy = bookings.filter((b) => b.staffId === s.id && b.status !== "cancelled" && b.status !== "no-show");
      let t = start;
      const fits = segs.every((seg) => {
        const a = t;
        t += seg.minutes * MIN;
        if (seg.kind === "wait") return true;
        return busy.every((b) => t <= new Date(b.start).getTime() || a >= new Date(b.end).getTime());
      });
      if (fits) {
        out.push({ start: new Date(start).toISOString(), staffId: s.id });
        if (!opts.staffId) break; // "anyone": first free barber takes the slot
      }
    }
  }
  return out;
}
