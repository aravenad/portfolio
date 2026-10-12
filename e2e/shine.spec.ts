import { afterNavigation, expect, navLink, openSettings, test } from "./helpers";

/**
 * Le reflet des titres chromés tourne en boucle : l'interrupteur du panneau de
 * réglages doit pouvoir l'arrêter et le relancer (RGAA 13.8), et le choix tenir
 * au rechargement comme à la navigation.
 */

const html = (page: import("@playwright/test").Page) => page.locator("html");
const toggle = (page: import("@playwright/test").Page) =>
  page.locator("#settings-panel [data-shine-toggle]");
const stored = (page: import("@playwright/test").Page) =>
  page.evaluate(() => localStorage.getItem("shine"));
const animation = (page: import("@playwright/test").Page) =>
  page.locator("h1 .text-chrome").evaluate((title) => getComputedStyle(title).animationName);

test("le reflet tourne par défaut", async ({ page }) => {
  await page.goto("");

  await expect(html(page)).toHaveAttribute("data-shine", "on");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => animation(page)).toBe("text-chrome-shine");
});

test("le reflet s'arrête, se mémorise et repart", async ({ page }) => {
  await page.goto("");
  await openSettings(page);

  await toggle(page).click();
  await expect(html(page)).toHaveAttribute("data-shine", "off");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => animation(page)).toBe("none");
  expect(await stored(page)).toBe("off");

  await toggle(page).click();
  await expect(html(page)).toHaveAttribute("data-shine", "on");
  await expect.poll(() => animation(page)).toBe("text-chrome-shine");
  expect(await stored(page)).toBe("on");
});

test("l'arrêt survit au rechargement et à la navigation", async ({ page }) => {
  await page.goto("");
  await openSettings(page);
  await toggle(page).click();
  await expect(html(page)).toHaveAttribute("data-shine", "off");

  await page.reload();
  await expect(html(page)).toHaveAttribute("data-shine", "off");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");

  // Comme pour le thème : le routeur recopierait les attributs de la page entrante.
  await afterNavigation(page, () => navLink(page, "Projets").click());
  await expect(page).toHaveURL(/\/projects$/);
  await expect(html(page)).toHaveAttribute("data-shine", "off");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
});

test.describe("avec moins d'animations demandées par le système", () => {
  test.use({ reducedMotion: "reduce" });

  test("le reflet part arrêté, et peut quand même être lancé", async ({ page }) => {
    await page.goto("");
    await expect(html(page)).toHaveAttribute("data-shine", "off");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");

    await openSettings(page);
    await toggle(page).click();
    await expect(html(page)).toHaveAttribute("data-shine", "on");
  });
});
