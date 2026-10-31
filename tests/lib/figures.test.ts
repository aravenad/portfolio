import { describe, expect, it } from "vitest";

import { satteriFigures } from "../../src/lib/figures";

describe("satteriFigures", () => {
  const visitor = satteriFigures.element as {
    filter: string[];
    visit: (node: unknown, ctx: unknown) => void;
  };

  const image = (properties: Record<string, unknown>) => ({
    type: "element",
    tagName: "img",
    properties: { src: "accueil.webp", alt: "Page d'accueil", ...properties },
    children: [],
  });

  /** Un contexte Sätteri réduit à ce que le plugin appelle. */
  function visit(children: unknown[]) {
    const replaced: unknown[] = [];
    const ctx = { replaceNode: (_node: unknown, node: unknown) => replaced.push(node) };
    visitor.visit({ type: "element", tagName: "p", properties: {}, children }, ctx);
    return replaced[0] as
      | { tagName: string; children: { tagName: string; properties: object; children: { value: string }[] }[] }
      | undefined;
  }

  it("ne visite que les paragraphes", () => {
    expect(visitor.filter).toEqual(["p"]);
  });

  it("fait d'une image titrée une figure, le titre en légende", () => {
    const figure = visit([image({ title: "L'accueil de la démo" })]);

    expect(figure?.tagName).toBe("figure");
    const [img, caption] = figure!.children;
    expect(img.tagName).toBe("img");
    expect(img.properties).toEqual({ src: "accueil.webp", alt: "Page d'accueil" });
    expect(caption.tagName).toBe("figcaption");
    expect(caption.children[0].value).toBe("L’accueil de la démo");
  });

  it("donne à la légende les espaces insécables du reste de la fiche", () => {
    const figure = visit([image({ title: "La réservation : l'API vérifie le prix" })]);

    expect(figure!.children[1].children[0].value).toBe("La réservation : l’API vérifie le prix");
  });

  it("ignore les blancs autour de l'image", () => {
    expect(visit([{ type: "text", value: "\n" }, image({ title: "Légende" })])?.tagName).toBe("figure");
  });

  it("laisse une image sans titre, ou prise dans une phrase", () => {
    expect(visit([image({})])).toBeUndefined();
    expect(visit([image({ title: "  " })])).toBeUndefined();
    expect(visit([{ type: "text", value: "Voir " }, image({ title: "Légende" })])).toBeUndefined();
  });
});
