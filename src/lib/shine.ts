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

type ShineStore = Pick<Storage, "setItem">;

/**
 * Mémorise le choix. En navigation privée, le stockage peut refuser : le
 * réglage change quand même, il ne survivra simplement pas au chargement suivant.
 */
export function saveShine(getStore: () => ShineStore, shine: Shine): void {
  try {
    getStore().setItem(SHINE_KEY, shine);
  } catch {
    // Rien à faire : le choix reste valable pour la page en cours.
  }
}

/** Ce que l'interrupteur utilise de l'élément `<html>`. */
export type ShineRoot = Pick<HTMLElement, "dataset">;

/** Ce que l'interrupteur utilise de lui-même. */
export type ShineButton = Pick<HTMLElement, "setAttribute" | "addEventListener">;

/**
 * Câble les interrupteurs : leur état pressé suit le réglage courant, et un clic
 * sur l'un d'eux bascule, applique et mémorise. Comme le bouton de thème, ils
 * sont deux (panneau de l'engrenage, menu replié), gardent un libellé fixe
 * (« Animer les titres ») et annoncent leur état par `aria-pressed`.
 */
export function wireShineToggle(
  buttons: readonly ShineButton[],
  root: ShineRoot,
  getStore: () => ShineStore,
  signal: AbortSignal,
): void {
  const current = (): Shine => (root.dataset.shine === "off" ? "off" : "on");

  const apply = (shine: Shine) => {
    root.dataset.shine = shine;
    for (const button of buttons) button.setAttribute("aria-pressed", String(shine === "on"));
  };

  apply(current());

  for (const button of buttons) {
    button.addEventListener(
      "click",
      () => {
        const next: Shine = current() === "on" ? "off" : "on";
        apply(next);
        saveShine(getStore, next);
      },
      { signal },
    );
  }
}
