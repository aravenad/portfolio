import {
  afterNavigation,
  clickInPlace,
  expect,
  navLink,
  openSettings,
  scrollToId,
  scrollToY,
  scrollY,
  tabOrder,
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

test("le fil d'Ariane passe dans la barre une fois défilé sous elle, et y mène", async ({
  page,
}) => {
  await page.goto("projects/developpement-application");
  // La fiche a son propre `<header>` : la barre est le seul `banner`.
  const header = page.getByRole("banner");
  const trail = page.locator("[data-header-trail]");

  // En haut de page, le fil de la page suffit : celui de la barre reste caché.
  await expect(header).not.toHaveAttribute("data-trail");
  await expect(trail.getByRole("link", { name: "Projets" })).toBeHidden();

  await scrollToY(page, 600);
  await expect(header).toHaveAttribute("data-trail");
  await expect(page.locator("[data-home-link]")).toBeVisible();
  await expect(trail).toContainText("Développement d'une application");

  const projects = trail.getByRole("link", { name: "Projets" });
  await afterNavigation(page, () => clickInPlace(page, projects));
  await expect(page).toHaveURL(/\/projects$/);

  // Le header a persisté : il porte maintenant le fil de la liste, caché en haut.
  await expect(header).not.toHaveAttribute("data-trail");
  await expect(trail).toHaveText("Projets");
});

test("le focus suit l'ordre visuel de la barre (RGAA 12.8)", async ({ page }) => {
  // La liste remontée en tête par CSS faisait passer le focus du nom à « EN » et
  // au thème, avant de revenir aux liens.
  expect(await tabOrder(page, page.locator("[data-home-link]"), 7)).toEqual([
    "À propos",
    "Compétences",
    "Parcours",
    "Projets",
    "Contact",
    "EN",
    "Réglages d'affichage",
  ]);
});

test.describe("panneau de réglages", () => {
  const gear = (page: import("@playwright/test").Page) => page.locator("[data-settings-toggle]");
  const panel = (page: import("@playwright/test").Page) => page.locator("#settings-panel");

  test("s'ouvre au clavier, garde le focus dans l'ordre et se ferme à Échap", async ({ page }) => {
    await expect(gear(page)).toHaveAttribute("aria-expanded", "false");
    await gear(page).focus();
    await page.keyboard.press("Enter");
    await expect(panel(page)).toBeVisible();
    await expect(gear(page)).toHaveAttribute("aria-expanded", "true");

    // Ses interrupteurs suivent l'engrenage (RGAA 12.8).
    expect(await tabOrder(page, gear(page), 2)).toEqual(["Thème clair", "Animer les titres"]);

    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(gear(page)).toHaveAttribute("aria-expanded", "false");
    await expect(gear(page)).toBeFocused();
  });

  test("se cale sous l'engrenage et le suit quand la barre se resserre", async ({ page }) => {
    const gap = async () => {
      const [g, p] = await Promise.all([gear(page).boundingBox(), panel(page).boundingBox()]);
      return {
        top: Math.round(p!.y - (g!.y + g!.height)),
        right: Math.round(g!.x + g!.width - (p!.x + p!.width)),
      };
    };

    await openSettings(page);
    await expect.poll(gap).toEqual({ top: 8, right: 0 });

    // La molette ne ferme pas le panneau : seul un clic à côté le fait.
    await page.mouse.wheel(0, 600);
    await expect(page.locator("header")).toHaveAttribute("data-scrolled", "");
    await expect.poll(gap).toEqual({ top: 8, right: 0 });
  });

  test("reste ouvert quand on bascule un réglage, et se ferme d'un clic à côté", async ({ page }) => {
    await openSettings(page);
    await page.locator("#settings-panel [data-shine-toggle]").click();
    await expect(panel(page)).toBeVisible();

    await page.locator("main").click({ position: { x: 10, y: 400 } });
    await expect(panel(page)).toBeHidden();
  });
});

test.describe("avec une police agrandie à 200 % (RGAA 10.4)", () => {
  /** Les éléments affichés de la barre qui en chevauchent un autre. */
  const overlaps = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const boxes = [
        ...document.querySelectorAll(
          "[data-home-link], [data-nav-link], [data-lang-switch], [data-settings-toggle], [data-nav-toggle]",
        ),
      ]
        .map((element) => ({ name: element.textContent?.trim(), box: element.getBoundingClientRect() }))
        .filter(({ box }) => box.width > 0 && box.height > 0);

      return boxes.flatMap((a, i) =>
        boxes
          .slice(i + 1)
          .filter(
            (b) =>
              a.box.left < b.box.right &&
              b.box.left < a.box.right &&
              a.box.top < b.box.bottom &&
              b.box.top < a.box.bottom,
          )
          .map((b) => `${a.name} × ${b.name}`),
      );
    });

  // La taille de police par défaut du navigateur, celle que règle le visiteur.
  // Le zoom ne la change pas : il agrandit aussi la fenêtre en pixels CSS.
  test.beforeEach(async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
  });

  test("à 1280 px, la barre se replie au lieu de recouvrir le nom", async ({ page }) => {
    // Avec un seuil à 40rem (1 280 px à cette taille), la barre restait large et
    // le nom recouvrait « À propos » jusqu'à 1 350 px.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("");

    await expect(page.locator("[data-nav-toggle]")).toBeVisible();
    await expect(page.locator("[data-nav-bar]")).toBeHidden();
    expect(await overlaps(page)).toEqual([]);
  });

  test("à 1920 px, la barre large tient sans chevauchement", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("");

    await expect(page.locator("[data-nav-bar]")).toBeVisible();
    expect(await overlaps(page)).toEqual([]);

    await scrollToY(page, 800);
    await expect(page.locator("header")).toHaveAttribute("data-scrolled");
    expect(await overlaps(page)).toEqual([]);
  });
});
