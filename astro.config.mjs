// @ts-check
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
    plugins: [tailwindcss()]
  }
});