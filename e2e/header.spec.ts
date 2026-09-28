import {
  afterNavigation,
  clickInPlace,
  expect,
  navLink,
  scrollToId,
  scrollToY,
  scrollY,
  test,
} from "./helpers";

/**
 * La barre du haut, sur bureau : liens, lien actif, état « défilé » et logo.
 * Le menu mobile est dans mobile.spec.ts.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

// Régression : un `-z-10` prévu pour le panneau mobile faisait passer les liens
// derrière la barre, qui prenait leurs clics. `clickInPlace()` attend que le
// point visé appartienne au lien, ce qui suffit à le détecter.
test("les liens de la barre sont cliquables, en haut de page comme après défilement", async ({
  page,
}) => {
  await clickInPlace(page, navLink(page, "Parcours"));
  await expect(page).toHaveURL(/#career$/);
  await expect(page.locator("#career")).toBeInViewport();

  await scrollToY(page, 2500);
  await expect(page.locator("header")).toHaveAttribute("data-scrolled");
  await expect(navLink(page, "Contact")).toBeVisible();

  await clickInPlace(page, navLink(page, "Contact"));
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});

test("la barre prend son fond en descendant et le perd en haut de page", async ({ page }) => {
  const header = page.locator("header");
  await expect(header).not.toHaveAttribute("data-scrolled");

  await scrollToY(page, 800);
  await expect(header).toHaveAttribute("data-scrolled");

  await scrollToY(page, 0);
  await expect(header).not.toHaveAttribute("data-scrolled");
});

test("le lien de la section en cours de lecture s'allume", async ({ page }) => {
  await scrollToId(page, "career");
  await expect(navLink(page, "Parcours")).toHaveAttribute("data-active");
  await expect(navLink(page, "Compétences")).not.toHaveAttribute("data-active");

  // Les compétences transversales relèvent du même lien que les techniques.
  await scrollToId(page, "soft-skills");
  await expect(navLink(page, "Compétences")).toHaveAttribute("data-active");
  await expect(navLink(page, "Parcours")).not.toHaveAttribute("data-active");
});

test("le logo remonte en haut de l'accueil sans recharger la page", async ({ page }) => {
  await page.goto("#career");
  await expect(page.locator("#career")).toBeInViewport();

  await clickInPlace(page, page.locator("[data-home-link]"));

  await expect.poll(() => scrollY(page)).toBe(0);
  expect(new URL(page.url()).hash).toBe("");
  expect(await page.evaluate(() => window.__pageLoads)).toBe(1);
});

test("la page courante est marquée dans la barre", async ({ page }) => {
  await page.goto("projects");
  await expect(navLink(page, "Projets")).toHaveAttribute("aria-current", "page");

  // Sur une fiche, le lien de la liste reste marqué, mais comme parent.
  await page.goto("projects/developpement-application");
  await expect(navLink(page, "Projets")).toHaveAttribute("aria-current", "true");
});

test("une ancre de l'accueil atteinte depuis une autre page est rejointe", async ({ page }) => {
  await page.goto("projects");

  await afterNavigation(page, () => clickInPlace(page, navLink(page, "Contact")));

  await expect(page).toHaveURL(/:\d+\/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});
