import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { projectCard } from "../../src/lib/og";

/**
 * Les cartes d'aperçu ne sont pas construites par le build : `npm run og` les
 * rend dans un navigateur, et elles sont versionnées avec le reste. Rien ne
 * rappelle donc de les refaire en ajoutant un projet, sinon ces tests.
 */
const CONTENT = fileURLToPath(new URL("../../src/content/projects", import.meta.url));
const CARDS = fileURLToPath(new URL("../../src/assets/og", import.meta.url));

const slugs = (directory: string, extension: string) =>
  readdirSync(directory)
    .filter((file) => file.endsWith(extension))
    .map((file) => file.slice(0, -extension.length))
    .sort();

const fiches = { fr: slugs(CONTENT, ".md"), en: slugs(join(CONTENT, "en"), ".md") } as const;

describe.each(["fr", "en"] as const)("cartes d'aperçu (%s)", (lang) => {
  it.each(fiches[lang])("%s a la sienne, à la taille de l'image du site", (slug) => {
    const card = projectCard(lang, slug);

    expect(card, `src/assets/og/${lang}/${slug}.jpg manque : lancer npm run og`).toBeDefined();
    // Rendue à 2× : 1200 × 630, le format des aperçus, deux fois plus net.
    expect([card!.width, card!.height]).toEqual([2400, 1260]);
    expect(card!.format).toBe("jpg");
  });

  it("n'en garde aucune d'un projet disparu ou renommé", () => {
    expect(slugs(join(CARDS, lang), ".jpg")).toEqual(fiches[lang]);
  });
});

it("ne trouve rien pour une fiche sans carte", () => {
  expect(projectCard("fr", "fiche-inconnue")).toBeUndefined();
});
