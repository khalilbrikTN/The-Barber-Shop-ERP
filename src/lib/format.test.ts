import { describe, expect, it } from "vitest";
import { minorDigits, minutesInZone, toMinor } from "./format";
import { parseCsv } from "./csv";

describe("money", () => {
  it("knows each currency's minor units", () => {
    expect(minorDigits("EUR")).toBe(2);
    expect(minorDigits("EGP")).toBe(2);
    expect(minorDigits("TND")).toBe(3);
  });

  it("converts to minor units without float drift", () => {
    expect(toMinor(25, "TND")).toBe(25000);
    expect(toMinor(19.99, "EUR")).toBe(1999);
    expect(toMinor(0.1 + 0.2, "EUR")).toBe(30);
  });
});

describe("time zones", () => {
  it("reads wall-clock minutes in the shop's zone", () => {
    expect(minutesInZone("2026-12-12T10:42:00+02:00", "Africa/Cairo")).toBe(10 * 60 + 42);
    expect(minutesInZone("2026-12-12T10:42:00+02:00", "Europe/Rome")).toBe(9 * 60 + 42);
  });

  it("keeps a 09:00 shop at 09:00 across the European clock change", () => {
    // Berlin is UTC+2 in summer and UTC+1 in winter
    expect(minutesInZone("2026-07-01T07:00:00Z", "Europe/Berlin")).toBe(9 * 60);
    expect(minutesInZone("2026-12-01T08:00:00Z", "Europe/Berlin")).toBe(9 * 60);
  });
});

describe("parseCsv", () => {
  it("reads quoted fields, commas inside quotes and doubled quotes", () => {
    const rows = parseCsv('Name,Phone,Notes\n"Fathy, Karim",+20 100,"Says ""short"""\nMona,+20 200,\n');
    expect(rows).toEqual([
      ["Name", "Phone", "Notes"],
      ["Fathy, Karim", "+20 100", 'Says "short"'],
      ["Mona", "+20 200", ""],
    ]);
  });

  it("reads semicolon files from European spreadsheets", () => {
    expect(parseCsv("Nome;Telefono\nGiulia;+39 333\r\n")).toEqual([
      ["Nome", "Telefono"],
      ["Giulia", "+39 333"],
    ]);
  });

  it("skips blank lines", () => {
    expect(parseCsv("a,b\n\n1,2\n\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});
