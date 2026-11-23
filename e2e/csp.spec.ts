import { afterNavigation, expect, openSettings, test } from "./helpers";

/**
 * La politique de sécurité du contenu du site construit (src/lib/csp.ts) :
 * déclarée dans chaque page, et assez large pour tout ce que le site exécute.
 * Une empreinte oubliée ne casse rien de visible au premier coup d'œil : le
 * thème ou l'apparition des blocs cessent simplement de marcher.
 */

declare global {
  interface Window {
    __violations: string[];
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__violations.push(`${event.effectiveDirective} ${event.blockedURI} ${event.sample}`);
    });
  });
});

const violations = (page: import("@playwright/test").Page) =>
  page.evaluate(() => window.__violations);

test("chaque page restreint ses scripts, sans 'unsafe-inline'", async ({ page }) => {
  await page.goto("");

  const policy = await page
    .locator('meta[http-equiv="content-security-policy"]')
    .getAttribute("content");
  const scripts = policy?.split(";").find((rule) => rule.trim().startsWith("script-src"));

  expect(scripts).toMatch(/'sha256-[A-Za-z0-9+/]+=*'/);
  expect(scripts).not.toContain("'unsafe-inline'");
});

test("le site entier tourne sous sa politique, de page en page", async ({ page }) => {
  // Le routeur garde la politique du premier document : les scripts en ligne
  // des pages suivantes doivent y figurer déjà.
  await page.goto("");
  await expect(page.locator("html")).toHaveAttribute("data-reveal-ready");

  await afterNavigation(page, () =>
    page.getByRole("link", { name: "Voir tous les projets" }).click(),
  );
  await afterNavigation(page, () =>
    page.locator("[data-project-list] a[href$='/arrow-block/']").click(),
  );

  await page.locator("[data-demo]").getByRole("link", { name: "Jouer à la démo" }).click();
  await expect(page.locator("[data-demo]")).toHaveAttribute("data-state", "ready");

  await openSettings(page);
  await page.locator("#settings-panel [data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  expect(await violations(page)).toEqual([]);
});

test.describe("page introuvable", () => {
  test.use({ expectedErrors: [/status of 404/] });

  test("ses scripts propres sont autorisés", async ({ page }) => {
    await page.goto("page-qui-n-existe-pas/");
    await expect(page.locator("h1")).toBeVisible();

    expect(await violations(page)).toEqual([]);
  });
});
