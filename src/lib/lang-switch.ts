/**
 * Garder sa place en changeant de langue, sans DOM.
 *
 * Changer de langue, c'est naviguer vers une autre page : sans rien faire, le
 * routeur ramène en haut, et le lecteur perd l'endroit où il en était. On note
 * donc la position au clic, et on la rétablit dans l'autre langue avant que la
 * nouvelle page ne s'affiche.
 *
 * Deux façons de retrouver l'endroit :
 *
 * - par un repère présent dans les deux langues : les sections de l'accueil
 *   portent les mêmes `id`. Le repère retenu est la dernière section commencée,
 *   et il est replacé au même pixel dans la fenêtre ;
 * - à défaut (fiche projet, dont les titres ont des ancres traduites), par la
 *   part du défilement déjà parcourue : les deux versions ont la même structure,
 *   donc à peu près les mêmes proportions.
 */

export interface ReadingPosition {
  /** `id` du repère retenu, ou `null` s'il n'y en a pas. */
  id: string | null;
  /** Position du haut de ce repère dans la fenêtre, en pixels (≤ 0). */
  offset: number;
  /** Part du défilement parcourue, entre 0 et 1. */
  ratio: number;
}

/** Un repère candidat, avec le haut de sa boîte dans la fenêtre. */
export interface Landmark {
  id: string;
  top: number;
}

/**
 * La position de lecture actuelle. `landmarks` : les repères dans l'ordre du
 * document ; `maxScroll` : le défilement maximal de la page.
 */
export function readingPosition(
  landmarks: Landmark[],
  scrollY: number,
  maxScroll: number,
): ReadingPosition {
  // La dernière section dont le haut est passé au-dessus du bord de la fenêtre :
  // celle qu'on est en train de lire.
  let current: Landmark | undefined;

  for (const landmark of landmarks) {
    if (landmark.top <= 0) current = landmark;
  }

  return {
    id: current?.id ?? null,
    offset: current?.top ?? 0,
    ratio: maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0,
  };
}

/**
 * Le défilement qui rétablit `position` sur la nouvelle page.
 *
 * `landmarkTop` : haut du même repère dans le document (pas dans la fenêtre),
 * ou `undefined` s'il n'existe pas dans cette langue. Le résultat est borné au
 * défilement possible : la page traduite peut être un peu plus courte.
 */
export function restoredScrollY(
  position: ReadingPosition,
  landmarkTop: number | undefined,
  maxScroll: number,
): number {
  const y =
    position.id !== null && landmarkTop !== undefined
      ? landmarkTop - position.offset
      : position.ratio * maxScroll;

  return Math.round(Math.min(Math.max(y, 0), Math.max(maxScroll, 0)));
}
