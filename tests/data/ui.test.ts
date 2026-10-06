import { describe, expect, it } from "vitest";

import { ui, useTranslations } from "../../src/data/ui";
import { languages } from "../../src/lib/i18n";

/**
 * Les chemins de toutes les feuilles d'un dictionnaire : « header.navLabel »…
 * Les fonctions (textes à trous) comptent comme des feuilles.
 */
function leaves(value: unknown, path = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      leaves(child, path ? `${path}.${key}` : key),
    );
  }

  return [path];
}

/** Toutes les chaînes d'un dictionnaire, textes à trous remplis. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String(value(2, 3))];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("textes de l'interface", () => {
  it("a un dictionnaire par langue", () => {
    expect(Object.keys(ui).sort()).toEqual([...languages].sort());
  });

  it("traduit exactement les mêmes textes dans chaque langue", () => {
    // TypeScript l'impose déjà ; ce test le garde si le typage est un jour relâché.
    expect(leaves(ui.en)).toEqual(leaves(ui.fr));
  });

  it("garde autant de paragraphes dans chaque langue", () => {
    for (const block of ["technical", "soft"] as const) {
      expect(ui.en.skills[block].paragraphs).toHaveLength(ui.fr.skills[block].paragraphs.length);
    }
  });

  it.each(languages)("n'a aucun texte vide ni d'espace parasite (%s)", (lang) => {
    for (const text of strings(ui[lang])) {
      expect(text.trim(), JSON.stringify(text)).toBe(text);
      expect(text).not.toBe("");
    }
  });

  it.each(languages)(
    "garde une description assez longue pour LinkedIn et assez courte pour Google (%s)",
    (lang) => {
      const { description } = ui[lang].meta;

      expect(description.length).toBeGreaterThanOrEqual(100);
      expect(description.length).toBeLessThanOrEqual(170);
    },
  );

  it("nomme les trois statuts du schéma, sans clé morte", () => {
    for (const lang of languages) {
      expect(Object.keys(ui[lang].projects.status).sort()).toEqual([
        "a-venir",
        "en-cours",
        "termine",
      ]);
    }
  });

  it("déclare une langue et une locale cohérentes", () => {
    for (const lang of languages) {
      expect(ui[lang].htmlLang).toBe(lang);
      expect(ui[lang].ogLocale.startsWith(`${lang}_`)).toBe(true);
    }
  });

  it("lie la ponctuation double au mot qui la précède dans les mentions légales", () => {
    // En français, une espace précède « ; : ? ! ». Normale, elle laissait le
    // signe partir seul en début de ligne sur téléphone (« respectifs / ; ils »).
    for (const text of strings(ui.fr.legal)) {
      expect(text, text).not.toMatch(/ [;:?!]/);
    }
  });

  it("propose toujours l'autre langue dans le header", () => {
    expect(useTranslations("fr").header.otherLang.short).toBe("EN");
    expect(useTranslations("en").header.otherLang.short).toBe("FR");
  });
});
