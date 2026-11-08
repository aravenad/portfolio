/**
 * Le thème clair ou sombre, sans dépendre du vrai `window`.
 *
 * Le sombre est le thème par défaut : c'est celui de la feuille de style, sans
 * aucun attribut. Le clair ne s'applique que sur choix du visiteur, mémorisé
 * dans `localStorage` et posé sur `<html data-theme="light">`, dont
 * global.css redéfinit alors la palette.
 *
 * ⚠️ Le script en ligne de BaseLayout lit la même clé avant le premier rendu :
 * changer `THEME_KEY` ou les valeurs demande de le modifier aussi.
 */

export type Theme = "light" | "dark";

/** Clé du choix du visiteur dans `localStorage`. */
export const THEME_KEY = "theme";

type ThemeStore = Pick<Storage, "setItem">;

/**
 * Mémorise le choix. En navigation privée, le stockage peut refuser : le thème
 * change quand même, il ne survivra simplement pas au prochain chargement.
 */
export function saveTheme(getStore: () => ThemeStore, theme: Theme): void {
  try {
    getStore().setItem(THEME_KEY, theme);
  } catch {
    // Rien à faire : le choix reste valable pour la page en cours.
  }
}

export function toggledTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}

/** Ce que l'animation reçoit de la transition lancée. */
export interface ThemeTransition {
  /** Résolue quand les captures sont prêtes et que l'animation commence. */
  ready: Promise<unknown>;
  finished: Promise<unknown>;
}

/** Ce que la transition utilise du document. */
export interface TransitionDocument {
  documentElement: Pick<HTMLElement, "setAttribute" | "removeAttribute">;
  startViewTransition?: (update: () => void) => ThemeTransition;
}

/**
 * Applique `update` dans une transition de toute la page (View Transitions),
 * ou directement si le navigateur ne sait pas le faire.
 *
 * La transition couvre tout d'un coup, y compris ce que les transitions CSS ne
 * savent pas animer : la matière du fond qui s'inverse, son mode de fusion.
 * Elle se pose sur `<html data-theme-switching>`, ce qui laisse global.css en
 * régler l'allure sans toucher aux fondus de navigation du routeur :
 *
 * - `glyph` : `animate` reçoit la transition et la mène, image par image. Le
 *   header y fait passer un front de glyphes (src/lib/theme-front.ts).
 * - `fade` : pour qui préfère réduire les animations, un simple fondu, sans
 *   rien qui bouge. Passer du noir au papier sans aucune transition serait le
 *   changement le plus brutal de tous.
 */
export function withViewTransition(
  doc: TransitionDocument,
  motionOk: boolean,
  update: () => void,
  animate?: (transition: ThemeTransition) => void,
): void {
  if (typeof doc.startViewTransition !== "function") {
    update();
    return;
  }

  const root = doc.documentElement;
  const glyph = motionOk && animate !== undefined;

  root.setAttribute("data-theme-switching", glyph ? "glyph" : "fade");

  const transition = doc.startViewTransition(update);
  if (glyph) animate(transition);

  transition.finished
    .finally(() => root.removeAttribute("data-theme-switching"))
    // Une transition interrompue (nouveau clic, navigation) ne doit rien signaler.
    .catch(() => {});
}

/** Ce que le bouton utilise de l'élément `<html>`. */
export type ThemeRoot = Pick<HTMLElement, "dataset">;

/** Ce que le bouton utilise de lui-même. */
export type ThemeButton = Pick<HTMLElement, "setAttribute" | "addEventListener">;

/**
 * Câble les boutons de thème : leur état pressé suit le thème courant, et un
 * clic sur l'un d'eux bascule, applique et mémorise.
 *
 * Plusieurs boutons, un seul réglage : le panneau de l'engrenage et le menu
 * replié ont chacun le leur, et tous deux doivent dire le même état.
 *
 * Chaque bouton porte `aria-pressed` et un libellé fixe (« Thème clair ») : un
 * lecteur d'écran annonce ainsi l'état, sans libellé qui change à chaque clic.
 */
export function wireThemeToggle<Button extends ThemeButton>(
  buttons: readonly Button[],
  root: ThemeRoot,
  getStore: () => ThemeStore,
  signal: AbortSignal,
  /**
   * Enrobe le changement, par exemple dans `withViewTransition`. Reçoit le
   * bouton cliqué, d'où la transition peut partir.
   */
  transition: (update: () => void, button: Button) => void = (update) => update(),
): void {
  const current = (): Theme => (root.dataset.theme === "light" ? "light" : "dark");

  const apply = (theme: Theme) => {
    root.dataset.theme = theme;
    for (const button of buttons) button.setAttribute("aria-pressed", String(theme === "light"));
  };

  apply(current());

  for (const button of buttons) {
    button.addEventListener(
      "click",
      () => {
        const next = toggledTheme(current());
        transition(() => apply(next), button);
        saveTheme(getStore, next);
      },
      { signal },
    );
  }
}
