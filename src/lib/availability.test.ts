import { describe, expect, it } from "vitest";
import { busyIntervals, findSlots } from "./availability";
import { at, Booking, BOOKINGS, NOW, serviceById, TODAY } from "./data";

const MIN = 60000;
const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

describe("findSlots", () => {
  it("never offers a time that overlaps a booking for that barber", () => {
    for (const serviceIds of [["fade"], ["fadebeard"], ["beard"], ["cutdry"], ["kids"]]) {
      const slots = findSlots({ date: TODAY, serviceIds, bookings: BOOKINGS });
      const len = serviceIds.reduce((m, id) => m + serviceById(id).minutes, 0) * MIN;
      for (const s of slots) {
        const start = new Date(s.start).getTime();
        // a single-segment service needs the barber for its whole length
        const clash = BOOKINGS.filter((b) => b.staffId === s.staffId && b.status !== "cancelled" && b.status !== "no-show")
          .flatMap(busyIntervals)
          .find(([b0, b1]) => overlaps(start, start + len, b0, b1));
        expect(clash, `${serviceIds} at ${s.start} with ${s.staffId}`).toBeUndefined();
      }
    }
  });

  it("respects the minimum notice from now", () => {
    const earliest = new Date(NOW).getTime() + 30 * MIN;
    const slots = findSlots({ date: TODAY, serviceIds: ["fade"], bookings: BOOKINGS });
    expect(slots.length).toBeGreaterThan(0);
    slots.forEach((s) => expect(new Date(s.start).getTime()).toBeGreaterThanOrEqual(earliest));
  });

  it("only offers barbers who do every service asked for", () => {
    const slots = findSlots({ date: "2026-12-13", serviceIds: ["colour"], bookings: [] });
    expect(new Set(slots.map((s) => s.staffId))).toEqual(new Set(["hana"]));
  });

  it("lets another client into a colour's processing time", () => {
    const colour: Booking = { id: "x", clientId: "c5", staffId: "hana", serviceIds: ["colour"], start: at("12:00", "2026-12-13"), end: at("13:30", "2026-12-13"), status: "confirmed", source: "online" };
    const slots = findSlots({ date: "2026-12-13", serviceIds: ["fringe"], staffId: "hana", bookings: [colour] });
    // 30 min work from 12:00, then 40 min wait from 12:30: a 15-minute fringe fits at 12:30
    expect(slots.map((s) => s.start)).toContain(new Date(at("12:30", "2026-12-13")).toISOString());
    // but not during the first 30 minutes of work
    expect(slots.map((s) => s.start)).not.toContain(new Date(at("12:15", "2026-12-13")).toISOString());
  });

  it("returns nothing when the services do not fit before closing", () => {
    // twelve cut-and-blow-drys are 12 hours of work in an 11-hour day
    const slots = findSlots({ date: "2026-12-13", serviceIds: Array(12).fill("cutdry"), bookings: [] });
    expect(slots).toEqual([]);
  });

  it("treats a colour's processing time as free and its work, plus mixing time, as busy", () => {
    const colour: Booking = { id: "y", clientId: "c5", staffId: "hana", serviceIds: ["colour"], start: at("12:00"), end: at("13:30"), status: "confirmed", source: "online" };
    const t = (hhmm: string) => new Date(at(hhmm)).getTime();
    expect(busyIntervals(colour)).toEqual([
      [t("11:50"), t("12:30")], // 10 minutes to mix the colour first
      [t("13:10"), t("13:30")],
    ]);
  });

  it("keeps the clean-up after a shave free of other clients", () => {
    const shave: Booking = { id: "z", clientId: "c11", staffId: "karim", serviceIds: ["shave"], start: at("12:00", "2026-12-13"), end: at("12:30", "2026-12-13"), status: "confirmed", source: "phone" };
    const starts = findSlots({ date: "2026-12-13", serviceIds: ["beard"], staffId: "karim", bookings: [shave] }).map((s) => s.start);
    const iso = (hhmm: string) => new Date(at(hhmm, "2026-12-13")).toISOString();
    expect(starts).not.toContain(iso("12:30")); // towels still being changed
    expect(starts).toContain(iso("12:45"));
  });

  it("needs room for the mixing time before a colour", () => {
    const fade: Booking = { id: "f", clientId: "c1", staffId: "hana", serviceIds: ["fringe"], start: at("11:45", "2026-12-13"), end: at("12:00", "2026-12-13"), status: "confirmed", source: "online" };
    const starts = findSlots({ date: "2026-12-13", serviceIds: ["colour"], staffId: "hana", bookings: [fade] }).map((s) => s.start);
    const iso = (hhmm: string) => new Date(at(hhmm, "2026-12-13")).toISOString();
    expect(starts).not.toContain(iso("12:00")); // mixing would start at 11:50, during the fringe
    expect(starts).toContain(iso("12:15"));
  });

  it("blocked time keeps the slot off the booking page", () => {
    const block: Booking = { id: "blk", clientId: "", staffId: "karim", serviceIds: [], start: at("13:00", "2026-12-13"), end: at("14:00", "2026-12-13"), status: "blocked", source: "phone", label: "Lunch" };
    const slots = findSlots({ date: "2026-12-13", serviceIds: ["fade"], staffId: "karim", bookings: [block] });
    const inside = slots.filter((s) => overlaps(new Date(s.start).getTime(), new Date(s.start).getTime() + 30 * MIN, new Date(block.start).getTime(), new Date(block.end).getTime()));
    expect(inside).toEqual([]);
  });
});
