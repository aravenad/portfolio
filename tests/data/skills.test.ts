import { readdirSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { softSkills, technicalSkills } from "../../src/data/skills";
import type { Skill } from "../../src/types";

const require = createRequire(import.meta.url);

/** Les slugs publiés par le paquet simple-icons installé. */
const simpleIcons = new Set(
  Object.keys(require("@iconify-json/simple-icons/icons.json").icons),
);

/** Les SVG déposés dans src/icons, référencés sans préfixe. */
const localIcons = new Set(
  readdirSync(new URL("../../src/icons", import.meta.url))
    .filter((file) => file.endsWith(".svg"))
    .map((file) => file.replace(/\.svg$/, "")),
);

const allSkills: Skill[] = [...technicalSkills, ...softSkills];

/** Luminance relative sRGB, définition WCAG. */
function luminance(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel((value >> 16) & 255) +
    0.7152 * channel((value >> 8) & 255) +
    0.0722 * channel(value & 255)
  );
}

function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Le fond réel d'une tuile : zinc-800 à 50 % puis zinc-900 à 60 %, sur la page
 * noire. Le haut du dégradé est le cas le plus défavorable pour une couleur
 * sombre, c'est donc lui qu'on mesure.
 */
const TILE_BACKGROUND = "#141415";

describe("compétences techniques", () => {
  it("n'affiche jamais deux fois le même libellé", () => {
    const labels = technicalSkills.map((skill) => skill.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("donne une icône ou un repli textuel à chaque tuile", () => {
    // Sans l'un des deux, la tuile serait un carré vide.
    for (const skill of technicalSkills) {
      expect(skill.icon ?? skill.short ?? skill.label, skill.label).toBeTruthy();
    }
  });

  it("ne référence que des icônes qui existent", () => {
    for (const skill of technicalSkills) {
      if (!skill.icon) continue;

      if (skill.icon.startsWith("simple-icons:")) {
        const slug = skill.icon.slice("simple-icons:".length);
        expect(simpleIcons.has(slug), `simple-icons ne publie pas « ${slug} »`).toBe(true);
      } else {
        expect(localIcons.has(skill.icon), `src/icons/${skill.icon}.svg est introuvable`)
          .toBe(true);
      }
    }
  });

  it("écrit les couleurs en hexadécimal à six chiffres, en capitales", () => {
    for (const skill of technicalSkills) {
      for (const color of [skill.color, skill.color2]) {
        if (color) expect(color, skill.label).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it("garde le logo lisible sur la tuile une fois teinté", () => {
    // WCAG 1.4.11 : 3:1 pour un objet graphique. Un hex de marque très sombre —
    // le cas d'OpenJDK, de GitHub ou de JetBrains — doit être adapté avant
    // d'entrer ici, sinon le survol efface le logo au lieu de le révéler.
    for (const skill of technicalSkills) {
      for (const color of [skill.color, skill.color2]) {
        if (!color) continue;

        expect(
          contrast(color, TILE_BACKGROUND),
          `${skill.label} : ${color} sur ${TILE_BACKGROUND}`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("ne pose une seconde couleur que sur un logo qui en a déjà une", () => {
    // `--logo-accent` seul n'allumerait qu'une moitié du dessin.
    for (const skill of technicalSkills) {
      if (skill.color2) expect(skill.color, skill.label).toBeTruthy();
    }
  });

  it("ne corrige le poids optique que d'un vrai logo", () => {
    // `lineArt` agit sur `.skill-icon` : sans icône, la règle ne vise rien.
    for (const skill of technicalSkills) {
      if (skill.lineArt) expect(skill.icon, skill.label).toBeTruthy();
    }
  });

  it("garde les abréviations courtes et différentes du libellé", () => {
    for (const skill of technicalSkills) {
      if (!skill.short) continue;

      expect(skill.short.length, skill.label).toBeGreaterThanOrEqual(2);
      expect(skill.short.length, skill.label).toBeLessThanOrEqual(4);
      expect(skill.short).not.toBe(skill.label);
    }
  });
});

describe("compétences transversales", () => {
  it("n'affiche jamais deux fois le même libellé", () => {
    const labels = softSkills.map((skill) => skill.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("accompagne chaque libellé d'une précision", () => {
    // La variante liste n'a que ça à montrer : un libellé nu y sonne creux.
    for (const skill of softSkills) {
      expect(skill.detail, skill.label).toBeTruthy();
    }
  });

  it("se passe d'icône et de couleur", () => {
    for (const skill of softSkills) {
      expect(skill.icon, skill.label).toBeUndefined();
      expect(skill.color, skill.label).toBeUndefined();
    }
  });
});

describe("toutes compétences", () => {
  it("n'a ni libellé vide ni espace parasite", () => {
    for (const skill of allSkills) {
      expect(skill.label).toBeTruthy();
      expect(skill.label).toBe(skill.label.trim());
    }
  });
});
