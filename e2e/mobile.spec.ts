import { clickInPlace, expect, navLink, test } from "./helpers";

/**
 * Sur téléphone : le menu déroulant, les réglages de la barre et le sommaire
 * replié des fiches.
 */

const toggle = (page: import("@playwright/test").Page) => page.locator("[data-nav-toggle]");
const menu = (page: import("@playwright/test").Page) => page.locator("#nav-menu");

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

test("le menu s'ouvre et se referme au bouton comme à Échap", async ({ page }) => {
  await expect(menu(page)).toBeHidden();
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");

  await toggle(page).click();
  await expect(menu(page)).toBeVisible();
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
  await expect(toggle(page)).toHaveAttribute("aria-label", "Fermer le menu");

  await toggle(page).click();
  await expect(menu(page)).toBeHidden();
  await expect(toggle(page)).toHaveAttribute("aria-label", "Ouvrir le menu");

  await toggle(page).click();
  await page.keyboard.press("Escape");
  await expect(menu(page)).toBeHidden();
  await expect(toggle(page)).toBeFocused();
});

test("choisir une section referme le menu et y mène", async ({ page }) => {
  await toggle(page).click();

  await clickInPlace(page, navLink(page, "Parcours"));

  await expect(menu(page)).toBeHidden();
  await expect(page.locator("#career")).toBeInViewport();
});

test("les réglages de langue et de thème restent accessibles", async ({ page }) => {
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.locator("a[data-lang-switch]").click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test("le sommaire replié se referme sur la section choisie", async ({ page }) => {
  await page.goto("projects/developpement-application");
  const details = page.locator("[data-toc-details]");
  await expect(page.locator('nav[data-toc="sidebar"]')).toBeHidden();

  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open");

  const link = details.locator("a").nth(2);
  const target = (await link.getAttribute("href"))!;
  await link.click();

  await expect(details).not.toHaveAttribute("open");
  await expect(page.locator(target)).toBeInViewport();
});
