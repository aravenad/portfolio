import { afterNavigation, clickInPlace, expect, scrollToId, test, topOf } from "./helpers";

/**
 * Le lien de langue : il mène à la même page dans l'autre langue et garde la
 * position de lecture.
 */

const langLink = (page: import("@playwright/test").Page) => page.locator("a[data-lang-switch]");

test("le lien mène à la même page dans l'autre langue, et en revient", async ({ page }) => {
  await page.goto("");
  await expect(langLink(page)).toHaveAttribute("href", "/en/");

  await afterNavigation(page, () => langLink(page).click());
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(langLink(page)).toHaveText("FR");

  await afterNavigation(page, () => langLink(page).click());
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

for (const path of ["projects", "projects/page/2", "projects/developpement-application", "legal"]) {
  test(`/${path} a son équivalent anglais`, async ({ page }) => {
    await page.goto(path);

    await afterNavigation(page, () => langLink(page).click());

    await expect(page).toHaveURL(new RegExp(`/en/${path}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
}

test("la position de lecture est gardée d'une langue à l'autre, aller et retour", async ({
  page,
}) => {
  await page.goto("");
  // Au milieu du parcours : le haut de la section est 300 px au-dessus de la fenêtre.
  await scrollToId(page, "career", 300);
  const before = await topOf(page, "career");

  await afterNavigation(page, () => clickInPlace(page, langLink(page)));

  // Les textes anglais n'ont pas la même longueur : c'est la section qui sert
  // de repère, pas la position brute.
  expect(Math.abs((await topOf(page, "career")) - before)).toBeLessThanOrEqual(2);

  // Le retour compte autant que l'aller : c'est le lien de la page d'arrivée
  // qui doit être câblé à son tour (régression : un drapeau posé sur <html>
  // portait le même attribut et lui volait le `querySelector`).
  await afterNavigation(page, () => clickInPlace(page, langLink(page)));
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  expect(Math.abs((await topOf(page, "career")) - before)).toBeLessThanOrEqual(2);

  // Les blocs à l'écran sont affichés d'emblée, sans rejouer leur apparition.
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".reveal")]
      .filter((block) => {
        const { top, bottom } = block.getBoundingClientRect();
        return bottom > 0 && top < window.innerHeight;
      })
      .filter((block) => getComputedStyle(block).opacity !== "1").length,
  );
  expect(hidden).toBe(0);
});

test("le thème est gardé en changeant de langue", async ({ page }) => {
  await page.goto("");
  await page.locator("[data-theme-toggle]").click();

  await afterNavigation(page, () => langLink(page).click());

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("[data-theme-toggle]")).toHaveAttribute("aria-pressed", "true");
});
