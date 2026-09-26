// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Publié en tant que project page GitHub Pages : le site vit dans /portfolio.
  // `site` sert aux URL absolues (canonique, image d'aperçu) ; `base` doit
  // suivre le nom du dépôt, et tout lien interne passe par `url()` pour
  // l'inclure (src/lib/url.ts).
  site: 'https://aravenad.github.io',
  base: '/portfolio',

  integrations: [icon()],

  vite: {
    plugins: [tailwindcss()]
  }
});