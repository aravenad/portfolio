/**
 * La trame de glyphes : une image recomposée en caractères, sans dépendre du
 * vrai `window`.
 *
 * Chaque cellule carrée de la grille devient un glyphe de la rampe, d'autant
 * plus encré que la cellule est claire, dans l'une des sept teintes de la
 * palette. Une matrice de Bayer décale les seuils d'une cellule à l'autre : les
 * demi-teintes se lisent comme un quadrillage plutôt que comme des aplats.
 *
 * La grille ne bouge jamais. Animée, seule la lumière change : un reflet qui
 * traverse la matière en diagonale et une houle légère, ajoutés à la luminance
 * avant la trame. Les glyphes et leurs teintes suivent, la position des
 * caractères reste fixe.
 *
 * L'animation tourne en boucle, plus de cinq secondes : le RGAA (13.8) demande
 * qu'on puisse l'arrêter. C'est l'interrupteur « Animer le fond » du panneau de
 * réglages, posé sur `<html data-glyph>` comme le reflet des titres
 * (src/lib/shine.ts), et coupé d'office si le système réduit les animations.
 * Arrêtée, la trame reste à l'écran, figée.
 *
 * ⚠️ Le script en ligne de BaseLayout lit `GLYPH_KEY` avant le premier rendu :
 * changer la clé ou les valeurs demande de le modifier aussi.
 */

import { type MotionButton, type MotionRoot, type MotionStore, wireMotionToggle } from "./shine";

/** Les glyphes, du vide au plein : chacun couvre un peu plus d'encre. */
export const RAMPE = [" ", "·", ":", "+", "×", "x", "X", "#"] as const;

/** Matrice de Bayer 4 × 4 : le quadrillage en croix des demi-teintes. */
export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

/**
 * Les teintes, dans l'ordre des lignes de l'atlas. Leurs couleurs vivent dans
 * global.css (`--glyph-<teinte>`), redéfinies pour le thème clair.
 */
export const TEINTES = ["nuit", "abysse", "cobalt", "azur", "ciel", "givre", "cendre"] as const;

export type Teinte = (typeof TEINTES)[number];

const NUIT = 0;
const CENDRE = 6;

/** Seuils hauts des bandes de couleur, de la nuit au givre. */
const BANDES = [0.14, 0.34, 0.52, 0.7, 0.86];

export interface Niveaux {
  /** Tout ce qui est plus sombre devient la nuit pleine. */
  noir: number;
  /** Tout ce qui est plus clair devient le givre plein. */
  blanc: number;
  /** Au-dessus de 1, écrase les ombres. */
  gamma: number;
  /** Saturation sous laquelle un demi-ton passe en cendre. */
  neutre: number;
  /** Lit la source en négatif : le clair devient le vide. */
  inverse?: boolean;
}

export const NIVEAUX: Niveaux = { noir: 0.18, blanc: 0.85, gamma: 1.15, neutre: 0.16 };

/**
 * Les niveaux de la matière du fond. Elle est sombre (luminance médiane 0,13,
 * 0,58 au plus clair) et presque neutre (saturation sous 0,1 pour neuf
 * cellules sur dix) : avec les niveaux par défaut, la moitié de la grille
 * restait vide et le reste virait à la cendre. Les reflets les plus francs
 * deviennent ici le givre, et seuls les gris parfaitement neutres passent en
 * cendre : les plis gardent les bleus de la palette.
 */
export const NIVEAUX_MATIERE: Niveaux = { noir: 0.04, blanc: 0.6, gamma: 1.15, neutre: 0.02 };

/**
 * Les niveaux d'une image d'attente de démo. Ce sont des rendus sur fond
 * clair : lus tels quels, le fond deviendrait un mur de glyphes pleins sur un
 * site sombre. En négatif, le fond reste vide et le sujet ressort en glyphes.
 */
export const NIVEAUX_AFFICHE: Niveaux = { ...NIVEAUX, inverse: true };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Valeur tonale d'une luminance après niveaux et gamma : 0 la nuit, 1 le givre. */
export function ton(luminance: number, niveaux: Niveaux = NIVEAUX): number {
  return clamp((luminance - niveaux.noir) / (niveaux.blanc - niveaux.noir), 0, 1) ** niveaux.gamma;
}

/** Rang, dans `TEINTES`, de la bande où tombe une valeur tonale. */
export function bande(t: number): number {
  const rang = BANDES.findIndex((max) => t < max);
  return rang === -1 ? BANDES.length : rang;
}

/** La luminance et la saturation de chaque cellule, lues une fois pour toutes. */
export interface Champ {
  colonnes: number;
  lignes: number;
  luminance: Float32Array;
  saturation: Float32Array;
}

/**
 * Lit une image réduite à un pixel par cellule (les données RGBA d'un
 * `getImageData` de `colonnes × lignes`).
 */
export function champ(rgba: ArrayLike<number>, colonnes: number, lignes: number): Champ {
  const taille = colonnes * lignes;
  const luminance = new Float32Array(taille);
  const saturation = new Float32Array(taille);

  for (let i = 0; i < taille; i++) {
    const r = rgba[i * 4] / 255;
    const g = rgba[i * 4 + 1] / 255;
    const b = rgba[i * 4 + 2] / 255;
    const max = Math.max(r, g, b);

    luminance[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    saturation[i] = max > 0 ? (max - Math.min(r, g, b)) / max : 0;
  }

  return { colonnes, lignes, luminance, saturation };
}

/** Durée d'une traversée du reflet, en secondes. */
export const BALAYAGE = 9;

/**
 * La lumière ajoutée à une cellule à l'instant `temps` (en secondes) : un
 * reflet en diagonale, du haut à gauche vers le bas à droite, qui sort de la
 * grille avant de revenir, et une houle douce qui fait frémir les demi-teintes.
 * Les deux bouclent ensemble, au bout de `BALAYAGE` secondes.
 */
export function lumiere(x: number, y: number, colonnes: number, lignes: number, temps: number): number {
  const position = (x / colonnes + 0.6 * (y / lignes)) / 1.6;
  const centre = -0.25 + 1.5 * ((temps / BALAYAGE) % 1);
  const reflet = 0.18 * Math.exp(-(((position - centre) / 0.09) ** 2));
  const phase = (2 * Math.PI * temps) / BALAYAGE;
  const houle = 0.05 * Math.sin(x * 0.23 + 2 * phase) * Math.sin(y * 0.31 - phase);

  return reflet + houle;
}

/**
 * Le code d'une cellule : `teinte * 8 + glyphe`, ou 0 pour une cellule vide.
 * Un octet suffit, et deux images se comparent cellule par cellule.
 */
export function code(teinte: number, glyphe: number): number {
  return glyphe === 0 ? 0 : teinte * RAMPE.length + glyphe;
}

/**
 * Trame le champ dans `sortie`, une cellule par octet (voir `code`). Sans
 * `temps`, l'image est figée : ni reflet ni houle.
 */
export function trame(
  source: Champ,
  sortie: Uint8Array,
  temps: number | null = null,
  niveaux: Niveaux = NIVEAUX,
): Uint8Array {
  const { colonnes, lignes, luminance, saturation } = source;
  const marches = RAMPE.length - 1;

  for (let y = 0; y < lignes; y++) {
    for (let x = 0; x < colonnes; x++) {
      const i = y * colonnes + x;
      const eclat = temps === null ? 0 : lumiere(x, y, colonnes, lignes, temps);
      const t = ton((niveaux.inverse ? 1 - luminance[i] : luminance[i]) + eclat, niveaux);
      const seuil = (BAYER4[y & 3][x & 3] + 0.5) / 16;
      const glyphe = clamp(Math.floor(t * marches + seuil), 0, marches);
      // Les bandes sont tramées elles aussi : pas de frontière nette entre deux teintes.
      const tb = clamp(t + (seuil - 0.5) * 0.16, 0, 1);
      const neutre = saturation[i] < niveaux.neutre && tb >= 0.4 && tb < 0.86;

      sortie[i] = code(neutre ? CENDRE : bande(tb), glyphe);
    }
  }

  return sortie;
}

/** Ce que l'atlas et la peinture utilisent d'un contexte 2D. */
export interface Pinceau {
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillText(text: string, x: number, y: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
}

/** La police de la trame, chargée par global.css. */
export const POLICE = '"IBM Plex Mono", ui-monospace, monospace';

/**
 * Pré-rend chaque glyphe dans chaque teinte : une colonne par glyphe, une
 * ligne par teinte, des tuiles de `cellule` pixels. Peindre une image revient
 * ensuite à copier des tuiles.
 *
 * `couleurs` suit l'ordre de `TEINTES`.
 */
export function atlas(pinceau: Pinceau, cellule: number, couleurs: readonly string[]): void {
  pinceau.font = `500 ${Math.round(cellule * 1.15)}px ${POLICE}`;
  pinceau.textAlign = "center";
  pinceau.textBaseline = "middle";

  couleurs.forEach((couleur, ligne) => {
    pinceau.fillStyle = couleur;
    RAMPE.forEach((glyphe, colonne) => {
      if (glyphe === " ") return;
      pinceau.fillText(glyphe, (colonne + 0.5) * cellule, (ligne + 0.56) * cellule);
    });
  });
}

/**
 * Peint les cellules de `codes` qui diffèrent de `avant`, puis met `avant` à
 * jour. D'une image à la suivante, seule une partie de la grille change : le
 * reste n'est pas repeint. Un `avant` rempli de 255, code impossible, force à
 * tout peindre.
 *
 * Renvoie le nombre de cellules repeintes.
 */
export function peindre(
  pinceau: Pinceau,
  tuiles: CanvasImageSource,
  codes: Uint8Array,
  avant: Uint8Array,
  colonnes: number,
  cellule: number,
): number {
  let repeintes = 0;

  for (let i = 0; i < codes.length; i++) {
    const valeur = codes[i];
    if (valeur === avant[i]) continue;

    const x = (i % colonnes) * cellule;
    const y = Math.floor(i / colonnes) * cellule;

    pinceau.clearRect(x, y, cellule, cellule);
    if (valeur !== 0) {
      const glyphe = valeur % RAMPE.length;
      const teinte = (valeur - glyphe) / RAMPE.length;
      pinceau.drawImage(tuiles, glyphe * cellule, teinte * cellule, cellule, cellule, x, y, cellule, cellule);
    }

    avant[i] = valeur;
    repeintes++;
  }

  return repeintes;
}

/** Une grille qui couvre `largeur × hauteur` de cellules carrées. */
export function grille(largeur: number, hauteur: number, cellule: number) {
  return {
    colonnes: Math.max(1, Math.ceil(largeur / cellule)),
    lignes: Math.max(1, Math.ceil(hauteur / cellule)),
  };
}

/** Un rectangle dans l'image source, en pixels de la source. */
export interface Cadre {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Largeur de la matière du fond (src/assets/chrome-original-hq.webp). */
export const MATIERE_LARGEUR = 1920;
/** Hauteur de la matière du fond. */
export const MATIERE_HAUTEUR = 3770;

/**
 * La part de la matière que montre le fond, sur `largeur × hauteur` en haut de
 * page : le même cadrage que `body::before` dans global.css, soit une image
 * large d'au moins 64rem, centrée, décalée de 0,87 fois sa largeur vers le haut.
 */
export function cadrageFond(largeur: number, hauteur: number, rem = 16): Cadre {
  const affichee = Math.max(64 * rem, largeur);
  const echelle = MATIERE_LARGEUR / affichee;

  return {
    sx: ((affichee - largeur) / 2) * echelle,
    sy: 0.87 * MATIERE_LARGEUR,
    sw: largeur * echelle,
    sh: hauteur * echelle,
  };
}

/**
 * La part de la matière que montre une couverture de projet : le cadrage de
 * `.project-cover::before`, une image à 360 % de la largeur du bloc, placée à
 * `x` et `y` (entre 0 et 1, comme `background-position` en pourcentages).
 */
export function cadrageCouverture(largeur: number, hauteur: number, x: number, y: number): Cadre {
  const affichee = largeur * 3.6;
  const echelle = MATIERE_LARGEUR / affichee;
  const haute = (affichee * MATIERE_HAUTEUR) / MATIERE_LARGEUR;

  return {
    sx: (affichee - largeur) * x * echelle,
    sy: Math.max(0, haute - hauteur) * y * echelle,
    sw: largeur * echelle,
    sh: hauteur * echelle,
  };
}

/** La part d'une image que montre `object-fit: cover` dans `largeur × hauteur`. */
export function cadrageCouvrant(
  largeur: number,
  hauteur: number,
  imageLargeur: number,
  imageHauteur: number,
): Cadre {
  const echelle = Math.min(imageLargeur / largeur, imageHauteur / hauteur);
  const sw = largeur * echelle;
  const sh = hauteur * echelle;

  return { sx: (imageLargeur - sw) / 2, sy: (imageHauteur - sh) / 2, sw, sh };
}

/** Lit un pourcentage CSS (« 22% ») en fraction, `repli` s'il est illisible. */
export function fraction(valeur: string, repli = 0.5): number {
  const nombre = Number.parseFloat(valeur);
  return Number.isFinite(nombre) ? clamp(nombre / 100, 0, 1) : repli;
}

/** Clé du choix du visiteur dans `localStorage`. */
export const GLYPH_KEY = "glyph";

/**
 * Câble les interrupteurs « Animer le fond », comme ceux du reflet des titres :
 * un clic bascule `<html data-glyph>` entre `on` et `off` et mémorise le choix.
 */
export function wireGlyphToggle(
  buttons: readonly MotionButton[],
  root: MotionRoot,
  getStore: () => MotionStore,
  signal: AbortSignal,
): void {
  wireMotionToggle(buttons, root, GLYPH_KEY, getStore, signal);
}
