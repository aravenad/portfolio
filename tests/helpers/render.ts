import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { parseHTML } from "linkedom";

/** Origine du site en production, pour les tests qui dépendent de l'URL. */
export const SITE_ORIGIN = "https://aravenad.github.io";

/**
 * ⚠️ `site` et `base` doivent être redonnés au conteneur : il ne lit pas
 * astro.config.mjs. Sans `site`, `new URL(…, Astro.site)` lève « Invalid URL »
 * dans BaseLayout et toute page devient irrendable.
 */
const astroConfig = { site: SITE_ORIGIN, base: "/portfolio" } as const;

/** Un conteneur configuré comme le site déployé. */
function createContainer() {
  return AstroContainer.create({ astroConfig });
}

/**
 * Rend un composant Astro et renvoie le document correspondant.
 *
 * Les assertions passent par le DOM plutôt que par la chaîne HTML : une classe
 * Tailwind déplacée ou un attribut réordonné ne doit pas casser un test qui
 * porte en réalité sur la structure. `linkedom` suffit — aucun test ici n'a
 * besoin de mise en page ni d'exécution de script.
 */
export async function render(
  Component: unknown,
  options: Parameters<AstroContainer["renderToString"]>[1] = {},
) {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Component as never, options);
  // ⚠️ Envelopper dans <html> : sans lui, linkedom construit bien un document,
  // mais `document.body` reste vide et toutes les requêtes renvoient null.
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

  return { html, document, body: document.body };
}

/** Rend un composant tel qu'il apparaîtrait sur une page donnée du site. */
export function at(pathname: string) {
  return { request: new Request(`${SITE_ORIGIN}${pathname}`) };
}

/**
 * Rend une page entière — `BaseLayout` émet un document complet, `<head>`
 * compris — et renvoie ce document tel quel.
 */
export async function renderPage(
  Component: unknown,
  options: Parameters<AstroContainer["renderToString"]>[1] = {},
) {
  // `partial: false` : sans lui le conteneur rend la page comme un fragment et
  // laisse tomber le doctype.
  const container = await createContainer();
  const html = await container.renderToString(Component as never, { partial: false, ...options });
  const { document } = parseHTML(html);

  return { html, document };
}

/** La valeur de `content` d'une balise meta, quel que soit son attribut de nom. */
export function meta(document: Document, name: string) {
  const node =
    document.querySelector(`meta[name="${name}"]`) ??
    document.querySelector(`meta[property="${name}"]`);

  return node?.getAttribute("content") ?? undefined;
}
