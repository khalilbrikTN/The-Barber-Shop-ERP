import { useMemo } from "react";
import { Entry, fill, Plural, pluralForm, Vars } from "../lib/plural";
import { en } from "./locales/en";

export type { Entry, Plural };

/* The staff interface catalogue: the business app and barber mode (PLAN.md section 8.1).
   English at launch; every string goes through here so a language is a new file, not a rewrite.
   A string is "Text with {vars}"; a count uses a plural entry (src/lib/plural.ts), where {n} is
   the formatted count. */

export type AppKey = keyof typeof en;
export type TextKey = { [K in AppKey]: (typeof en)[K] extends string ? K : never }[AppKey];
export type PluralKey = Exclude<AppKey, TextKey>;
export type Catalogue = { [K in AppKey]: (typeof en)[K] extends string ? string : Plural };

export type StaffLang = "en";
export const STAFF_LANGS: { id: StaffLang; label: string; locale: string; dir: "ltr" | "rtl" }[] = [{ id: "en", label: "English", locale: "en", dir: "ltr" }];
export const STAFF_DICTS: Record<StaffLang, Catalogue> = { en };

export function translator(lang: StaffLang) {
  const dict = STAFF_DICTS[lang];
  const meta = STAFF_LANGS.find((l) => l.id === lang)!;
  const count = new Intl.NumberFormat(meta.locale);
  return {
    lang,
    dir: meta.dir,
    /** A plain string. */
    t: (key: TextKey, vars: Vars = {}) => fill(dict[key] as string, vars),
    /** A string that depends on a count; {n} is the count, formatted for the language. */
    tp: (key: PluralKey, n: number, vars: Vars = {}) => fill(pluralForm(dict[key] as Plural, n, meta.locale), { n: count.format(n), ...vars }),
    /** A stored data value (a status, a tag) in the staff's language, or as stored when the catalogue has no entry. */
    label: (group: string, value: string) => {
      const entry = (dict as Record<string, Entry>)[`${group}.${value}`];
      return typeof entry === "string" ? entry : value;
    },
  };
}

/** The staff member's interface language. One per user once accounts exist; English until a second catalogue ships. */
export function useT() {
  const lang: StaffLang = "en";
  return useMemo(() => translator(lang), [lang]);
}
