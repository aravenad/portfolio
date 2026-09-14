// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Publié en tant que project page GitHub Pages : le site vit dans /portfolio.
  site: 'https://aravenad.github.io',
  base: '/portfolio',

  integrations: [icon()],

  vite: {
    plugins: [tailwindcss()]
  }
});