import { afterNavigation, expect, test } from "./helpers";

/**
 * Les liens du pied de page. Le plan du site, les mentions légales et la
 * déclaration d'accessibilité sont des pages à part ; le script du pied de
 * page n'ajoute qu'une chose, vérifiée ici : la page d'arrivée s'ouvre en
 * haut, même quand on a suivi le lien depuis le bas de la page.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

test("le plan du site mène à sa page, d'où l'on rejoint un projet", async ({ page }) => {
  await afterNavigation(page, () =>
    page.locator("footer").getByRole("link", { name: "Plan du site", exact: true }).click(),
  );

  await expect(page).toHaveURL(/\/sitemap$/);
  await expect(page.locator("h1")).toHaveText("Plan du site");

  const project = page.locator('article a[href*="/projects/"]').first();
  const href = await project.getAttribute("href");

  await afterNavigation(page, () => project.click());
  await expect(page).toHaveURL(new RegExp(`${href}$`));
});

test.describe("en partant du bas de la page", () => {
  // Le pied de page est conservé d'une page à l'autre, et le routeur rendait le
  // focus au lien suivi : la page d'arrivée défilait alors jusqu'en bas.
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
  });

  for (const [name, path] of [
    ["Mentions légales", "legal"],
    ["Plan du site", "sitemap"],
  ]) {
    test(`le lien « ${name} » mène en haut de la page`, async ({ page }) => {
      await afterNavigation(page, () =>
        page.locator("footer").getByRole("link", { name, exact: true }).click(),
      );

      await expect(page).toHaveURL(new RegExp(`/${path}$`));
      // Assez pour qu'un défilement doux vers le bas ait eu le temps de partir.
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
  }
});
