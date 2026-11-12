/* Wall-clock times in the shop's time zone, turned into real instants. Never write an offset by hand:
   it changes with the country and, in places like Egypt, with the season. */

/** Minutes the zone is ahead of UTC at the instant `t`. */
export function zoneOffset(t: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(t));
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"));
  return Math.round((wall - Math.floor(t / 60000) * 60000) / 60000);
}

/** `2026-12-12` and `10:00` on the wall in `timeZone`, as ISO with that zone's offset, e.g. `2026-12-12T10:00:00+01:00`. */
export function zonedIso(date: string, hhmm: string, timeZone: string) {
  const asUtc = Date.parse(`${date}T${hhmm}:00Z`);
  let offset = zoneOffset(asUtc, timeZone);
  offset = zoneOffset(asUtc - offset * 60000, timeZone); // second pass settles days when the clocks change
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  return `${date}T${hhmm}:00${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}
