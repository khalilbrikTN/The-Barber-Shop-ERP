import { describe, expect, it } from "vitest";
import { STAFF_DICTS } from "../app/i18n";
import { en as staffEn } from "../app/locales/en";
import { DICTS } from "./i18n";
import { Entry, fill, Plural, pluralForm, placeholders } from "./plural";

/* The catalogue checks from PLAN.md section 19: no missing or extra keys in any language,
   the same placeholders everywhere, every plural form a language needs, and no dead keys. */

type Dict = Record<string, Entry>;

function sameShape(name: string, source: Dict, other: Dict) {
  expect(Object.keys(other).sort(), `${name}: keys`).toEqual(Object.keys(source).sort());
  for (const [key, entry] of Object.entries(source)) {
    const theirs = other[key];
    expect(typeof theirs, `${name} ${key}: string or plural`).toBe(typeof entry);
    // a plural form may spell its number out ("one minute"), so {n} is allowed to be missing there
    const want = placeholders(entry).filter((p) => typeof entry === "string" || p !== "n");
    const got = placeholders(theirs).filter((p) => typeof theirs === "string" || p !== "n");
    expect(got, `${name} ${key}: placeholders`).toEqual(want);
    if (typeof theirs === "string") expect(theirs.trim(), `${name} ${key}: empty`).not.toBe("");
  }
}

/** Romance languages use "many" only for millions ("1 000 000 de visites"); "other" covers every count a shop sees. */
const MILLIONS_ONLY = ["fr", "it", "es", "pt"];

function pluralsCover(name: string, dict: Dict, locale: string) {
  const needed = new Intl.PluralRules(locale)
    .resolvedOptions()
    .pluralCategories.filter((c) => c !== "zero" && !(c === "many" && MILLIONS_ONLY.includes(locale)));
  for (const [key, entry] of Object.entries(dict)) {
    if (typeof entry === "string") continue;
    for (const form of needed) expect((entry as Plural)[form as keyof Plural], `${name} ${key}: "${form}" form`).toBeTypeOf("string");
  }
}

describe("client catalogue (shop site, booking, account, kiosk, TV)", () => {
  it("Arabic and French match English key for key", () => {
    sameShape("ar", DICTS.en, DICTS.ar);
    sameShape("fr", DICTS.en, DICTS.fr);
  });
  it("has every plural form each language needs", () => {
    pluralsCover("en", DICTS.en, "en");
    pluralsCover("ar", DICTS.ar, "ar");
    pluralsCover("fr", DICTS.fr, "fr");
  });
});

describe("staff catalogue (business app, barber mode)", () => {
  it("every language matches English key for key", () => {
    for (const [lang, dict] of Object.entries(STAFF_DICTS)) sameShape(lang, staffEn, dict);
  });
  it("has every plural form each language needs", () => {
    for (const [lang, dict] of Object.entries(STAFF_DICTS)) pluralsCover(lang, dict, lang);
  });
  it("has no keys that nothing uses", () => {
    const files = import.meta.glob(["../**/*.{ts,tsx}", "!../**/*.test.ts", "!../app/locales/**"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
    const source = Object.values(files).join("\n");
    // stored data values are looked up by prefix: t(`status.${b.status}`), label("tag", x)
    const dynamic = /^(status|source|via|method|role|category|tag|lang|refund|expense|leave|country|accent)\./;
    const unused = Object.keys(staffEn).filter((k) => !dynamic.test(k) && !source.includes(`"${k}"`));
    expect(unused).toEqual([]);
  });
});

describe("plural forms", () => {
  const minutes: Plural = { one: "دقيقة واحدة", two: "دقيقتان", few: "{n} دقائق", many: "{n} دقيقة", other: "{n} دقيقة" };
  it("picks the Arabic form for each count", () => {
    expect(pluralForm(minutes, 1, "ar")).toBe("دقيقة واحدة");
    expect(pluralForm(minutes, 2, "ar")).toBe("دقيقتان");
    expect(fill(pluralForm(minutes, 5, "ar"), { n: 5 })).toBe("5 دقائق");
    expect(fill(pluralForm(minutes, 15, "ar"), { n: 15 })).toBe("15 دقيقة");
  });
  it("uses the zero form when there is one", () => {
    expect(pluralForm({ zero: "No one", one: "{n} person", other: "{n} people" }, 0, "en")).toBe("No one");
    expect(pluralForm({ one: "{n} person", other: "{n} people" }, 0, "en")).toBe("{n} people");
  });
  it("leaves unknown placeholders visible", () => {
    expect(fill("Hi {name}, {missing}", { name: "Omar" })).toBe("Hi Omar, {missing}");
  });
});
