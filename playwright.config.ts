import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout : le site construit, servi sous `/portfolio`, dans un
 * vrai Chromium. Ils couvrent ce que Vitest ne voit pas — les `<script>` des
 * composants, qui relient les règles de `src/lib/` au DOM (voir §5 de
 * docs/ARCHITECTURE.md).
 *
 * Deux gabarits : le bureau lance tout sauf `mobile.spec.ts`, le mobile ne
 * lance que lui. Un même test sur les deux doublerait la durée sans rien
 * vérifier de plus.
 */
const port = 4321;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Plafonné : au-delà, les navigateurs se disputent le processeur et Chrome
  // abandonne des défilements doux en route (mesuré avec 10 workers). La CI,
  // avec 2 workers par défaut, n'y est pas exposée.
  workers: 4,
  forbidOnly: !!process.env.CI,
  // Une relance absorbe un aléa de la machine de CI ; un vrai bug échoue deux fois.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",

  use: {
    // Toujours avec la barre finale : `page.goto("projects")` résout alors
    // en /portfolio/projects, pas en /projects.
    baseURL: `http://localhost:${port}/portfolio/`,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "mobile.spec.ts",
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: "mobile.spec.ts",
    },
  ],

  // Le build de production, pas le serveur de dev : c'est lui qui est publié,
  // et les scripts y sont regroupés autrement.
  //
  // `--ignore-lock` garde `astro preview` au premier plan. Sans lui, Astro 7 le
  // passe en arrière-plan quand il se croit lancé par un outil automatisé et
  // rend la main aussitôt — Playwright croit alors que le serveur est tombé.
  webServer: {
    command: `npm run build && npm run preview -- --port ${port} --ignore-lock`,
    url: `http://localhost:${port}/portfolio/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
