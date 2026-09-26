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

/** Ce que le bouton utilise de l'élément `<html>`. */
export type ThemeRoot = Pick<HTMLElement, "dataset">;

/** Ce que le bouton utilise de lui-même. */
export type ThemeButton = Pick<HTMLElement, "setAttribute" | "addEventListener">;

/**
 * Câble le bouton de thème : son état pressé suit le thème courant, et un clic
 * bascule, applique et mémorise.
 *
 * Le bouton porte `aria-pressed` et un libellé fixe (« Thème clair ») : un
 * lecteur d'écran annonce ainsi l'état, sans libellé qui change à chaque clic.
 */
export function wireThemeToggle(
  button: ThemeButton,
  root: ThemeRoot,
  getStore: () => ThemeStore,
  signal: AbortSignal,
): void {
  const current = (): Theme => (root.dataset.theme === "light" ? "light" : "dark");

  const apply = (theme: Theme) => {
    root.dataset.theme = theme;
    button.setAttribute("aria-pressed", String(theme === "light"));
  };

  apply(current());

  button.addEventListener(
    "click",
    () => {
      const next = toggledTheme(current());
      apply(next);
      saveTheme(getStore, next);
    },
    { signal },
  );
}
