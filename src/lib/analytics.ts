/**
 * La mesure d'audience, par GoatCounter, sans cookie ni script tiers.
 *
 * Plutôt que de charger `count.js` depuis les serveurs de GoatCounter, le site
 * envoie lui-même la requête que ce script enverrait : une image de 1 pixel,
 * dont l'adresse porte la page vue (`/count?p=…`, l'API documentée de
 * GoatCounter). Rien n'est stocké chez le visiteur pour cela.
 *
 * Une visite n'est comptée que sur le vrai domaine : ni le serveur de dev, ni
 * l'aperçu du build, ni les tests de bout en bout n'envoient rien. Elle ne
 * l'est pas non plus si le navigateur demande de ne pas être suivi (Global
 * Privacy Control, Do Not Track), ni si le visiteur l'a refusée depuis les
 * mentions légales.
 */

/**
 * Le domaine où compter et l'adresse du compteur, qui porte le code du compte
 * GoatCounter. Ils vivent ici plutôt que dans `site.ts` : le script de
 * BaseLayout les importe sans embarquer tout l'objet `site` dans le JavaScript
 * du visiteur. Un test vérifie que le domaine reste celui de `site.registrar`.
 */
export const COUNT_DOMAIN = "damien-aravena.fr";
export const COUNT_ENDPOINT = "https://damien-aravena.goatcounter.com/count";

/**
 * Clé du refus dans `localStorage`, la même que celle de `count.js` : une
 * exclusion posée depuis le tableau de bord de GoatCounter vaut aussi ici.
 */
export const SKIP_KEY = "skipgc";

/** Valeur de `SKIP_KEY` quand le visiteur ne veut pas être compté. */
const SKIPPED = "t";

/** Ce que le compteur lit du navigateur pour décider. */
export interface CountContext {
  hostname: string;
  /** Le domaine où compter, celui du site publié. */
  domain: string;
  /** La valeur de `SKIP_KEY`, ou null. */
  skip: string | null;
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
  /** Vrai sous un navigateur piloté (Playwright, Selenium…). */
  webdriver?: boolean;
}

/** Compter cette page vue, ou non. */
export function shouldCount(context: CountContext): boolean {
  if (context.hostname !== context.domain) return false;
  if (context.skip === SKIPPED) return false;
  if (context.doNotTrack === "1" || context.globalPrivacyControl) return false;
  return !context.webdriver;
}

/** Une page vue, telle que GoatCounter la reçoit. */
export interface PageView {
  path: string;
  title: string;
  /** La page d'où vient le visiteur, vide pour une navigation interne. */
  referrer: string;
  /** La largeur d'écran, que GoatCounter range par taille d'appareil. */
  width: number;
  /** Un nombre au hasard, pour qu'aucun cache ne serve l'image deux fois. */
  random: string;
}

/**
 * La page d'où vient le visiteur, seulement si elle est hors du site : un lien
 * interne n'est pas une provenance. Seule la première page vue d'une visite en
 * a une ; les suivantes, servies par le routeur, n'en ont pas.
 *
 * Minimisation (RGPD, art. 5.1.c) : seuls le site et le chemin partent. Les
 * paramètres et l'ancre, qui peuvent porter un identifiant ou une recherche,
 * restent chez le visiteur.
 */
export function externalReferrer(referrer: string, domain: string): string {
  if (!referrer) return "";
  try {
    const url = new URL(referrer);
    if (url.hostname === domain) return "";
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

/** L'adresse de l'image qui compte la page vue. */
export function countUrl(endpoint: string, view: PageView): string {
  const params = new URLSearchParams({
    p: view.path,
    t: view.title,
    r: view.referrer,
    s: String(view.width),
    rnd: view.random,
  });
  return `${endpoint}?${params}`;
}

/** Ce que l'interrupteur des mentions légales utilise du stockage. */
export type SkipStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Le visiteur accepte-t-il d'être compté ? Oui tant qu'il n'a pas refusé. */
export function isCounted(getStore: () => SkipStore): boolean {
  try {
    return getStore().getItem(SKIP_KEY) !== SKIPPED;
  } catch {
    // Stockage refusé : rien n'a pu être refusé non plus.
    return true;
  }
}

/**
 * Mémorise le choix. En navigation privée, le stockage peut refuser : le refus
 * ne tiendrait alors pas, et l'interrupteur le dit en restant sur « compté ».
 */
export function saveCounted(getStore: () => SkipStore, counted: boolean): boolean {
  try {
    if (counted) getStore().removeItem(SKIP_KEY);
    else getStore().setItem(SKIP_KEY, SKIPPED);
    return counted;
  } catch {
    return true;
  }
}
