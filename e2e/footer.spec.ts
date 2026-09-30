import type { Page } from "@playwright/test";

import { afterNavigation, expect, test } from "./helpers";

/**
 * Le plan du site du pied de page. Son ouverture et sa fermeture sont celles
 * du navigateur (`popover`) ; le script du pied de page n'ajoute qu'une chose,
 * vérifiée ici : suivre un de ses liens le referme. Le pied de page étant
 * persisté d'une page à l'autre, le plan resterait sinon ouvert par-dessus la
 * page d'arrivée.
 */

const opener = (page: Page) =>
  page.locator("footer").getByRole("button", { name: "Plan du site", exact: true });
const siteMap = (page: Page) => page.locator("#site-map");

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

test("le plan s'ouvre depuis le pied de page, et se ferme à Échap ou par sa croix", async ({
  page,
}) => {
  await expect(siteMap(page)).toBeHidden();

  await opener(page).click();
  await expect(siteMap(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(siteMap(page)).toBeHidden();

  await opener(page).click();
  await expect(siteMap(page)).toBeVisible();
  await siteMap(page).getByRole("button", { name: "Fermer le plan du site" }).click();
  await expect(siteMap(page)).toBeHidden();
});

test("suivre un projet du plan mène à sa fiche et referme le plan", async ({ page }) => {
  await opener(page).click();
  const project = siteMap(page).locator('a[href*="/projects/"]').first();
  const href = await project.getAttribute("href");

  await afterNavigation(page, () => project.click());

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(siteMap(page)).toBeHidden();

  // Le plan se rouvre sur la nouvelle page : son script y a été recâblé.
  await opener(page).click();
  await expect(siteMap(page)).toBeVisible();
});

test("une section de l'accueil, depuis l'accueil, referme aussi le plan", async ({ page }) => {
  await opener(page).click();
  await siteMap(page).getByRole("link", { name: "Contact", exact: true }).first().click();

  await expect(siteMap(page)).toBeHidden();
  await expect(page.locator("#contact")).toBeInViewport();
});
