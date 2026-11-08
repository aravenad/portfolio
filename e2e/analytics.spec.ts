import { expect, test } from "./helpers";

/**
 * La mesure d'audience. Hors du vrai domaine, rien ne part vers GoatCounter :
 * ni ici, ni en développement. L'interrupteur des mentions légales garde le
 * refus sous la clé de GoatCounter, que le compteur lit avant chaque page vue.
 */

test("rien n'est envoyé à GoatCounter hors du vrai domaine", async ({ page }) => {
  const sent: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("goatcounter")) sent.push(request.url());
  });

  await page.goto("");
  await page.goto("legal/");
  expect(sent).toEqual([]);
});

test("l'interrupteur des mentions légales enregistre le refus, puis l'accord", async ({ page }) => {
  await page.goto("legal/");
  const toggle = page.getByRole("button", { name: "Compter mes visites" });
  const skip = () => page.evaluate(() => localStorage.getItem("skipgc"));

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(await skip()).toBe("t");

  // Le choix tient au rechargement.
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(await skip()).toBeNull();
});
