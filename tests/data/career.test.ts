import { describe, expect, it } from "vitest";

import { education, experiences } from "../../src/data/career";
import type { CareerEntry } from "../../src/types";

/**
 * Le format des périodes est une convention écrite en tête de `career.ts`, que
 * rien ne vérifiait : l'espace insécable et le tiret demi-cadratin sont
 * invisibles dans l'éditeur, et la capitalisation l'est à l'écran puisque
 * CareerItem rend les périodes en `uppercase`. Une entrée ajoutée à la main
 * pouvait donc violer les cinq règles sans que personne ne le remarque.
 *
 * Ces tests sont la convention rendue exécutable.
 */

const NBSP = " ";
const EN_DASH = "–";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

interface Endpoint {
  month: number;
  year?: number;
}

/** Une date d'une période : « juin » seul, ou « juin<NBSP>2026 ». */
function parseEndpoint(text: string): Endpoint {
  const match = text.match(new RegExp(`^(\\p{L}+)(?:${NBSP}(\\d{4}))?$`, "u"));
  expect(match, `« ${visible(text)} » n'est pas une date « mois${NBSP}année »`).not.toBeNull();

  const [, month, year] = match!;
  const index = MONTHS.indexOf(month.toLowerCase());
  expect(index, `« ${month} » n'est pas un mois français`).toBeGreaterThanOrEqual(0);

  return { month: index, year: year ? Number(year) : undefined };
}

function parsePeriod(period: string) {
  const parts = period.split(` ${EN_DASH} `);
  expect(parts.length, `« ${visible(period)} » : une période a au plus deux dates`)
    .toBeLessThanOrEqual(2);

  return parts.map(parseEndpoint);
}

/** Rend les caractères invisibles lisibles dans un message d'échec. */
function visible(text: string) {
  return text.replace(/ /g, "␣").replace(/–/g, "–");
}

/** Toutes les périodes du parcours, entrées et postes confondus. */
function allPeriods(): { where: string; period: string }[] {
  const entries: CareerEntry[] = [...experiences, ...education];

  return entries.flatMap((entry) => [
    { where: entry.organization, period: entry.period },
    ...(entry.roles ?? []).map((role) => ({
      where: `${entry.organization} → ${role.title}`,
      period: role.period,
    })),
  ]);
}

describe.each(allPeriods())("période de $where", ({ period }) => {
  it("n'utilise jamais le trait d'union ni le tiret cadratin comme séparateur", () => {
    expect(period).not.toMatch(/ [-—] /);
  });

  it("entoure le tiret demi-cadratin d'espaces normales", () => {
    // Une insécable autour du tiret empêcherait la ligne de se couper là — le
    // seul endroit où elle a le droit de le faire.
    expect(period).not.toMatch(new RegExp(`${NBSP}${EN_DASH}|${EN_DASH}${NBSP}`));
  });

  it("lie le mois à son année par une espace insécable", () => {
    expect(period, visible(period)).not.toMatch(/\p{L} \d{4}/u);
  });

  it("ne laisse pas d'espace en trop", () => {
    expect(period).toBe(period.trim());
    expect(period).not.toMatch(/ {2}/);
  });

  it("met une capitale au premier mois et à lui seul", () => {
    const [first, ...rest] = period.split(` ${EN_DASH} `);
    expect(first[0]).toBe(first[0].toUpperCase());
    for (const part of rest) {
      expect(part[0], `« ${part} » doit rester en minuscule`).toBe(part[0].toLowerCase());
    }
  });

  it("est formée de mois français suivis d'une année à quatre chiffres", () => {
    parsePeriod(period);
  });

  it("ne répète l'année que si elle change", () => {
    const [start, end] = parsePeriod(period);
    if (!end) {
      expect(start.year, "une date seule porte toujours son année").toBeDefined();
      return;
    }

    expect(end.year, "la date de fin porte toujours son année").toBeDefined();
    if (start.year !== undefined) {
      expect(start.year, "année répétée alors qu'elle ne change pas").not.toBe(end.year);
    }
  });

  it("ne se termine pas avant d'avoir commencé", () => {
    const [start, end] = parsePeriod(period);
    if (!end) return;

    const startYear = start.year ?? end.year!;
    expect(
      startYear * 12 + start.month,
      `${visible(period)} : la fin précède le début`,
    ).toBeLessThanOrEqual(end.year! * 12 + end.month);
  });
});

describe("cohérence du parcours", () => {
  const entries: CareerEntry[] = [...experiences, ...education];

  it("renseigne une organisation et une période partout", () => {
    for (const entry of entries) {
      expect(entry.organization).toBeTruthy();
      expect(entry.period).toBeTruthy();
    }
  });

  it("donne à chaque entrée de quoi se dessiner une pastille", () => {
    // CareerItem tombe sur un carré vide si les trois champs manquent.
    for (const entry of entries) {
      expect(
        entry.logo ?? entry.icon ?? entry.initials,
        `${entry.organization} n'a ni logo, ni icône, ni initiales`,
      ).toBeTruthy();
    }
  });

  it("garde les initiales assez courtes pour tenir dans la pastille", () => {
    // La pastille fait 48 px moins 8 px de marge, en mono 0,7 rem : « IUT2 »
    // remplit la largeur, un cinquième caractère déborderait.
    for (const entry of entries) {
      if (entry.initials) {
        expect(entry.initials.length, `« ${entry.initials} » est trop long`)
          .toBeLessThanOrEqual(4);
      }
    }
  });

  it("contient les postes d'une entrée dans la période de cette entrée", () => {
    for (const entry of entries) {
      if (!entry.roles?.length) continue;

      const [start, end] = parsePeriod(entry.period);
      const from = (start.year ?? end?.year)! * 12 + start.month;
      const to = end ? end.year! * 12 + end.month : from;

      for (const role of entry.roles) {
        const [roleStart, roleEnd] = parsePeriod(role.period);
        const roleFrom = (roleStart.year ?? roleEnd?.year)! * 12 + roleStart.month;
        const roleTo = roleEnd ? roleEnd.year! * 12 + roleEnd.month : roleFrom;

        expect(roleFrom, `${role.title} commence avant ${entry.organization}`)
          .toBeGreaterThanOrEqual(from);
        expect(roleTo, `${role.title} finit après ${entry.organization}`).toBeLessThanOrEqual(to);
      }
    }
  });

  it("présente les postes du plus récent au plus ancien", () => {
    for (const entry of entries) {
      if (!entry.roles?.length) continue;

      const starts = entry.roles.map((role) => {
        const [start, end] = parsePeriod(role.period);
        return (start.year ?? end?.year)! * 12 + start.month;
      });

      expect(starts, `${entry.organization} : postes dans le désordre`)
        .toEqual([...starts].sort((a, b) => b - a));
    }
  });

  it("titre l'entrée elle-même quand elle n'a pas de postes", () => {
    // Sans `title` ni `roles`, l'organisation sert de titre : acceptable pour une
    // formation, pas pour une expérience, qui doit dire ce qu'on y a fait.
    for (const entry of experiences) {
      expect(
        entry.title ?? entry.roles?.length,
        `${entry.organization} n'annonce aucun intitulé de poste`,
      ).toBeTruthy();
    }
  });

  it("liste les expériences et les formations de la plus récente à la plus ancienne", () => {
    for (const group of [experiences, education]) {
      const starts = group.map((entry) => {
        const [start, end] = parsePeriod(entry.period);
        return (start.year ?? end?.year)! * 12 + start.month;
      });

      expect(starts).toEqual([...starts].sort((a, b) => b - a));
    }
  });
});
