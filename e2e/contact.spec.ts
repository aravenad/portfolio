import { expect, test } from "./helpers";

/**
 * La section de contact : le bouton qui copie l'adresse, que le lien `mailto:`
 * ne remplace pas sur un poste sans client mail, et le CV dans la langue de la
 * page.
 */

test.describe("copie de l'adresse", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("");
  });

  test("copie l'adresse, l'annonce, puis revient au repos", async ({ page }) => {
    const copy = page.getByRole("button", { name: "Copier l'adresse e-mail" });
    const status = page.locator("#contact [data-copy-status]");
    const email = await page.locator("[data-copy]").getAttribute("data-copy");

    await copy.click();

    await expect(status).toHaveText("Adresse copiée");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);

    // L'annonce s'efface d'elle-même ; la zone vide disparaît.
    await expect(status).toBeHidden({ timeout: 4000 });
  });

  test("affiche l'adresse quand le navigateur refuse la copie", async ({ page }) => {
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new DOMException("", "NotAllowedError"));
    });

    await page.getByRole("button", { name: "Copier l'adresse e-mail" }).click();

    const status = page.locator("#contact [data-copy-status]");
    await expect(status).toContainText("Copie impossible");
    await expect(status).toContainText("@");
    await expect(status).toBeInViewport({ ratio: 1 });
  });
});

for (const [path, name, file] of [
  ["", "Télécharger mon CV", "cv-damien-aravena-bravo-public.pdf"],
  ["en/", "Download my résumé", "cv-damien-aravena-bravo-public-en.pdf"],
] as const) {
  test(`sert le CV dans la langue de la page (/${path})`, async ({ page }) => {
    await page.goto(path);

    const link = page.locator("#contact").getByRole("link", { name });
    const href = await link.getAttribute("href");
    expect(href).toMatch(new RegExp(`/${file}$`));

    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("pdf");
  });
}
