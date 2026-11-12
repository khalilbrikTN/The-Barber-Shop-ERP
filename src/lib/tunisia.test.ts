import { describe, expect, it } from "vitest";
import { canOpen } from "../app/AppShell";
import { findAccount, homeFor, slugify } from "./session";
import { formatTn, isTnMobile, samePhone, tnDigits } from "./tunisia";

describe("Tunisian mobile numbers", () => {
  it("reads the number however it was typed", () => {
    for (const raw of ["20 123 456", "20123456", "+216 20 123 456", "00216 20123456", "216-20-123-456"]) expect(tnDigits(raw)).toBe("20123456");
  });
  it("takes mobiles and refuses landlines and short numbers", () => {
    expect(["20 123 456", "50 123 456", "98 123 456", "44 123 456"].every(isTnMobile)).toBe(true);
    expect(["71 123 456", "2012345", "20 123 4567", ""].some(isTnMobile)).toBe(false);
  });
  it("writes it the same way everywhere", () => {
    expect(formatTn("20123456")).toBe("+216 20 123 456");
    expect(samePhone("+216 20 000 001", "20000001")).toBe(true);
  });
});

describe("signing in", () => {
  it("finds the sample team by phone or email", () => {
    expect(findAccount("phone", "20 000 002")?.userId).toBe("mehdi");
    expect(findAccount("email", "Karim@Barbier-Exemple.tn")?.role).toBe("Owner");
    expect(findAccount("phone", "29 999 999")).toBeUndefined();
  });
  it("sends barbers to their phone view and everyone else to Today", () => {
    expect(homeFor("Barber")).toBe("/me");
    expect(homeFor("Front desk")).toBe("/app");
  });
  it("opens each screen only to the roles allowed it", () => {
    expect(canOpen("Owner", "/app/settings")).toBe(true);
    expect(canOpen("Front desk", "/app/money")).toBe(true);
    expect(canOpen("Front desk", "/app/settings")).toBe(false);
    expect(canOpen("Barber", "/app/money")).toBe(false);
    expect(canOpen("Barber", "/app/clients/c1")).toBe(true);
    expect(canOpen("Barber", "/app/compte")).toBe(true);
  });
  it("makes a web address from the salon name", () => {
    expect(slugify("Barbier Exemple")).toBe("barbier-exemple");
    expect(slugify("Salon Gabès & Fils")).toBe("salon-gabes-fils");
    expect(slugify("صالون")).toBe("mon-salon");
  });
});
