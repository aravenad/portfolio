// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Publié par GitHub Pages sous un domaine à soi : le site vit à la racine,
  // sans `base`. `site` sert aux URL absolues (canonique, image d'aperçu). Tout
  // lien interne passe quand même par `url()` (src/lib/url.ts), qui suivrait
  // une `base` si le site retournait dans un sous-dossier.
  site: 'https://damien-aravena.fr',

  integrations: [icon()],

  vite: {
    plugins: [tailwindcss()]
  }
});