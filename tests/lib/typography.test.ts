import { describe, expect, it } from "vitest";

import { frenchSpacing, satteriFrenchSpacing, withFrenchSpacing } from "../../src/lib/typography";

const NBSP = " ";

describe("frenchSpacing", () => {
  it("rend insécable l'espace devant ; : ? !", () => {
    expect(frenchSpacing("Une question ? Écris-moi ! Voici : un ; deux")).toBe(
      `Une question${NBSP}? Écris-moi${NBSP}! Voici${NBSP}: un${NBSP}; deux`,
    );
  });

  it("colle les guillemets français à leur contenu", () => {
    expect(frenchSpacing("« Lire la suite »")).toBe(`«${NBSP}Lire la suite${NBSP}»`);
  });

  it("couvre une espace en tête de texte, celle qui suit un **gras** en Markdown", () => {
    // « **Apache** : installation » : le nœud de texte commence par l'espace.
    expect(frenchSpacing(" : installation")).toBe(`${NBSP}: installation`);
  });

  it("laisse intacts l'anglais, les URL et les heures", () => {
    for (const text of ["Hi: see https://example.com/?a=1", "12:30", "Why? Because!"]) {
      expect(frenchSpacing(text)).toBe(text);
    }
  });

  it("ne change rien à un texte déjà corrigé", () => {
    const once = frenchSpacing("Recherche : stage ?");
    expect(frenchSpacing(once)).toBe(once);
  });
});

describe("withFrenchSpacing", () => {
  it("corrige toutes les chaînes d'une structure, à toute profondeur", () => {
    const data = withFrenchSpacing({ a: "un : deux", list: ["trois ?", { b: "quatre !" }] });

    expect(data).toEqual({
      a: `un${NBSP}: deux`,
      list: [`trois${NBSP}?`, { b: `quatre${NBSP}!` }],
    });
  });

  it("corrige le résultat des textes à trous, à chaque appel", () => {
    const pageOf = withFrenchSpacing((page: number, total: number) => `Page ${page} : ${total}`);
    expect(pageOf(2, 3)).toBe(`Page 2${NBSP}: 3`);
  });

  it("laisse passer ce qui n'est pas du texte", () => {
    expect(withFrenchSpacing({ n: 2, ok: true, none: undefined })).toEqual({
      n: 2,
      ok: true,
      none: undefined,
    });
  });
});

describe("satteriFrenchSpacing", () => {
  /** Un contexte Sätteri réduit à ce que le plugin appelle. */
  function visit(value: string) {
    const calls: unknown[][] = [];
    const ctx = { setProperty: (...args: unknown[]) => calls.push(args) };
    const node = { type: "text", value };

    satteriFrenchSpacing.text!(node as never, ctx as never);
    return { node, calls };
  }

  it("réécrit un nœud de texte qui en a besoin", () => {
    const { node, calls } = visit("Phase 1 : analyse");
    expect(calls).toEqual([[node, "value", `Phase 1${NBSP}: analyse`]]);
  });

  it("ne touche pas un nœud déjà correct", () => {
    // Chaque réécriture passe par le moteur natif : autant ne rien envoyer.
    expect(visit("Phase one: analysis").calls).toEqual([]);
  });
});
