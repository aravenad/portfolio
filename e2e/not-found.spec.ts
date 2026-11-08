import { afterNavigation, expect, test } from "./helpers";

/**
 * La page des adresses inconnues. GitHub Pages ne sert que `404.html`, à la
 * racine, pour tout le site : le serveur de prévisualisation d'Astro fait de
 * même, ce qui permet d'éprouver l'aiguillage vers la version anglaise.
 */

// Le navigateur signale le statut 404 du document : c'est le but de la page.
test.use({ expectedErrors: [/status of 404/] });

test("une adresse inconnue répond 404, avec une page qui ramène au site", async ({ page }) => {
  const response = await page.goto("page-qui-n-existe-pas/");

  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page introuvable");
  await expect(page).toHaveURL(/\/page-qui-n-existe-pas\/$/);

  await afterNavigation(page, () => page.getByRole("link", { name: "Voir les projets" }).click());
  await expect(page).toHaveURL(/\/projects\/$/);
});

test("sous /en/, la page est en anglais et l'adresse demandée reste dans la barre", async ({
  page,
}) => {
  await page.goto("en/does-not-exist/?ref=1#top");

  await expect(page.locator("h1")).toHaveText("Page not found");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveURL(/\/en\/does-not-exist\/\?ref=1#top$/);

  await afterNavigation(page, () => page.getByRole("link", { name: "Back to home" }).click());
  await expect(page).toHaveURL(/\/en\/$/);
});
