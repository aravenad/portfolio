import { describe, expect, it } from "vitest";

import {
  applyFilters,
  countLabel,
  filtersQuery,
  isActive,
  matches,
  parseFilters,
  type FilterItem,
  type ProjectFilters,
} from "../../src/lib/project-filters";

const none: ProjectFilters = { status: "", kind: "", competence: "", tag: "" };

/** Une carte de la liste, réduite à ce que le filtrage lit. */
function item(dataset: Record<string, string>, hidden = false): FilterItem {
  return { dataset: dataset as DOMStringMap, hidden };
}

describe("parseFilters / filtersQuery", () => {
  it("lit les quatre critères de l'adresse et ignore le reste", () => {
    expect(parseFilters("?kind=web-app&competence=optimiser&tag=Java&page=2")).toEqual({
      status: "",
      kind: "web-app",
      competence: "optimiser",
      tag: "Java",
    });
  });

  it("ne lit rien d'une adresse sans filtre", () => {
    expect(parseFilters("")).toEqual(none);
  });

  it("écrit seulement les critères choisis, encodés", () => {
    expect(filtersQuery({ status: "termine", kind: "game", competence: "", tag: "C#" })).toBe(
      "?status=termine&kind=game&tag=C%23",
    );
  });

  it("n'écrit rien sans filtre, pour revenir à l'adresse nue", () => {
    expect(filtersQuery(none)).toBe("");
  });

  it("relit ce qu'elle a écrit", () => {
    const filters = { status: "en-cours", kind: "web-app", competence: "gerer", tag: "R Markdown" };
    expect(parseFilters(filtersQuery(filters))).toEqual(filters);
  });
});

describe("isActive", () => {
  it("est faux sans critère, vrai dès le premier", () => {
    expect(isActive(none)).toBe(false);
    expect(isActive({ ...none, tag: "PHP" })).toBe(true);
  });
});

describe("matches", () => {
  const card = item({
    status: "termine",
    kind: "web-app",
    competences: "realiser optimiser",
    tags: "Java|R Markdown",
  });

  it("garde une carte qui répond à chaque critère", () => {
    expect(
      matches(card, { status: "termine", kind: "web-app", competence: "optimiser", tag: "Java" }),
    ).toBe(true);
  });

  it("écarte une carte qui manque un seul critère", () => {
    expect(matches(card, { ...none, status: "en-cours" })).toBe(false);
    expect(matches(card, { ...none, kind: "game" })).toBe(false);
    expect(matches(card, { ...none, competence: "gerer" })).toBe(false);
    expect(matches(card, { ...none, tag: "PHP" })).toBe(false);
  });

  it("compare les étiquettes entières, espaces compris", () => {
    expect(matches(card, { ...none, tag: "R Markdown" })).toBe(true);
    expect(matches(card, { ...none, tag: "R" })).toBe(false);
  });

  it("écarte une carte sans compétence ni étiquette dès qu'on en demande une", () => {
    const bare = item({ status: "termine" });
    expect(matches(bare, { ...none, kind: "web-app" })).toBe(false);
    expect(matches(bare, { ...none, competence: "realiser" })).toBe(false);
    expect(matches(bare, { ...none, tag: "Java" })).toBe(false);
    expect(matches(bare, none)).toBe(true);
  });
});

describe("applyFilters", () => {
  const list = () => [
    item({ status: "termine", tags: "Java" }),
    item({ status: "en-cours", tags: "PHP" }),
    item({ status: "termine", tags: "PHP", offPage: "" }, true),
  ];

  it("sans filtre, montre la page et rien d'autre", () => {
    const items = list();
    expect(applyFilters(items, none)).toBe(2);
    expect(items.map((i) => i.hidden)).toEqual([false, false, true]);
  });

  it("filtré, cherche aussi dans les autres pages", () => {
    const items = list();
    expect(applyFilters(items, { ...none, tag: "PHP" })).toBe(2);
    expect(items.map((i) => i.hidden)).toEqual([true, false, false]);
  });

  it("revient à la page quand on efface les filtres", () => {
    const items = list();
    applyFilters(items, { ...none, status: "termine" });
    applyFilters(items, none);
    expect(items.map((i) => i.hidden)).toEqual([false, false, true]);
  });

  it("compte zéro quand rien ne répond", () => {
    const items = list();
    expect(applyFilters(items, { ...none, tag: "Rust" })).toBe(0);
    expect(items.every((i) => i.hidden)).toBe(true);
  });
});

describe("countLabel", () => {
  const fr = { one: "{count} projet sur {total}", other: "{count} projets sur {total}" };
  const en = { one: "{count} project of {total}", other: "{count} projects of {total}" };

  it("accorde selon la langue", () => {
    expect(countLabel(3, 11, fr, "fr")).toBe("3 projets sur 11");
    expect(countLabel(1, 11, fr, "fr")).toBe("1 projet sur 11");
    expect(countLabel(1, 11, en, "en")).toBe("1 project of 11");
    expect(countLabel(3, 11, en, "en")).toBe("3 projects of 11");
  });

  // En français, zéro est au singulier ; en anglais, au pluriel.
  it("met zéro au singulier en français, au pluriel en anglais", () => {
    expect(countLabel(0, 11, fr, "fr")).toBe("0 projet sur 11");
    expect(countLabel(0, 11, en, "en")).toBe("0 projects of 11");
  });
});
