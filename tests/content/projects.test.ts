import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { load } from "js-yaml";
import { describe, expect, it, vi } from "vitest";

/**
 * Les fiches de projet sont validées au build par le schéma de
 * `content.config.ts` : un champ manquant arrête la compilation. Ces tests
 * rendent la sanction immédiate, et surtout ils vérifient ce que le schéma ne
 * peut pas dire — l'unicité des ordres, la longueur des résumés, le nombre de
 * projets mis en avant.
 *
 * Le schéma lui-même est celui du projet, pas une copie : `astro:content` est
 * remplacé par le vrai zod d'Astro, ce qui suffit à charger la configuration.
 */
vi.mock("astro:content", async () => ({
  defineCollection: (config: unknown) => config,
  z: (await import("astro/zod")).z,
}));

vi.mock("astro/loaders", () => ({ glob: () => ({}) }));

const { collections } = await import("../../src/content.config");
const schema = (collections.projects as { schema: { safeParse: (input: unknown) => { success: boolean; error?: unknown } } }).schema;

const DIRECTORY = new URL("../../src/content/projects", import.meta.url).pathname;

/** Chaque fiche du dossier, avec son en-tête YAML déjà décodé. */
const fiches = readdirSync(DIRECTORY)
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map((file) => {
    const raw = readFileSync(join(DIRECTORY, file), "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

    expect(match, `${file} n'a pas d'en-tête YAML`).not.toBeNull();

    return {
      file,
      slug: file.replace(/\.md$/, ""),
      data: load(match![1]) as Record<string, unknown>,
      body: match![2],
    };
  });

describe("fiches de projet", () => {
  it("il y en a au moins une", () => {
    expect(fiches.length).toBeGreaterThan(0);
  });

  describe.each(fiches)("$file", ({ data, slug, body }) => {
    it("satisfait le schéma de la collection", () => {
      const result = schema.safeParse(data);
      expect(result.success, JSON.stringify(result.error)).toBe(true);
    });

    it("porte un nom de fichier qui fera une URL propre", () => {
      // Le nom du fichier devient l'adresse de la fiche : ni majuscule, ni
      // accent, ni espace.
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it("tient dans une carte sans la faire déborder", () => {
      const summary = data.summary as string;

      expect(summary.length).toBeGreaterThanOrEqual(40);
      expect(summary.length).toBeLessThanOrEqual(200);
    });

    it("termine son résumé par un point", () => {
      expect(data.summary as string).toMatch(/[.!?]$/);
    });

    it("annonce au moins une technologie", () => {
      expect((data.tags as string[]).length).toBeGreaterThan(0);
    });

    it("n'annonce pas deux fois la même technologie", () => {
      const tags = data.tags as string[];
      expect(new Set(tags).size).toBe(tags.length);
    });

    it("ouvre son corps par un titre de niveau deux", () => {
      // Le h1 appartient à la page, qui affiche déjà le titre du projet.
      expect(body.trim()).toMatch(/^## /);
      expect(body).not.toMatch(/^# /m);
    });

    it("donne une année plausible", () => {
      if (data.year === undefined) return;
      expect(data.year).toBeGreaterThanOrEqual(2015);
      expect(data.year).toBeLessThanOrEqual(new Date().getFullYear() + 2);
    });
  });

  it("n'attribue jamais le même ordre à deux projets", () => {
    // Deux ordres égaux rendent le tri instable : la liste change d'un build à
    // l'autre sans que rien n'ait bougé.
    const orders = fiches.map((fiche) => fiche.data.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("n'emploie jamais deux fois le même titre", () => {
    const titles = fiches.map((fiche) => fiche.data.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("met en avant de quoi remplir l'accueil, sans le déborder", () => {
    // L'aperçu de l'accueil en affiche trois.
    const featured = fiches.filter((fiche) => fiche.data.featured);

    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.length).toBeLessThanOrEqual(6);
  });

  it("n'emploie que les statuts prévus", () => {
    for (const fiche of fiches) {
      expect(["termine", "en-cours", "a-venir"]).toContain(fiche.data.status);
    }
  });
});
