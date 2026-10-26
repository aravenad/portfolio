/**
 * Le reflet animé des titres chromés, activé ou non, sans dépendre du vrai
 * `window`.
 *
 * Le reflet tourne en boucle : le RGAA (13.8) l'accepte parce que le visiteur
 * peut l'arrêter et le relancer depuis la page, avec l'interrupteur du panneau
 * de réglages (header). Le choix est posé sur `<html data-shine>`, que lit
 * global.css, et mémorisé dans `localStorage` pour les pages suivantes.
 *
 * Sans choix mémorisé, le reflet suit le système : coupé si le visiteur demande
 * de réduire les animations, actif sinon. L'interrupteur s'ajoute à ce réglage,
 * il ne le remplace pas.
 *
 * ⚠️ Le script en ligne de BaseLayout lit la même clé avant le premier rendu :
 * changer `SHINE_KEY` ou les valeurs demande de le modifier aussi.
 */

export type Shine = "on" | "off";

/** Clé du choix du visiteur dans `localStorage`. */
export const SHINE_KEY = "shine";

/** Le réglage à appliquer, d'après le choix mémorisé puis le système. */
export function initialShine(stored: string | null, reduceMotion: boolean): Shine {
  if (stored === "on" || stored === "off") return stored;
  return reduceMotion ? "off" : "on";
}

/** Un réglage d'animation : son attribut sur `<html>` et sa clé de stockage portent le même nom. */
export type MotionSetting = typeof SHINE_KEY | "glyph";

/** Ce que les interrupteurs utilisent du stockage. */
export type MotionStore = Pick<Storage, "setItem">;

/**
 * Mémorise le choix. En navigation privée, le stockage peut refuser : le
 * réglage change quand même, il ne survivra simplement pas au chargement suivant.
 */
export function saveMotion(getStore: () => MotionStore, setting: MotionSetting, value: Shine): void {
  try {
    getStore().setItem(setting, value);
  } catch {
    // Rien à faire : le choix reste valable pour la page en cours.
  }
}

export function saveShine(getStore: () => MotionStore, shine: Shine): void {
  saveMotion(getStore, SHINE_KEY, shine);
}

/** Ce que l'interrupteur utilise de l'élément `<html>`. */
export type MotionRoot = Pick<HTMLElement, "dataset">;

/** Ce que l'interrupteur utilise de lui-même. */
export type MotionButton = Pick<HTMLElement, "setAttribute" | "addEventListener">;

/**
 * Câble les interrupteurs d'un réglage d'animation : leur état pressé suit le
 * réglage courant, et un clic sur l'un d'eux bascule, applique et mémorise.
 * Comme le bouton de thème, ils sont deux (panneau de l'engrenage, menu
 * replié), gardent un libellé fixe (« Animer les titres ») et annoncent leur
 * état par `aria-pressed`.
 */
export function wireMotionToggle(
  buttons: readonly MotionButton[],
  root: MotionRoot,
  setting: MotionSetting,
  getStore: () => MotionStore,
  signal: AbortSignal,
): void {
  const current = (): Shine => (root.dataset[setting] === "off" ? "off" : "on");

  const apply = (value: Shine) => {
    root.dataset[setting] = value;
    for (const button of buttons) button.setAttribute("aria-pressed", String(value === "on"));
  };

  apply(current());

  for (const button of buttons) {
    button.addEventListener(
      "click",
      () => {
        const next: Shine = current() === "on" ? "off" : "on";
        apply(next);
        saveMotion(getStore, setting, next);
      },
      { signal },
    );
  }
}

/** Les interrupteurs « Animer les titres ». */
export function wireShineToggle(
  buttons: readonly MotionButton[],
  root: MotionRoot,
  getStore: () => MotionStore,
  signal: AbortSignal,
): void {
  wireMotionToggle(buttons, root, SHINE_KEY, getStore, signal);
}
