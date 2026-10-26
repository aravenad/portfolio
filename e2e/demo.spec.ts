import { expect, test } from "./helpers";

/**
 * La démo jouable d'Arrow Block, sur sa fiche : rien n'est chargé avant le
 * clic, puis le jeu prend la place de l'image d'attente et reçoit le clavier.
 * La démo elle-même vient du dépôt du jeu (public/demos/arrow-block/).
 */

const demo = (page: import("@playwright/test").Page) => page.locator("[data-demo]");
const frame = (page: import("@playwright/test").Page) => page.frameLocator("[data-demo] iframe");

test("ne charge la démo qu'au clic, puis lui donne la place et le clavier", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("projects/arrow-block");

  await expect(demo(page).locator("img")).toBeVisible();
  expect(requests.some((url) => url.includes("/demos/arrow-block/embed.js"))).toBe(false);

  await demo(page).getByRole("link", { name: "Jouer à la démo" }).click();
  await expect(demo(page)).toHaveAttribute("data-state", "ready");

  const iframe = demo(page).locator("iframe");
  await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  await expect(iframe).toHaveAttribute("src", "/demos/arrow-block/?lang=fr&sound=1&theme=dark");
  await expect(frame(page).locator("canvas")).toBeVisible();
  // Le clavier est dans le jeu : Échap y ouvre la pause.
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("IFRAME");
  await page.keyboard.press("Escape");
  await expect(frame(page).locator("#oResume")).toBeFocused();
});

test("arrête la démo et la relance", async ({ page }) => {
  await page.goto("projects/arrow-block");
  const stop = demo(page).getByRole("button", { name: "Arrêter la démo" });
  await expect(stop).toBeHidden();

  await demo(page).getByRole("link", { name: "Jouer à la démo" }).click();
  await expect(demo(page)).toHaveAttribute("data-state", "ready");
  await stop.click();

  await expect(demo(page).locator("iframe")).toHaveCount(0);
  await expect(stop).toBeHidden();
  await expect(demo(page).getByRole("status")).toHaveText("Démo arrêtée.");
  const play = demo(page).getByRole("link", { name: "Jouer à la démo" });
  await expect(play).toBeFocused();

  await play.click();
  await expect(demo(page)).toHaveAttribute("data-state", "ready");
});

test("suit la hauteur que la démo conseille", async ({ page }) => {
  await page.goto("projects/arrow-block");
  await demo(page).getByRole("link", { name: "Jouer à la démo" }).click();
  await expect(demo(page)).toHaveAttribute("data-state", "ready");

  // La même formule des deux côtés : 1,2 fois la largeur, entre 460 et 680 px.
  const { width, height } = (await demo(page).locator("[data-demo-stage]").boundingBox())!;
  expect(Math.abs(height - Math.min(680, Math.max(460, (width - 2) * 1.2)))).toBeLessThan(3);
});

test("annonce un niveau réussi aux lecteurs d'écran", async ({ page }) => {
  await page.goto("en/projects/arrow-block");
  await demo(page).getByRole("link", { name: "Play the demo" }).click();
  await expect(demo(page)).toHaveAttribute("data-state", "ready");

  // Le message qu'envoie la démo à la fin d'un niveau, écrit depuis l'iframe.
  const game = page.frames().find((f) => f.url().includes("/demos/arrow-block/"))!;
  await game.evaluate(() =>
    parent.postMessage({ v: 1, type: "ab:solved", level: 3, time: 12.34, errors: 0 }, "*"),
  );
  await expect(demo(page).getByRole("status")).toHaveText("Level cleared in 12.3 s.");
});
