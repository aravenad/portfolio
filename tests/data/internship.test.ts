import { describe, expect, it } from "vitest";
import { formatDay, internship, internshipDates } from "../../src/data/internship";
import { ui } from "../../src/data/ui";

const NBSP = " ";

describe("internship", () => {
  it("écrit les dates à la française et à l'anglaise, en espaces insécables", () => {
    expect(formatDay("2027-04-19", "fr")).toBe(`19${NBSP}avril`);
    expect(formatDay("2027-06-25", "fr", true)).toBe(`25${NBSP}juin${NBSP}2027`);
    expect(formatDay("2027-04-19", "en")).toBe(`April${NBSP}19`);
    expect(formatDay("2027-06-25", "en", true)).toBe(`June${NBSP}25,${NBSP}2027`);
  });

  it("garde la fin du stage après son début, et la prolongation après la fin", () => {
    expect(internship.start < internship.end).toBe(true);
    expect(internship.end < internship.extendedTo).toBe(true);
  });

  it("donne les mêmes dates au hero et au contact", () => {
    for (const lang of ["fr", "en"] as const) {
      const { start, end } = internshipDates(lang);
      expect(ui[lang].hero.availability).toContain(start);
      expect(ui[lang].hero.availability).toContain(end);
      expect(ui[lang].contact.description).toContain(start);
      expect(ui[lang].contact.description).toContain(end);
    }
  });
});
