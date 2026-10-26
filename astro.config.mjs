// @ts-check
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import { satteri } from '@astrojs/markdown-satteri';

import { satteriFrenchSpacing } from './src/lib/typography.ts';

import { satteriExternalLinks } from './src/lib/external-links.ts';

// https://astro.build/config
export default defineConfig({
  // Publié par GitHub Pages sous un domaine à soi : le site vit à la racine,
  // sans `base`. `site` sert aux URL absolues (canonique, image d'aperçu). Tout
  // lien interne passe quand même par `url()` (src/lib/url.ts), qui suivrait
  // une `base` si le site retournait dans un sous-dossier.
  site: 'https://damien-aravena.fr',

  integrations: [
    icon(),
    // Plan du site pour les moteurs de recherche, publié en
    // /sitemap-index.xml et annoncé par /robots.txt (src/pages/robots.txt.ts).
    // Chaque page y renvoie à sa version dans l'autre langue, comme les
    // `hreflang` de BaseLayout : le français à la racine, l'anglais sous /en.
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-FR', en: 'en-US' },
      },
    }),
  ],

  // Espace insécable devant « ; : ? ! » dans le corps des fiches, comme dans
  // les données (src/lib/typography.ts) : un signe ne part plus seul à la ligne.
  // Les liens vers un autre site s'y ouvrent dans un nouvel onglet, flèche à
  // l'appui (src/lib/external-links.ts).
  markdown: {
    processor: satteri({
      mdastPlugins: [satteriFrenchSpacing],
      hastPlugins: [satteriExternalLinks],
    }),
  },

  // Le même en-tête que GitHub Pages, sur toutes ses réponses. La démo
  // jouable tourne dans une iframe en bac à sable, d'origine « null » : sans
  // lui, `astro dev` et `astro preview` lui refuseraient ses polices.
  server: {
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  vite: {
    plugins: [tailwindcss(), publicDirectoryIndex()]
  }
});

/**
 * Sert `public/` sous `astro dev` comme GitHub Pages et `astro preview` :
 *
 * - l'`index.html` d'un dossier sous l'adresse du dossier (`/demos/arrow-block/`
 *   tombait sur une 404) ;
 * - ses fichiers à l'iframe en bac à sable de la démo, d'origine « null » :
 *   Astro refuse en dev toute requête d'une autre origine (en-tête
 *   `Sec-Fetch-Site`), ce qui privait la démo de son script et de sa feuille de
 *   style. Un fichier de `public/` part tel quel, sans rien du code source : on
 *   retire l'en-tête pour lui seul.
 *
 * @returns {import('vite').Plugin}
 */
function publicDirectoryIndex() {
  return {
    name: 'public-directory-index',
    apply: 'serve',
    configureServer(server) {
      /** @param {string} path */
      const inPublic = (path) => existsSync(join(server.config.publicDir, decodeURIComponent(path)));

      // Après les intergiciels d'Astro, et placé devant eux.
      return () => {
        server.middlewares.stack.unshift({
          route: '',
          handle(req, _res, next) {
            const [path, query] = (req.url ?? '').split(/(?=\?)/);
            if (path.endsWith('/') && inPublic(join(path, 'index.html'))) {
              req.url = `${path}index.html${query ?? ''}`;
            }
            if (!path.endsWith('/') && inPublic(path)) {
              delete req.headers['sec-fetch-site'];
            }
            next();
          },
        });
      };
    },
  };
}
