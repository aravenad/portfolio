/**
 * Le front de glyphes qui porte le changement de thème, sans dépendre du vrai
 * `window`.
 *
 * Plutôt qu'un fondu ou un cercle lisse, étrangers à la direction artistique,
 * le nouveau thème est imprimé par la trame du fond (src/lib/glyph.ts) : même
 * rampe de glyphes, même matrice de Bayer, mêmes teintes, même cellule de 9 px.
 * Une bande de glyphes traverse la fenêtre de haut en bas, puis de bas en haut
 * au changement suivant, et ainsi de suite :
 *
 * - de plus en plus encrés jusqu'au milieu du front, puis de moins en moins ;
 * - dans les teintes de l'ancien thème vers l'avant, du nouveau vers
 *   l'arrière, mêlées au seuil de Bayer de chaque case ;
 * - l'encre plafonne aux bleus de la palette (l'azur), lisibles sur les deux
 *   fonds comme sur leur mélange ;
 * - le bord n'est pas une ligne droite : la fenêtre est découpée en colonnes de
 *   trois cellules, chacune en avance ou en retard sur ses voisines, selon une
 *   houle tirée au hasard à chaque changement et un écart propre à la colonne ;
 *   un bruit fixe par cellule l'effrange encore.
 *
 * Les glyphes n'ont pas de fond. Dessous, la nouvelle page apparaît par un
 * masque (voir global.css) qui la fond dans l'ancienne sur l'épaisseur du
 * front : opaque derrière lui, transparente devant, découpé en colonnes comme
 * lui.
 *
 * Rien n'est recalculé d'une image à l'autre : le bord du masque est dessiné
 * une fois (`bordure`), puis seulement déplacé par le navigateur
 * (`imagesDuMasque`) ; la peinture ne parcourt que les lignes que le front couvre et lit l'état de
 * chaque cellule dans une table, sans rien allouer.
 */

import { BAYER4, RAMPE, TEINTES, bande } from "./glyph";

/** La cellule de la trame du fond (voir `surfaceDuFond` dans GlyphField.astro). */
export const CELLULE = 9;

/** Épaisseur du front, en pixels. */
export const LARGEUR = 24 * CELLULE;

/** Amplitude du bruit qui effrange le bord, en pixels. */
export const ECART = 4 * CELLULE;

/** Largeur d'une colonne du front, en pixels : toutes ses cellules avancent ensemble. */
export const COLONNE = 3 * CELLULE;

/** Amplitude de la houle qui ondule le bord, en pixels. */
export const HOULE = 56;

/** Écart propre à chaque colonne, en pixels, par-dessus la houle. */
export const SACCADE = 40;

/** Retard maximal d'une colonne : la houle d'un creux à une crête, plus sa saccade. */
const RETARD = 2 * HOULE + SACCADE;

/** Hauteur de l'image du bord du masque : le plus grand retard, plus l'épaisseur du front. */
export const BORDURE = RETARD + LARGEUR;

/**
 * Durée de la traversée, en millisecondes. ⚠️ `theme-tenue`, dans global.css,
 * doit durer un peu plus.
 */
export const DUREE = 1000;

/** Le sens de la traversée. */
export type Sens = "descend" | "monte";

/** Le sens du changement suivant : chaque traversée repart du bord où la précédente a fini. */
export function inverse(sens: Sens): Sens {
  return sens === "descend" ? "monte" : "descend";
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Accélère puis ralentit, en douceur : une sinusoïde, dont la vitesse au milieu
 * reste proche de la moyenne. Le front glisse plutôt qu'il ne file.
 */
export function adoucir(t: number): number {
  const x = clamp(t, 0, 1);
  return (1 - Math.cos(Math.PI * x)) / 2;
}

/** Un bruit fixe par cellule, dans [0, 1[ : le même à chaque image, pour que le bord ne grésille pas. */
export function bruit(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Le retard de chaque colonne du front, dans [0, `RETARD`] : deux houles de
 * longueurs différentes, dont `graine` fixe les phases, plus une saccade par
 * colonne.
 */
export function retards(nombre: number, graine: number): Float32Array {
  const phase1 = bruit(graine, 1) * 2 * Math.PI;
  const phase2 = bruit(graine, 2) * 2 * Math.PI;
  const valeurs = new Float32Array(nombre);

  for (let i = 0; i < nombre; i++) {
    const x = (i + 0.5) * COLONNE;
    const houle = 0.6 * Math.sin((2 * Math.PI * x) / 720 + phase1) + 0.4 * Math.sin((2 * Math.PI * x) / 270 + phase2);
    // En pixels entiers : les morceaux du masque se joignent sans filet.
    valeurs[i] = Math.round(HOULE * (1 + houle) + SACCADE * bruit(i, graine + 3));
  }

  return valeurs;
}

/** La grille du front : la profondeur de chaque cellule depuis le bord de départ, retard et bruit compris. */
export interface Front {
  sens: Sens;
  /** Hauteur de la fenêtre, en pixels. */
  hauteur: number;
  colonnes: number;
  lignes: number;
  distances: Float32Array;
  /** Le retard de chaque colonne de `COLONNE` pixels (voir `retards`). */
  retards: Float32Array;
  /** Position où le front a quitté la fenêtre par le bord opposé, retards compris. */
  fin: number;
}

/**
 * Prépare le front d'une fenêtre de `largeur × hauteur` pixels, qui la traverse
 * dans le `sens` donné. `graine` tire la forme de son bord.
 */
export function front(largeur: number, hauteur: number, sens: Sens = "descend", graine = 0): Front {
  const colonnes = Math.max(1, Math.ceil(largeur / CELLULE));
  const lignes = Math.max(1, Math.ceil(hauteur / CELLULE));
  const distances = new Float32Array(colonnes * lignes);
  const parColonne = COLONNE / CELLULE;
  const decalages = retards(Math.ceil(colonnes / parColonne), graine);

  for (let y = 0; y < lignes; y++) {
    for (let x = 0; x < colonnes; x++) {
      const rang = sens === "descend" ? y : lignes - 1 - y;
      const retard = decalages[Math.floor(x / parColonne)];
      distances[y * colonnes + x] = (rang + 0.5) * CELLULE + retard + (bruit(x, y) - 0.5) * ECART;
    }
  }

  return {
    sens,
    hauteur,
    colonnes,
    lignes,
    distances,
    retards: decalages,
    fin: lignes * CELLULE + LARGEUR + ECART + RETARD,
  };
}

/** Position du bord avant du front, depuis le bord de départ, `ecoule` millisecondes après son départ. */
export function rayon(grille: Front, ecoule: number): number {
  return adoucir(ecoule / DUREE) * grille.fin;
}

/**
 * L'image du bord du masque, en SVG : par colonne, du plein jusqu'au bord
 * arrière du front, puis un dégradé jusqu'à son bord avant, chacune en retard
 * du sien. Vue dans le sens de la descente ; retournée quand le front monte.
 * Elle mesure `retards.length × COLONNE` sur `BORDURE` pixels.
 *
 * Le navigateur la rastérise une fois : d'une image à l'autre, le masque ne
 * fait que glisser (voir `positionsDuMasque`).
 */
export function bordure(grille: Front): string {
  const largeur = grille.retards.length * COLONNE;
  let plein = "";
  let fondus = "";

  grille.retards.forEach((retard, i) => {
    const x = i * COLONNE;
    const arriere = RETARD - retard;
    if (arriere > 0) plein += `M${x} 0h${COLONNE}v${arriere}h-${COLONNE}z`;
    fondus += `<rect x="${x}" y="${arriere}" width="${COLONNE}" height="${LARGEUR}" fill="url(#f)"/>`;
  });

  const retourne = grille.sens === "monte" ? ` transform="matrix(1 0 0 -1 0 ${BORDURE})"` : "";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${BORDURE}" viewBox="0 0 ${largeur} ${BORDURE}">` +
    `<defs><linearGradient id="f" x2="0" y2="1"><stop offset="0"/><stop offset="1" stop-opacity="0"/></linearGradient></defs>` +
    `<g${retourne}><path d="${plein}"/>${fondus}</g></svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * La taille des deux couches du masque : le bord (`bordure`), puis l'aplat qui
 * le prolonge derrière lui, aussi haut que toute la course, pour couvrir la
 * fenêtre jusqu'au bout.
 */
export function taillesDuMasque(grille: Front): string {
  return `${grille.retards.length * COLONNE}px ${BORDURE}px, 100% ${grille.fin}px`;
}

/**
 * Où poser les deux couches du masque, le bord avant du front en `bord` (voir
 * `taillesDuMasque`). Elles se chevauchent d'un pixel : pas de filet entre
 * elles.
 */
export function positionsDuMasque(grille: Front, bord: number): string {
  const avance = Math.round(bord);

  if (grille.sens === "descend") {
    const haut = avance - BORDURE;
    return `0px ${haut}px, 0px ${haut - grille.fin + 1}px`;
  }

  const haut = grille.hauteur - avance;
  return `0px ${haut}px, 0px ${haut + BORDURE - 1}px`;
}

/**
 * La course du masque en images clés, à confier au navigateur (Web
 * Animations) : `pas` positions du bord prises sur `rayon`, reliées en ligne
 * droite, assez serrées pour suivre l'adoucissement à moins d'un pixel près.
 *
 * Animé ainsi, le masque ne touche plus aux feuilles de style d'une image à
 * l'autre : rien ne force à recalculer le style de toute la page.
 */
export function imagesDuMasque(grille: Front, pas = 40): Keyframe[] {
  return Array.from({ length: pas + 1 }, (_, k) => ({
    offset: k / pas,
    maskPosition: positionsDuMasque(grille, rayon(grille, (k / pas) * DUREE)),
  }));
}

/** Ce qu'une cellule du front affiche. */
export interface Cellule {
  /** Dans les teintes du nouveau thème, ou encore de l'ancien. */
  nouveau: boolean;
  opacite: number;
  /** Rang dans `RAMPE` : 0 pour aucun glyphe. */
  glyphe: number;
  /** Rang dans `TEINTES`, de la nuit à l'azur. */
  teinte: number;
}

/** L'encre la plus franche du front : au plus l'azur, sans aller jusqu'au givre. */
const ENCRE = 0.62;

/**
 * Une cellule à la position `p` dans l'épaisseur du front (0 au bord avant, 1
 * au bord arrière), avec le seuil de Bayer de sa case. `null` hors du front ou
 * sans glyphe.
 */
export function cellule(p: number, seuil: number): Cellule | null {
  if (p <= 0 || p >= 1) return null;

  const marches = RAMPE.length - 1;
  // L'encre culmine au milieu du front et s'éteint vers ses bords.
  const t = 1 - Math.abs(2 * p - 1);
  const glyphe = Math.min(marches, Math.floor(t * marches + seuil));
  if (glyphe === 0) return null;

  return {
    nouveau: p > seuil,
    opacite: Math.min(1, 3 * t),
    glyphe,
    teinte: bande(clamp(t * ENCRE + (seuil - 0.5) * 0.16, 0, 1)),
  };
}

/** Le nombre de positions de la table, dans l'épaisseur du front. */
export const PAS = 512;

/**
 * L'état de `cellule()` pour `PAS` positions dans l'épaisseur du front et
 * chacun des 16 rangs de Bayer, calculé une fois. L'entrée d'une position `k`
 * et d'un rang `b` est `k * 16 + b` ; un glyphe 0 veut dire rien à peindre.
 */
export interface Table {
  glyphes: Uint8Array;
  /** Rang de la tuile dans l'atlas : les teintes de l'ancien thème, puis du nouveau. */
  teintes: Uint8Array;
  opacites: Float32Array;
}

export function table(): Table {
  const glyphes = new Uint8Array(PAS * 16);
  const teintes = new Uint8Array(PAS * 16);
  const opacites = new Float32Array(PAS * 16);

  for (let k = 0; k < PAS; k++) {
    for (let b = 0; b < 16; b++) {
      const etat = cellule((k + 0.5) / PAS, (b + 0.5) / 16);
      if (!etat) continue;
      const i = k * 16 + b;
      glyphes[i] = etat.glyphe;
      teintes[i] = (etat.nouveau ? TEINTES.length : 0) + etat.teinte;
      opacites[i] = etat.opacite;
    }
  }

  return { glyphes, teintes, opacites };
}

let tableDuFront: Table | undefined;

/** Le seuil de Bayer de la case `(x, y)`, dans ]0, 1[. */
export function seuil(x: number, y: number): number {
  return (BAYER4[y & 3][x & 3] + 0.5) / 16;
}

/** Ce que la peinture du front utilise d'un contexte 2D. */
export interface Toile {
  globalAlpha: number;
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

/**
 * Peint le front de bord avant `bord`. `tuiles` est l'atlas de `atlas()`
 * (glyph.ts), tuiles de `tuile` pixels : les teintes de l'ancien thème, puis
 * celles du nouveau.
 *
 * Seules les lignes que le front peut couvrir sont parcourues, colonne par
 * colonne, et l'état de chaque cellule est lu dans la table : rien n'est
 * alloué d'une image à l'autre.
 *
 * Renvoie le nombre de glyphes peints.
 */
export function peindreFront(
  pinceau: Toile,
  tuiles: CanvasImageSource,
  tuile: number,
  grille: Front,
  bord: number,
): number {
  const { colonnes, lignes, distances, retards, sens } = grille;
  const { glyphes, teintes, opacites } = (tableDuFront ??= table());
  const parColonne = COLONNE / CELLULE;
  let compte = 0;
  let alpha = 1;

  pinceau.globalAlpha = 1;
  pinceau.clearRect(0, 0, colonnes * CELLULE, lignes * CELLULE);

  for (let x = 0; x < colonnes; x++) {
    // Les rangs dont la distance peut tomber dans l'épaisseur du front.
    const retard = retards[(x / parColonne) | 0];
    const premier = Math.max(0, Math.floor((bord - LARGEUR - retard - ECART / 2) / CELLULE - 0.5));
    const dernier = Math.min(lignes - 1, Math.ceil((bord - retard + ECART / 2) / CELLULE - 0.5));

    for (let rang = premier; rang <= dernier; rang++) {
      const y = sens === "descend" ? rang : lignes - 1 - rang;
      const p = (bord - distances[y * colonnes + x]) / LARGEUR;
      if (p <= 0 || p >= 1) continue;

      const i = ((p * PAS) | 0) * 16 + BAYER4[y & 3][x & 3];
      const glyphe = glyphes[i];
      if (glyphe === 0) continue;

      if (opacites[i] !== alpha) pinceau.globalAlpha = alpha = opacites[i];
      pinceau.drawImage(
        tuiles,
        glyphe * tuile,
        teintes[i] * tuile,
        tuile,
        tuile,
        x * CELLULE,
        y * CELLULE,
        CELLULE,
        CELLULE,
      );
      compte++;
    }
  }

  pinceau.globalAlpha = 1;
  return compte;
}
