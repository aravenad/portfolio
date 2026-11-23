import { createHash } from "node:crypto";

import { COUNT_ENDPOINT } from "./analytics";

/**
 * La politique de sécurité du contenu (CSP) du site.
 *
 * GitHub Pages ne permet aucun en-tête HTTP : la politique passe par une
 * balise `<meta>` (BaseLayout.astro), qui ignore `frame-ancestors`,
 * `report-uri` et `sandbox`.
 *
 * Elle se pose en deux temps :
 *
 * - la page rendue porte `BASE_POLICY`, des directives qui ne dépendent de
 *   rien. C'est tout ce que voit `astro dev`, dont Vite injecte des scripts en
 *   ligne à chaque rechargement ;
 * - une fois le site construit, `sitePolicy()` la remplace dans chaque page
 *   (intégration `contentSecurityPolicy` d'astro.config.mjs) : scripts du
 *   site seulement, et les scripts en ligne autorisés un par un, par leur
 *   empreinte SHA-256.
 *
 * La CSP intégrée d'Astro (`security.csp`) ferait ce second temps, mais sa
 * documentation exclut `<ClientRouter />`. La raison vaut aussi ici : le
 * routeur change de page sans recharger le document, et la politique du
 * premier document reste la seule appliquée. Les scripts en ligne de la page
 * suivante doivent donc y figurer déjà. D'où une politique unique pour tout le
 * site, qui réunit les empreintes de toutes les pages.
 */

/** Ce que la page rendue déclare déjà, et que la version construite garde. */
export const BASE_POLICY = "base-uri 'self'; object-src 'none'; form-action 'none'";

/** La balise que BaseLayout pose et que le build complète. */
const META = /<meta http-equiv="content-security-policy" content="[^"]*"\s*\/?>/;

/**
 * Le code des scripts en ligne que le navigateur exécute.
 *
 * Un script à `src` relève de `'self'`, et un bloc de données (JSON-LD) n'est
 * jamais exécuté : ni l'un ni l'autre n'a besoin d'empreinte.
 */
export function inlineScripts(html: string): string[] {
  const scripts: string[] = [];

  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\ssrc=/.test(attributes)) continue;
    const type = attributes.match(/\stype="([^"]*)"/)?.[1].trim().toLowerCase();
    if (type && type !== "module" && type !== "text/javascript") continue;
    scripts.push(body);
  }

  return scripts;
}

/** L'empreinte d'un script, telle que `script-src` l'attend. */
export function scriptHash(code: string): string {
  return `'sha256-${createHash("sha256").update(code, "utf8").digest("base64")}'`;
}

/**
 * La politique du site construit, pour ces empreintes.
 *
 * - `default-src 'self'` : polices, requêtes du routeur, iframe de la démo,
 *   tout vient du site ;
 * - `script-src` : les fichiers du site et les scripts en ligne connus, rien
 *   d'autre. C'est la directive qui arrête un script injecté ;
 * - `style-src 'unsafe-inline'` : des centaines d'attributs `style` (variables
 *   CSS des composants) et les `<style>` qu'Astro met en ligne. Une empreinte
 *   n'y suffirait pas : dès qu'il en voit une, le navigateur ignore
 *   `'unsafe-inline'`, et les attributs seraient refusés ;
 * - `img-src` : les images du site, les SVG en `data:` de la feuille de style
 *   et le pixel de comptage de GoatCounter (src/lib/analytics.ts).
 */
export function sitePolicy(hashes: Iterable<string>): string {
  const scripts = [...new Set(hashes)].sort();

  return [
    "default-src 'self'",
    ["script-src 'self'", ...scripts].join(" "),
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${new URL(COUNT_ENDPOINT).origin}`,
    BASE_POLICY,
  ].join("; ");
}

/** Les empreintes des scripts en ligne de ces pages. */
export function collectHashes(pages: Iterable<string>): Set<string> {
  const hashes = new Set<string>();
  for (const html of pages) {
    for (const code of inlineScripts(html)) hashes.add(scriptHash(code));
  }
  return hashes;
}

/**
 * La page avec cette politique à la place de celle qu'elle déclare, ou `null`
 * si elle n'en déclare pas : la démo et les fichiers de `public/` ne passent
 * pas par BaseLayout, et le build ne doit pas y toucher.
 */
export function withPolicy(html: string, policy: string): string | null {
  if (!META.test(html)) return null;
  return html.replace(META, `<meta http-equiv="content-security-policy" content="${policy}">`);
}
