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

test.describe("accueil allégé", () => {
  const visibleParagraphs = (page: import("@playwright/test").Page) =>
    page.locator("#about .read-more-text > p:visible");

  test("« Lire la suite » déplie le texte, « Réduire » le replie sous les yeux", async ({ page }) => {
    const button = page.locator("#about [data-read-more] > button");
    await expect(visibleParagraphs(page)).toHaveCount(1);
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await button.click();
    await expect(visibleParagraphs(page)).toHaveCount(4);
    await expect(button).toHaveText(/Réduire/);

    // Replier depuis le bas du texte : le début doit revenir à l'écran, au
    // lieu de laisser le lecteur loin plus bas, dans la section suivante.
    await button.click();
    await expect(visibleParagraphs(page)).toHaveCount(1);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#about .read-more-text > p").first()).toBeInViewport();
  });

  test("les compétences passent en pastilles, qui prennent leur couleur au toucher", async ({ page }) => {
    await expect(page.locator(".skill-tile").first()).toBeHidden();

    const java = page.locator(".skill-chip", { hasText: /^Java$/ });
    await java.scrollIntoViewIfNeeded();
    await java.tap();

    // Le bleu Java de skills.ts (#007396).
    await expect(java.locator("svg")).toHaveCSS("color", "rgb(0, 115, 150)");
  });

  test("les boutons du hero s'empilent, de la même largeur", async ({ page }) => {
    // Côte à côte, « Voir mes projets » et « Me contacter » ne font pas la même
    // largeur : l'égalité dit qu'ils sont bien empilés en pleine largeur.
    const hero = page.locator("section").first().locator("a");
    const [first, second] = [await hero.nth(0).boundingBox(), await hero.nth(1).boundingBox()];

    expect(first!.width).toBe(second!.width);
  });

  test.describe("sur un écran de 360 px", () => {
    // Le Pixel 7 en fait 412 : le titre y tient en entier, et la pastille ne s'y
    // est jamais coupée. C'est à 360 px qu'elle tombait en « À » / « venir ».
    test.use({ viewport: { width: 360, height: 780 } });

    test("la pastille « À venir » du parcours ne se coupe pas", async ({ page }) => {
      await page.goto("");
      const badge = page.locator("#career h3 span", { hasText: "À venir" });
      await badge.scrollIntoViewIfNeeded();

      // Coupée sur deux lignes, une boîte en ligne compte un rectangle par ligne.
      expect(await badge.evaluate((element) => element.getClientRects().length)).toBe(1);
    });

    test("LinkedIn et GitHub restent sur la même ligne", async ({ page }) => {
      await page.goto("");
      const contact = page.locator("#contact");
      await contact.scrollIntoViewIfNeeded();

      const linkedin = await contact.locator('a[href*="linkedin"]').boundingBox();
      const github = await contact.locator('a[href*="github"]').boundingBox();
      expect(linkedin!.y).toBe(github!.y);
    });
  });

  test("les cartes de projets passent en ligne, vignette à gauche", async ({ page }) => {
    await page.goto("projects");
    const card = page.locator("main a[href*='/projects/']").filter({ has: page.locator("h3") }).first();

    const cover = (await card.locator(".project-cover").boundingBox())!;
    const title = (await card.locator("h3").boundingBox())!;
    expect(cover.x + cover.width).toBeLessThanOrEqual(title.x);
    await expect(card.locator(".flex-wrap")).toBeHidden();
  });
});
