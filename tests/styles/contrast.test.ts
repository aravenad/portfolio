import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

/**
 * Les gris qui portent du texte doivent tenir 4,5:1 (WCAG 1.4.3) sur le fond de
 * page comme sur une carte, dans les deux thèmes. Les valeurs sont lues dans les
 * feuilles elles-mêmes : celle de Tailwind pour le sombre, que `@theme` complète,
 * et le bloc `data-theme="light"` de global.css pour le clair.
 */
const require = createRequire(import.meta.url);
const css = readFileSync(new URL("../../src/styles/global.css", import.meta.url), "utf8");
const tailwind = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8");

type Oklch = [l: number, c: number, h: number];
type Rgb = [r: number, g: number, b: number];

/** Valeur OKLCH d'une variable dans un bloc de CSS (`none` vaut 0). */
function oklch(source: string, name: string): Oklch {
  const match = source.match(
    new RegExp(`--color-${name}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+|none)\\)`),
  );
  if (!match) throw new Error(`--color-${name} introuvable`);

  const [, l, c, h] = match;
  return [Number(l), Number(c), h === "none" ? 0 : Number(h)];
}

const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`${selector} introuvable`);
  return css.slice(start, css.indexOf("}", start));
};

const theme = block("@theme");
const light = block(':root[data-theme="light"]');

/** Le sombre : la valeur de `@theme` si elle existe, sinon celle de Tailwind. */
const dark = (name: string) => {
  try {
    return oklch(theme, name);
  } catch {
    return oklch(tailwind, name);
  }
};

/** Canaux sRGB linéaires (0 à 1) d'une couleur OKLCH. */
function linear([lightness, chroma, hue]: Oklch): Rgb {
  const L = lightness / 100;
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));

  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const encode = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const decode = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

/**
 * Un texte à opacité réduite (`text-accent/80`) posé sur un fond : le
 * navigateur mélange les deux en sRGB, canal par canal. Rend des canaux
 * linéaires, comme `linear`.
 */
function over(ink: Oklch, alpha: number, ground: Oklch): Rgb {
  const [front, back] = [linear(ink), linear(ground)];
  return front.map((x, i) => decode(alpha * encode(x) + (1 - alpha) * encode(back[i]))) as Rgb;
}

/** Luminance relative WCAG de canaux linéaires. */
const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function ratio(a: Rgb, b: Rgb) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const contrast = (a: Oklch, b: Oklch) => ratio(linear(a), linear(b));

/** Les gris de texte, du plus discret au texte courant. */
const inks = ["zinc-500", "zinc-400"];
/** Le fond de page et la surface pleine d'une carte. */
const grounds = ["zinc-950", "zinc-900"];

describe("contraste des gris de texte", () => {
  for (const [name, read] of [
    ["sombre", dark],
    ["clair", (color: string) => oklch(light, color)],
  ] as const) {
    for (const ink of inks) {
      for (const ground of grounds) {
        it(`${ink} sur ${ground}, thème ${name} : 4,5:1 au moins`, () => {
          expect(contrast(read(ink), read(ground))).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  }

  it("garde zinc-500 plus discret que le texte courant", () => {
    const background = dark("zinc-950");

    expect(contrast(dark("zinc-400"), background)).toBeGreaterThan(
      contrast(dark("zinc-500"), background) + 2,
    );
  });
});

describe("contraste de l'accent", () => {
  // L'accent écrit le statut « En cours » des cartes, en 12 px : il doit tenir
  // 4,5:1 sur le fond comme sur une carte.
  for (const [name, read] of [
    ["sombre", dark],
    ["clair", (color: string) => oklch(light, color)],
  ] as const) {
    for (const ground of grounds) {
      it(`accent sur ${ground}, thème ${name} : 4,5:1 au moins`, () => {
        expect(contrast(read("accent"), read(ground))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  // En sombre, le statut garde l'accent adouci à 80 %. En clair, celui-ci
  // tombait à 3,8:1 sur une carte : le thème clair y prend l'accent plein.
  for (const ground of grounds) {
    it(`accent à 80 % sur ${ground}, thème sombre : 4,5:1 au moins`, () => {
      expect(
        ratio(over(dark("accent"), 0.8, dark(ground)), linear(dark(ground))),
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});
