import { afterNavigation, expect, navLink, test } from "./helpers";

/**
 * Le bouton de thème : sombre par défaut, clair au clic, et un choix qui tient
 * au rechargement comme à la navigation.
 */

const html = (page: import("@playwright/test").Page) => page.locator("html");
const toggle = (page: import("@playwright/test").Page) => page.locator("[data-theme-toggle]");
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
