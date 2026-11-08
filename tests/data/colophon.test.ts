import { describe, expect, it } from "vitest";

import { colophon, colophonEn } from "../../src/data/colophon";
import { LIMITS } from "../../tools/budget/budget.mjs";

/**
 * « Comment ce site est fait » existe en deux langues, écrites à la main : ces
 * tests signalent une version anglaise qui ne suit plus la française, et un
 * plafond du budget relevé sans que la page le dise.
 */

describe("comment ce site est fait", () => {
  it("a les mêmes parties dans les deux langues, aux mêmes ancres", () => {
    expect(colophonEn.sections.map((section) => section.id)).toEqual(colophon.sections.map((section) => section.id));
  });

  it("garde en anglais la forme de chaque partie : paragraphes, tableau, remarque", () => {
    colophon.sections.forEach((section, index) => {
      const en = colophonEn.sections[index];
      expect(en.paragraphs.length, section.id).toBe(section.paragraphs.length);
      expect(en.table?.rows.length, section.id).toBe(section.table?.rows.length);
      expect(Boolean(en.note), section.id).toBe(Boolean(section.note));
    });
  });

  it("n'a pas deux parties à la même ancre", () => {
    const ids = colophon.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("annonce les plafonds que la CI applique vraiment", () => {
    const budget = colophon.sections.find((section) => section.id === "colophon-budget")?.table;
    // Les chiffres et leur unité sont liés par une espace insécable.
    const caps = (budget?.rows.map((row) => row.to).join(" ") ?? "").replace(/[  ]/g, " ");

    for (const [key, bytes] of Object.entries(LIMITS)) {
      expect(caps, key).toContain(`${bytes / 1024} Ko`);
    }
  });

  it("décrit la page en moins de 170 caractères, pour les moteurs", () => {
    for (const { metaDescription } of [colophon, colophonEn]) {
      expect(metaDescription.length).toBeLessThanOrEqual(170);
    }
  });
});
