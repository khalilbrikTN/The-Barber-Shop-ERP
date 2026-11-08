import { useSettings } from "./settings";

/** Minor units per currency come from Intl, so TND gets 3 decimals and EUR 2. */
export function minorDigits(currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function toMinor(major: number, currency: string) {
  return Math.round(major * 10 ** minorDigits(currency));
}

/** Formats in the shop's currency and time zone. Client pages pass the client's language as the locale. */
export function useFormat(localeOverride?: string) {
  const { settings } = useSettings();
  const { currency, timeZone, hour12 } = settings;
  const locale = localeOverride ?? settings.locale;

  const money = (minor: number, opts: { whole?: boolean } = {}) => {
    const d = minorDigits(currency);
    const f = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: opts.whole ? 0 : d,
      maximumFractionDigits: opts.whole ? 0 : d,
    });
    return f.format(minor / 10 ** d);
  };

  const time = (iso: string | Date) =>
    new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12, timeZone }).format(new Date(iso));

  const day = (iso: string | Date, style: "short" | "long" = "long") =>
    new Intl.DateTimeFormat(locale, {
      weekday: style === "long" ? "long" : "short",
      day: "numeric",
      month: style === "long" ? "long" : "short",
      timeZone,
    }).format(new Date(iso));

  const date = (iso: string | Date) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone }).format(new Date(iso));

  const num = (n: number) => new Intl.NumberFormat(locale).format(n);
  const pct = (n: number) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(n);

  return { money, time, day, date, num, pct, currency, locale, timeZone };
}

/** Minutes from midnight in the shop's time zone, for laying out the calendar. */
export function minutesInZone(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone }).formatToParts(new Date(iso));
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  const m = Number(parts.find((p) => p.type === "minute")?.value);
  return h * 60 + m;
}
