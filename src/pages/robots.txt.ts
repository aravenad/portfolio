import type { APIRoute } from "astro";
import { url } from "../lib/url";

/**
 * Tout le site est ouvert aux robots ; le fichier sert surtout à leur indiquer
 * le plan du site généré par @astrojs/sitemap. Écrit ici plutôt que dans
 * public/ : l'adresse du plan suit `site` et `base` au lieu d'être recopiée.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(url("/sitemap-index.xml"), site);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL}\n`);
};
