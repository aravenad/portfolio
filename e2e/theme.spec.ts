import { afterNavigation, expect, navLink, openSettings, test } from "./helpers";

/**
 * L'interrupteur de thème, dans le panneau des réglages : sombre par défaut,
 * clair au clic, et un choix qui tient au rechargement comme à la navigation.
 */

const html = (page: import("@playwright/test").Page) => page.locator("html");
const toggle = (page: import("@playwright/test").Page) =>
  page.locator("#settings-panel [data-theme-toggle]");
const stored = (page: import("@playwright/test").Page) =>
  page.evaluate(() => localStorage.getItem("theme"));

test("le sombre est le thème par défaut", async ({ page }) => {
  await page.goto("");

  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
});

test("le clair s'active, se mémorise et se retire", async ({ page }) => {
  await page.goto("");
  const darkBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  await openSettings(page);
  await toggle(page).click();
  await expect(html(page)).toHaveAttribute("data-theme", "light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  expect(await stored(page)).toBe("light");
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .not.toBe(darkBackground);

  await toggle(page).click();
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  expect(await stored(page)).toBe("dark");
});

test("le thème choisi survit au rechargement et à la navigation", async ({ page }) => {
  await page.goto("");
  await openSettings(page);
  await toggle(page).click();
  await expect(html(page)).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(html(page)).toHaveAttribute("data-theme", "light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");

  // Le routeur recopie les attributs de <html> depuis la page entrante, qui
  // n'a pas de thème : sans le report, on repasserait en sombre ici.
  await afterNavigation(page, () => navLink(page, "Projets").click());
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(html(page)).toHaveAttribute("data-theme", "light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
});

/**
 * Part des pixels pleins de la trame du fond, dans sa partie visible, qui
 * portent une teinte de la palette du thème actif (`--glyph-*`). Les tuiles
 * sont copiées sans mise à l'échelle : un pixel plein a la couleur exacte de
 * sa teinte. Une moyenne de luminosité ne suffirait pas : elle dépend du
 * rendu des polices, qui varie d'un système à l'autre.
 */
const accord = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const sonde = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const palette = ["nuit", "abysse", "cobalt", "azur", "ciel", "givre", "cendre"].map((teinte) => {
      sonde.clearRect(0, 0, 1, 1);
      sonde.fillStyle = style.getPropertyValue(`--glyph-${teinte}`).trim();
      sonde.fillRect(0, 0, 1, 1);
      return [...sonde.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    });

    const canvas = document.querySelector<HTMLCanvasElement>("[data-glyph-field] canvas")!;
    const hauteur = Math.min(canvas.height, Math.round(innerHeight * devicePixelRatio));
    const { data } = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, hauteur);
    let pleins = 0;
    let justes = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 255) continue;
      pleins++;
      const proche = ([r, g, b]: number[]) =>
        Math.abs(data[i] - r) + Math.abs(data[i + 1] - g) + Math.abs(data[i + 2] - b) <= 6;
      if (palette.some(proche)) justes++;
    }
    return pleins ? justes / pleins : 0;
  });

/**
 * Note, à partir de maintenant, chaque valeur prise par le drapeau de la
 * transition et si la toile du front est apparue. Une transition ne dure
 * qu'une seconde ou moins : guetter un état, une machine chargée le laisserait
 * filer.
 */
const noter = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const root = document.documentElement;
    const vu = { drapeaux: [] as (string | null)[], front: false };
    Object.assign(window, { __vu: vu });
    new MutationObserver(() => vu.drapeaux.push(root.getAttribute("data-theme-switching"))).observe(
      root,
      { attributeFilter: ["data-theme-switching"] },
    );
    new MutationObserver(() => {
      vu.front ||= document.querySelector("[data-theme-front]") !== null;
    }).observe(document.body, { childList: true });
  });

const vu = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as unknown as { __vu: unknown }).__vu);

/** Attend la fin de la transition : plus de drapeau sur <html>. */
const finie = (page: import("@playwright/test").Page) =>
  expect(html(page)).not.toHaveAttribute("data-theme-switching", /.*/, { timeout: 3000 });

test("un front de glyphes imprime le nouveau thème, puis tout est rangé", async ({ page }) => {
  await page.goto("");
  await openSettings(page);
  const feuilles = await page.evaluate(() => document.adoptedStyleSheets.length);
  // Au départ, la trame est peinte aux couleurs du sombre.
  await expect.poll(() => accord(page)).toBeGreaterThan(0.9);
  await noter(page);

  await toggle(page).click();
  await finie(page);
  expect(await vu(page)).toEqual({ drapeaux: ["glyph", null], front: true });

  // Ensuite, ni toile ni masque ne traînent.
  await expect(page.locator("[data-theme-front]")).toHaveCount(0);
  expect(await page.evaluate(() => document.adoptedStyleSheets.length)).toBe(feuilles);

  // La trame, figée pendant la course, a été repeinte aux couleurs du clair.
  await expect.poll(() => accord(page)).toBeGreaterThan(0.9);
});

test("sous prefers-reduced-motion, le thème change par un simple fondu", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("");
  await openSettings(page);
  await noter(page);

  await toggle(page).click();
  await finie(page);
  await expect(html(page)).toHaveAttribute("data-theme", "light");
  expect(await vu(page)).toEqual({ drapeaux: ["fade", null], front: false });
});
