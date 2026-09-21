import { describe, expect, it } from "vitest";

import { navLinks, site, socialLinks } from "../../src/data/site";

describe("informations du site", () => {
  it("renseigne les champs repris dans les métadonnées", () => {
    for (const key of ["name", "author", "title", "description", "email"] as const) {
      expect(site[key], key).toBeTruthy();
    }
  });

  it("garde une description assez longue pour LinkedIn et assez courte pour Google", () => {
    // LinkedIn tronque ou ignore en dessous de 100 caractères ; les résultats de
    // recherche coupent au-delà de 160.
    expect(site.description.length).toBeGreaterThanOrEqual(100);
    expect(site.description.length).toBeLessThanOrEqual(170);
  });

  it("écrit une adresse e-mail plausible", () => {
    expect(site.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });

  it("ne pointe vers l'extérieur qu'en HTTPS", () => {
    for (const url of [site.github, site.linkedin]) {
      expect(new URL(url).protocol).toBe("https:");
    }
  });
});

describe("navigation principale", () => {
  it("n'a ni libellé ni destination en double", () => {
    expect(new Set(navLinks.map((link) => link.label)).size).toBe(navLinks.length);
    expect(new Set(navLinks.map((link) => link.href)).size).toBe(navLinks.length);
  });

  it("ne contient que des liens internes", () => {
    // Un lien externe casserait le calcul d'`aria-current` du header, qui
    // compare des chemins.
    for (const link of navLinks) {
      expect(link.href, link.label).toMatch(/^\//);
    }
  });

  it("rattache chaque lien à au moins une section de l'accueil", () => {
    // C'est cette liste que lit le scroll-spy : sans elle, le lien ne s'allume
    // jamais au défilement.
    for (const link of navLinks) {
      expect(link.sections?.length, link.label).toBeGreaterThan(0);
    }
  });

  it("n'attribue jamais la même section à deux liens", () => {
    // Deux liens allumés en même temps : le surlignage devient illisible.
    const sections = navLinks.flatMap((link) => link.sections ?? []);
    expect(new Set(sections).size).toBe(sections.length);
  });
});

describe("liens sociaux", () => {
  it("nomme chaque destination", () => {
    for (const link of socialLinks) expect(link.label).toBeTruthy();
  });

  it("n'emploie que https et mailto", () => {
    for (const link of socialLinks) {
      expect(link.href, link.label).toMatch(/^(https:\/\/|mailto:)/);
    }
  });

  it("reprend les adresses déclarées une seule fois dans `site`", () => {
    // Recopier une URL, c'est se garantir d'en oublier une le jour d'un
    // changement de pseudo.
    expect(socialLinks.map((link) => link.href)).toContain(site.github);
    expect(socialLinks.map((link) => link.href)).toContain(site.linkedin);
    expect(socialLinks.map((link) => link.href)).toContain(`mailto:${site.email}`);
  });
});
