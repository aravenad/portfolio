/**
 * Le bouton de retour en haut, sans dépendre du vrai `window`.
 *
 * Le script du composant se contente de trouver le bouton ; tout le reste est
 * ici, avec une fenêtre passée en paramètre pour pouvoir être testé.
 */

/**
 * Le bouton n'apparaît qu'une fois la première fenêtre dépassée : plus haut,
 * le haut de page est déjà à portée de molette.
 */
export function backToTopVisible(scrollY: number, viewportHeight: number): boolean {
  return scrollY > viewportHeight;
}

/** Ce que le bouton utilise de la fenêtre. */
export type BackToTopWindow = Pick<
  Window,
  "scrollY" | "innerHeight" | "scrollTo" | "addEventListener"
>;

/** Ce que le bouton utilise de l'élément. */
export type BackToTopButton = Pick<HTMLElement, "dataset" | "addEventListener">;

/**
 * Câble le bouton : visibilité selon le défilement et la taille de la fenêtre,
 * retour en haut au clic.
 *
 * ⚠️ Tous les écouteurs portent le `signal` d'`onEachPage` : ceux de la fenêtre
 * survivraient sinon à l'échange de DOM et s'accumuleraient à chaque
 * navigation, en visant un bouton qui n'existe plus.
 */
export function wireBackToTop(
  button: BackToTopButton,
  win: BackToTopWindow,
  signal: AbortSignal,
): void {
  const update = () => {
    if (backToTopVisible(win.scrollY, win.innerHeight)) {
      button.dataset.visible = "";
    } else {
      delete button.dataset.visible;
    }
  };

  button.addEventListener(
    "click",
    () => {
      // Sans `behavior`, le défilement suit le `scroll-behavior` de la feuille
      // de style, qui respecte déjà `prefers-reduced-motion`.
      win.scrollTo({ top: 0 });
    },
    { signal },
  );

  update();
  win.addEventListener("scroll", update, { passive: true, signal });
  win.addEventListener("resize", update, { signal });
}
