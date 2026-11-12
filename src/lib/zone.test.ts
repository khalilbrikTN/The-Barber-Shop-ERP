import { describe, expect, it } from "vitest";
import { findSlots } from "./availability";
import { minutesInZone } from "./format";
import { zonedIso } from "./zone";

describe("zonedIso", () => {
  it("uses each zone's own offset", () => {
    expect(zonedIso("2026-12-12", "10:00", "Africa/Tunis")).toBe("2026-12-12T10:00:00+01:00");
    expect(zonedIso("2026-12-12", "10:00", "Africa/Cairo")).toBe("2026-12-12T10:00:00+02:00");
    expect(zonedIso("2026-12-12", "10:00", "Europe/London")).toBe("2026-12-12T10:00:00+00:00");
  });

  it("follows summer time where the country has it", () => {
    expect(zonedIso("2026-07-01", "10:00", "Africa/Cairo")).toBe("2026-07-01T10:00:00+03:00");
    expect(zonedIso("2026-07-01", "10:00", "Europe/Rome")).toBe("2026-07-01T10:00:00+02:00");
    expect(zonedIso("2026-07-01", "10:00", "Africa/Tunis")).toBe("2026-07-01T10:00:00+01:00"); // no summer time
  });

  it("reads back as the same wall-clock time in that zone", () => {
    for (const tz of ["Africa/Tunis", "Africa/Cairo", "Europe/Paris", "Asia/Dubai"]) {
      expect(minutesInZone(zonedIso("2026-03-29", "09:30", tz), tz)).toBe(9 * 60 + 30);
    }
  });
});

describe("findSlots in the shop's zone", () => {
  it("opens at 10:00 on the wall wherever the shop is", () => {
    for (const timeZone of ["Africa/Tunis", "Africa/Cairo", "Europe/Rome"]) {
      const [first] = findSlots({ date: "2026-12-13", serviceIds: ["fade"], bookings: [], timeZone });
      expect(minutesInZone(first.start, timeZone), timeZone).toBe(10 * 60);
    }
  });
});
