import { describe, expect, it } from "vitest";

import { isExternal, satteriExternalLinks } from "../../src/lib/external-links";

describe("isExternal", () => {
  it("reconnaît un lien vers un autre site", () => {
    expect(isExternal("https://github.com/aravenad/musigma")).toBe(true);
    expect(isExternal("http://exemple.fr")).toBe(true);
  });

  it("laisse les ancres, les pages du portfolio et les adresses e-mail", () => {
    expect(isExternal("#realisation")).toBe(false);
    expect(isExternal("/projects/stage-2027")).toBe(false);
    expect(isExternal("mailto:damien.aravena@gmail.com")).toBe(false);
    expect(isExternal(undefined)).toBe(false);
  });
});

describe("satteriExternalLinks", () => {
  const visitor = satteriExternalLinks.element as {
    filter: string[];
    visit: (node: unknown, ctx: unknown) => void;
  };

  /** Un contexte Sätteri réduit à ce que le plugin appelle. */
  function visit(
    href: string,
    {
      label = "note de cadrage",
      file = "file:///site/src/content/projects/fiche.md",
      children = [{ type: "text", value: label }] as unknown[],
    } = {},
  ) {
    const attributes: Record<string, unknown> = {};
    const appended: unknown[] = [];
    const replaced: unknown[] = [];
    const ctx = {
      fileURL: file ? new URL(file) : undefined,
      setProperty: (_node: unknown, key: string, value: unknown) => (attributes[key] = value),
      appendChild: (_node: unknown, child: unknown) => appended.push(child),
      replaceNode: (_node: unknown, nodes: unknown[]) => replaced.push(...nodes),
    };
    visitor.visit({ type: "element", tagName: "a", properties: { href }, children }, ctx);

    return { attributes, appended, replaced, text: JSON.stringify([replaced, appended]) };
  }

  it("ne visite que les liens", () => {
    expect(visitor.filter).toEqual(["a"]);
  });

  it("ouvre un lien externe dans un nouvel onglet, sans lui laisser la main sur la fiche", () => {
    expect(visit("https://github.com/aravenad/musigma").attributes).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("lui ajoute la flèche des boutons et le libellé masqué, dans la langue de la fiche", () => {
    const fr = visit("https://exemple.fr");
    expect(fr.text).toContain("M2.5 8h11M9 3.5 13.5 8 9 12.5");
    expect(fr.text).toContain("-rotate-45");
    expect(fr.text).toContain(" (nouvel onglet)");

    const en = visit("https://exemple.fr", { file: "file:///site/src/content/projects/en/fiche.md" });
    expect(en.text).toContain(" (opens in a new tab)");
  });

  it("lie la flèche au dernier mot du lien, pour qu'elle ne passe pas seule à la ligne", () => {
    const [head, block] = visit("https://exemple.fr").replaced as [
      { value: string },
      { properties: { className: string[] }; children: { value?: string; tagName?: string }[] },
    ];

    expect(head.value).toBe("note de ");
    expect(block.properties.className).toEqual(["whitespace-nowrap"]);
    expect(block.children.map((child) => child.value ?? child.tagName)).toEqual(["cadrage", "svg"]);
  });

  it("garde entier un lien d'un seul mot", () => {
    expect(visit("https://exemple.fr", { label: "GitHub" }).replaced).toHaveLength(1);
  });

  it("pose la flèche après le lien quand il ne finit pas par un mot", () => {
    const code = { type: "element", tagName: "code", properties: {}, children: [] };
    const cases = [
      { children: [{ type: "text", value: "le dépôt " }, code] },
      { label: "le dépôt " },
      { children: [] },
    ];

    for (const options of cases) {
      const { appended, replaced } = visit("https://exemple.fr", options) as {
        appended: { tagName: string }[];
        replaced: unknown[];
      };
      expect(replaced).toEqual([]);
      expect(appended.map((child) => child.tagName)).toEqual(["svg", "span"]);
    }
  });

  it("parle français quand le chemin de la fiche est inconnu", () => {
    // Une chaîne vide, car `undefined` rendrait la main au chemin par défaut.
    expect(visit("https://exemple.fr", { file: "" }).text).toContain(" (nouvel onglet)");
  });

  it("laisse les liens internes tels quels", () => {
    for (const href of ["#realisation", "/projects/stage-2027"]) {
      expect(visit(href)).toMatchObject({ attributes: {}, appended: [], replaced: [] });
    }
  });
});
