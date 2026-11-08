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
  await expect(page).toHaveURL(/\/projects$/);
  await expect(html(page)).toHaveAttribute("data-theme", "light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
});

/**
 * Luminosité moyenne des glyphes peints sur la trame du fond, dans la partie
 * visible : claire en sombre, foncée en clair. `null` si rien n'est peint.
 */
const encre = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-glyph-field] canvas")!;
    const hauteur = Math.min(canvas.height, Math.round(innerHeight * devicePixelRatio));
    const { data } = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, hauteur);
    let somme = 0;
    let nombre = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      somme += data[i] + data[i + 1] + data[i + 2];
      nombre++;
    }
    return nombre ? somme / nombre / 3 : null;
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
  await expect.poll(() => encre(page)).toBeGreaterThan(128);
  await noter(page);

  await toggle(page).click();
  await finie(page);
  expect(await vu(page)).toEqual({ drapeaux: ["glyph", null], front: true });

  // Ensuite, ni toile ni masque ne traînent.
  await expect(page.locator("[data-theme-front]")).toHaveCount(0);
  expect(await page.evaluate(() => document.adoptedStyleSheets.length)).toBe(feuilles);

  // La trame, figée pendant la course, a été repeinte aux couleurs du clair.
  await expect.poll(() => encre(page)).toBeLessThan(128);
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
