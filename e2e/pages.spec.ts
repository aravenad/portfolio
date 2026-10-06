import { afterNavigation, expect, scrollToId, scrollToY, scrollY, test } from "./helpers";

/**
 * Le reste des scripts du site : apparition au défilement, sommaire des
 * fiches, retour en haut et pagination. Chaque test échoue aussi sur une
 * erreur de console (voir helpers.ts).
 */

const routes = [
  "",
  "projects",
  "projects/page/2",
  "projects/developpement-application",
  "en/",
  "en/projects",
  "en/projects/developpement-application",
  "legal",
  "en/legal",
];

for (const route of routes) {
  test(`/${route} s'ouvre sans erreur`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}

for (const route of routes.filter((path) => !path.startsWith("en/"))) {
  test(`/${route} ne laisse aucun signe partir seul à la ligne`, async ({ page }) => {
    // Le texte s'écrit avec des espaces normales ; le build doit les avoir
    // rendues insécables devant « ; : ? ! », Markdown des fiches compris.
    await page.goto(route);

    const text = await page.locator("body").evaluate((body) => {
      const copy = body.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("script, style, code, pre").forEach((element) => element.remove());
      return copy.textContent ?? "";
    });

    expect(text.match(/.{0,30} [;:?!»]/g) ?? []).toEqual([]);
  });
}

test.describe("apparition au défilement", () => {
  test("un bloc sous la ligne de flottaison apparaît quand on l'atteint", async ({ page }) => {
    await page.goto("");
    const block = page.locator("#contact .reveal").first();
    await expect(block).not.toHaveAttribute("data-revealed");

    await scrollToId(page, "contact");

    await expect(block).toHaveAttribute("data-revealed");
    await expect(block).toHaveCSS("opacity", "1");
  });

  test.describe("sous prefers-reduced-motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("rien n'est masqué", async ({ page }) => {
      await page.goto("");

      await expect(page.locator("html")).not.toHaveAttribute("data-reveal-armed");
      await expect(page.locator("#contact .reveal").first()).toHaveCSS("opacity", "1");
    });
  });
});

test("sur grand écran, le texte n'est jamais replié", async ({ page }) => {
  await page.goto("");

  for (const id of ["about", "skills", "soft-skills"]) {
    const block = page.locator(`#${id} [data-read-more]`);
    await expect(block.locator(":scope > button"), id).toBeHidden();
    await expect(block.locator(".read-more-text > p:visible"), id).toHaveCount(
      await block.locator(".read-more-text > p").count(),
    );
  }
});

test.describe("fiche projet", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("projects/developpement-application");
  });

  test("le sommaire suit la section lue et y mène", async ({ page }) => {
    const sidebar = page.locator('nav[data-toc="sidebar"]');

    // Deux sections assez longues pour que la suivante reste sous la ligne de
    // lecture quand leur titre est en haut : une section de deux lignes
    // laisserait la main à sa voisine, et le test mesurerait la mise en page.
    const [first, second] = await page.evaluate(() => {
      const ids = [...document.querySelectorAll<HTMLAnchorElement>('nav[data-toc="sidebar"] a')].map(
        (link) => decodeURIComponent(link.hash.slice(1)),
      );
      const tops = ids.map((id) => document.getElementById(id)!.getBoundingClientRect().top);
      return ids.filter((_, i) => i + 1 < ids.length && tops[i + 1] - tops[i] > 200);
    });
    const link = (id: string) => sidebar.locator(`a[href="#${id}"]`);

    await scrollToId(page, first, -100);
    await expect(link(first)).toHaveAttribute("aria-current", "location");
    await expect(sidebar.locator("[aria-current]")).toHaveCount(1);

    await link(second).click();
    await expect(page.locator(`[id="${second}"]`)).toBeInViewport();
    await expect(link(second)).toHaveAttribute("aria-current", "location");
    await expect(sidebar.locator("[aria-current]")).toHaveCount(1);
  });

  test("le bouton de retour en haut apparaît au défilement et remonte", async ({ page }) => {
    const button = page.locator("[data-back-to-top]");
    await expect(button).not.toHaveAttribute("data-visible");

    await scrollToY(page, 2000);
    await expect(button).toHaveAttribute("data-visible");

    await button.click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(button).not.toHaveAttribute("data-visible");
  });
});

test("la pagination change de page et y place l'indicateur", async ({ page }) => {
  await page.goto("projects");
  const pagination = page.locator("[data-pagination]");
  await expect(pagination.locator('[aria-current="page"]')).toHaveAttribute("data-page", "1");

  await afterNavigation(page, () => pagination.locator('a[data-page="2"]').click());

  await expect(page).toHaveURL(/\/projects\/page\/2$/);
  const current = pagination.locator('[aria-current="page"]');
  await expect(current).toHaveAttribute("data-page", "2");

  // L'indicateur glisse depuis la page 1 puis se pose sur la page courante,
  // à la bordure du lien près (il est placé dans son cadre intérieur).
  const indicator = current.locator("[data-page-indicator]");
  await expect
    .poll(async () => {
      const [a, b] = await Promise.all([indicator.boundingBox(), current.boundingBox()]);
      return Math.abs(a!.x - b!.x);
    })
    .toBeLessThanOrEqual(1);
});
