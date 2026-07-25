import { describe, expect, it } from "vitest";

import { mergeCurrencies, normalizeCurrencies } from "./currencies";

describe("normalizeCurrencies", () => {
  it("uppercases and trims currency codes", () => {
    expect(normalizeCurrencies([" xof ", "eur"])).toEqual(["XOF", "EUR"]);
  });

  it("deduplicates codes that only differ by case or whitespace", () => {
    expect(normalizeCurrencies(["XOF", "xof", " XOF "])).toEqual(["XOF"]);
  });

  it("drops empty entries", () => {
    expect(normalizeCurrencies(["XOF", "", "   "])).toEqual(["XOF"]);
  });

  it("returns an empty array for no currencies", () => {
    expect(normalizeCurrencies([])).toEqual([]);
  });
});

describe("mergeCurrencies", () => {
  it("appends the secondary currency when provided", () => {
    expect(mergeCurrencies(["XOF"], "EUR")).toEqual(["XOF", "EUR"]);
  });

  it("deduplicates when the secondary currency is already present", () => {
    expect(mergeCurrencies(["XOF", "EUR"], "xof")).toEqual(["XOF", "EUR"]);
  });

  it("ignores a null or undefined secondary currency", () => {
    expect(mergeCurrencies(["XOF"], null)).toEqual(["XOF"]);
    expect(mergeCurrencies(["XOF"], undefined)).toEqual(["XOF"]);
  });

  it("does not mutate the primary array", () => {
    const primary = ["XOF"];
    mergeCurrencies(primary, "EUR");
    expect(primary).toEqual(["XOF"]);
  });
});
