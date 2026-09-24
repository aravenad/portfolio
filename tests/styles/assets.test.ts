import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Un SVG référencé depuis le CSS est redessiné à chaque palier de zoom. Avec des
 * filtres — le masque de la matière en portait deux, `feTurbulence` et
 * `feDisplacementMap` —, le zoom au pavé tactile de Firefox recalculait tout le
 * haut de page à chaque image, et fond comme contenu saccadaient.
 *
 * Ces filtres ont leur place dans une source (`tools/`), rastérisée ensuite ;
 * jamais dans ce que le navigateur dessine en direct.
 */
const css = readFileSync(new URL("../../src/styles/global.css", import.meta.url), "utf8");
const assets = new URL("../../src/assets/", import.meta.url);

/** Les fichiers de src/assets que le CSS global référence par `url(...)`. */
const referenced = [...css.matchAll(/url\(["']?\.\.\/assets\/([^"')]+)["']?\)/g)].map(
  (match) => match[1],
);

describe("images du CSS global", () => {
  it("référence des fichiers qui existent", () => {
    const present = new Set(readdirSync(assets));

    expect(referenced.length).toBeGreaterThan(0);
    for (const file of referenced) expect(present.has(file), file).toBe(true);
  });

  it("n'emploie aucun SVG à filtres, redessiné à chaque zoom", () => {
    for (const file of referenced.filter((name) => name.endsWith(".svg"))) {
      const svg = readFileSync(new URL(file, assets), "utf8");
      expect(svg, `${file} contient un filtre`).not.toMatch(/<filter\b/);
    }
  });

  it("masque la matière avec une image, pas un SVG", () => {
    const mask = css.match(/mask-image:\s*url\(["']?\.\.\/assets\/([^"')]+)/)?.[1];

    expect(mask).toBeDefined();
    expect(mask).not.toMatch(/\.svg$/);
  });

  it("garde un masque à la taille de sa source, sans perte de forme", () => {
    // 1600 × 1024, le viewBox du SVG : réduite de moitié, l'image s'écartait
    // vingt fois plus du rendu d'origine.
    const webp = readFileSync(new URL("chrome-fade.webp", assets));
    const chunk = webp.subarray(12, 16).toString("ascii");

    expect(webp.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(chunk).toBe("VP8L"); // WebP sans perte

    // En-tête VP8L : 14 bits de largeur - 1, puis 14 bits de hauteur - 1.
    const bits = webp.readUInt32LE(21);
    expect((bits & 0x3fff) + 1).toBe(1600);
    expect(((bits >> 14) & 0x3fff) + 1).toBe(1024);
  });
});
