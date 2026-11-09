/* Shared by both catalogues: the client pages (src/lib/i18n.tsx) and the staff interface (src/app/i18n.ts).
   A plural entry lists the forms a language needs; Intl.PluralRules picks one, so Arabic's six forms
   (zero, one, two, few, many, other) work. An optional `zero` form is used for 0 in any language. */

export type Plural = { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string };
export type Entry = string | Plural;
export type Vars = Record<string, string | number>;

export function fill(text: string, vars: Vars) {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function pluralForm(entry: Plural, n: number, locale: string) {
  if (n === 0 && entry.zero) return entry.zero;
  const form = new Intl.PluralRules(locale).select(n) as keyof Plural;
  return entry[form] ?? entry.other;
}

/** The {placeholders} a string uses, sorted; the catalogue tests compare them across languages. */
export function placeholders(entry: Entry) {
  const texts = typeof entry === "string" ? [entry] : Object.values(entry).filter((v): v is string => typeof v === "string");
  return [...new Set(texts.flatMap((x) => [...x.matchAll(/\{(\w+)\}/g)].map((m) => m[1])))].sort();
}
