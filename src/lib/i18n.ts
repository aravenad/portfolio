/**
 * Les langues du site et le passage de l'une à l'autre, sans DOM.
 *
 * Le français est la langue par défaut et vit à la racine (`/portfolio/…`) ;
 * l'anglais vit sous `/portfolio/en/…`, avec exactement les mêmes chemins
 * derrière ce préfixe. C'est ce qui permet de passer d'une langue à l'autre
 * sur la même page : il suffit d'ajouter ou de retirer `/en`.
 *
 * La langue d'une page se lit dans son URL : aucun composant n'a besoin de la
 * recevoir en prop.
 */
import { url } from "./url";

export const languages = ["fr", "en"] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = "fr";

/** Le chemin sans la base du site : « /portfolio/en/projects » → « /en/projects ». */
function withoutBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;

  return path.startsWith("/") ? path : `/${path}`;
}

/** La langue d'une page, d'après son chemin complet (base comprise). */
export function getLang(pathname: string): Lang {
  const path = withoutBase(pathname);

  return path === "/en" || path.startsWith("/en/") ? "en" : defaultLang;
}

/**
 * `url()` dans une langue donnée : « /projects » devient « /portfolio/projects »
 * en français et « /portfolio/en/projects » en anglais. Les ancres de l'accueil
 * suivent la même règle (« /#contact » → « /portfolio/en/#contact »).
 */
export function localizedUrl(path: string, lang: Lang): string {
  const clean = path.startsWith("/") ? path : `/${path}`;

  return url(lang === defaultLang ? clean : `/${lang}${clean}`);
}

/**
 * La même page dans une autre langue, à partir du chemin courant.
 *
 * Le header porte `transition:persist` : il traverse les navigations d'une
 * même langue, et son lien de langue doit donc être recalculé côté client après
 * chaque page, avec cette même fonction.
 */
export function switchLangPath(pathname: string, target: Lang): string {
  const path = withoutBase(pathname);
  const neutral = getLang(pathname) === "en" ? path.slice("/en".length) || "/" : path;

  return localizedUrl(neutral, target);
}

/** Choisit la valeur de la langue demandée. */
export function localized<T>(lang: Lang, values: Record<Lang, T>): T {
  return values[lang];
}
