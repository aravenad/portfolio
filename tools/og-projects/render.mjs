/**
 * Rend la carte d'aperçu de chaque projet, dans chaque langue, en JPEG :
 * src/assets/og/<langue>/<fiche>.jpg. À relancer après avoir ajouté un projet
 * ou changé son titre, son équipe, son année ou sa couverture :
 *
 *   npm run og
 *
 * Démarre son propre `astro dev`, seul à servir les cartes
 * (tools/og-projects/Card.astro), et les capture dans le Chromium de
 * Playwright (`npx playwright install chromium` au besoin). Rendues à 2×,
 * comme public/og-v5.png : LinkedIn réduit l'image, elle doit rester nette.
 *
 * Les images sont importées par src/lib/og.ts, et Vite leur donne une empreinte dans
 * leur nom : une carte modifiée change d'URL, et LinkedIn la retélécharge.
 */
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";
import { dev } from "astro";

const root = fileURLToPath(new URL("../../", import.meta.url));
const content = join(root, "src/content/projects");
const out = join(root, "src/assets/og");

/** Les fiches d'une langue : le nom de leur fichier, sans l'extension. */
async function slugs(dir) {
  return (await readdir(dir)).filter((file) => file.endsWith(".md")).map((file) => file.slice(0, -3));
}

const cards = [
  ...(await slugs(content)).map((slug) => ({ lang: "fr", slug })),
  ...(await slugs(join(content, "en"))).map((slug) => ({ lang: "en", slug })),
];

// Sans la barre d'outils de développement, qui se poserait en bas de la carte.
const server = await dev({
  root,
  logLevel: "warn",
  server: { port: 4329 },
  devToolbar: { enabled: false },
});
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
    // La trame, figée : la même image à chaque rendu.
    reducedMotion: "reduce",
  });

  /*
   * Un premier passage pour rien : à la première visite, Vite découvre les
   * dépendances du client, les optimise et recharge la page, ce qui couperait
   * la capture en cours.
   */
  const url = ({ lang, slug }) => `http://localhost:4329/__og/${lang}/${slug}/`;
  await page.goto(url(cards[0]));
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  for (const card of cards) {
    const { lang, slug } = card;
    const response = await page.goto(url(card), { waitUntil: "networkidle" });
    if (!response?.ok()) throw new Error(`${lang}/${slug} : HTTP ${response?.status()}`);

    // Les polices, puis la trame de la couverture, peinte une fois sa matière chargée.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => {
      const canvas = document.querySelector("[data-glyph-cover]");
      return canvas instanceof HTMLCanvasElement && canvas.width > 0;
    });
    await page.waitForTimeout(300);

    await mkdir(join(out, lang), { recursive: true });
    /*
     * En JPEG : la trame est un bruit fin que le PNG ne sait pas compresser
     * (1,4 Mo par carte, contre ~300 Ko ici). LinkedIn réencode de toute façon.
     */
    await page.screenshot({ path: join(out, lang, `${slug}.jpg`), type: "jpeg", quality: 88 });
    console.log(`og/${lang}/${slug}.jpg`);
  }
} finally {
  await browser.close();
  await server.stop();
}
