import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import {
  IDENTITY,
  MIN_MAX_SCALE,
  clampView,
  clickScale,
  enhanceFigures,
  fitSize,
  flipView,
  maxScale,
  pinch,
  viewTransform,
  wheelFactor,
  zoomAt,
} from "../../src/lib/viewer";

const capture = { width: 1600, height: 1000 };

describe("fitSize", () => {
  it("ajuste l'image à la scène en gardant ses proportions", () => {
    expect(fitSize(capture, { width: 800, height: 800 })).toEqual({ width: 800, height: 500 });
    expect(fitSize(capture, { width: 1600, height: 500 })).toEqual({ width: 800, height: 500 });
  });

  it("ne l'agrandit jamais au-delà de sa taille réelle", () => {
    expect(fitSize(capture, { width: 3000, height: 3000 })).toEqual(capture);
  });
});

describe("maxScale et clickScale", () => {
  it("permettent de zoomer jusqu'à deux fois la taille réelle", () => {
    expect(maxScale(capture, { width: 400, height: 250 })).toBe(8);
    expect(maxScale(capture, capture)).toBe(MIN_MAX_SCALE);
  });

  it("font passer un clic à la taille réelle, au moins au double", () => {
    expect(clickScale(capture, { width: 400, height: 250 })).toBe(4);
    expect(clickScale(capture, { width: 1200, height: 750 })).toBe(2);
  });
});

describe("zoomAt", () => {
  const center = { x: 500, y: 400 };

  it("garde immobile le point de l'image sous le curseur", () => {
    const point = { x: 700, y: 300 };
    const view = zoomAt(IDENTITY, 2, point, center);

    // Le point visé était à (200, -100) du centre de l'image ; doublé, il y revient.
    expect(view).toEqual({ scale: 2, x: -200, y: 100 });
    expect(zoomAt(view, 1, point, center)).toEqual(IDENTITY);
  });

  it("zoome sur place quand on vise le centre", () => {
    expect(zoomAt(IDENTITY, 3, center, center)).toEqual({ scale: 3, x: 0, y: 0 });
  });
});

describe("pinch", () => {
  const center = { x: 0, y: 0 };

  it("règle l'échelle sur l'écart des doigts", () => {
    const view = pinch(IDENTITY, [{ x: -50, y: 0 }, { x: 50, y: 0 }], [{ x: -100, y: 0 }, { x: 100, y: 0 }], center);
    expect(view).toEqual({ scale: 2, x: 0, y: 0 });
  });

  it("fait glisser l'image avec le milieu des doigts", () => {
    const view = pinch(IDENTITY, [{ x: 0, y: 0 }, { x: 100, y: 0 }], [{ x: 0, y: 30 }, { x: 100, y: 30 }], center);
    expect(view).toEqual({ scale: 1, x: 0, y: 30 });
  });
});

describe("clampView", () => {
  const fit = { width: 800, height: 500 };
  const stage = { width: 1000, height: 600 };

  it("borne l'échelle entre l'image ajustée et le maximum", () => {
    expect(clampView({ scale: 0.5, x: 0, y: 0 }, fit, stage, 4).scale).toBe(1);
    expect(clampView({ scale: 9, x: 0, y: 0 }, fit, stage, 4).scale).toBe(4);
  });

  it("recentre l'image tant qu'elle tient dans la scène", () => {
    expect(clampView({ scale: 1, x: 120, y: -40 }, fit, stage, 4)).toEqual(IDENTITY);
  });

  it("empêche un bord de l'image agrandie de quitter celui de la scène", () => {
    // 1600 × 1000 dans 1000 × 600 : 300 px de marge de chaque côté, 200 en hauteur.
    expect(clampView({ scale: 2, x: 900, y: -900 }, fit, stage, 4)).toEqual({ scale: 2, x: 300, y: -200 });
    expect(clampView({ scale: 2, x: -100, y: 50 }, fit, stage, 4)).toEqual({ scale: 2, x: -100, y: 50 });
  });
});

describe("wheelFactor", () => {
  it("zoome vers l'avant, dézoome vers l'arrière", () => {
    expect(wheelFactor(-100, 0)).toBeGreaterThan(1);
    expect(wheelFactor(100, 0)).toBeLessThan(1);
    expect(wheelFactor(100, 0) * wheelFactor(-100, 0)).toBeCloseTo(1);
  });

  it("compte les lignes et les pages en pixels", () => {
    expect(wheelFactor(3, 1)).toBeCloseTo(wheelFactor(48, 0));
    expect(wheelFactor(1, 2)).toBeCloseTo(wheelFactor(400, 0));
  });
});

describe("flipView et viewTransform", () => {
  it("posent l'image ajustée sur la miniature", () => {
    const thumb = { x: 100, y: 1000, width: 400, height: 250 };
    const fit = { x: 200, y: 100, width: 800, height: 500 };

    // Centres : (300, 1125) et (600, 350).
    expect(flipView(thumb, fit)).toEqual({ scale: 0.5, x: -300, y: 775 });
    expect(viewTransform({ scale: 0.5, x: -300, y: 775 })).toBe("translate(-300px, 775px) scale(0.5)");
  });
});

describe("enhanceFigures", () => {
  it("fait de chaque image un bouton nommé par son texte alternatif et son action", () => {
    const { document } = parseHTML(
      `<div class="prose">
        <figure><img alt="Page d'accueil." src="a.webp"><figcaption>L'accueil.</figcaption></figure>
        <figure><img alt="Exploration." src="b.webp"><figcaption>Les sites.</figcaption></figure>
      </div>`,
    );
    const images = [...document.querySelectorAll("figure > img")] as HTMLImageElement[];

    const buttons = enhanceFigures(images, "Agrandir l'image");

    expect(buttons).toHaveLength(2);
    const [first] = buttons;
    expect(first.tagName).toBe("BUTTON");
    expect(first.getAttribute("type")).toBe("button");
    expect(first.getAttribute("aria-haspopup")).toBe("dialog");
    expect(first.parentElement?.tagName).toBe("FIGURE");
    expect(first.firstElementChild).toBe(images[0]);
    expect(first.querySelector(".sr-only")?.textContent).toBe(" Agrandir l'image");
    // La légende reste à sa place, sous le bouton.
    expect(first.nextElementSibling?.tagName).toBe("FIGCAPTION");
  });
});
