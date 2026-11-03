import { expect, test } from "./helpers";

/**
 * La visionneuse des captures de Dauphinéo : un clic sur une figure l'agrandit
 * dans un `<dialog>` modal, où l'on zoome et d'où l'on revient à la miniature.
 */

const viewer = (page: import("@playwright/test").Page) => page.locator("[data-viewer]");

test("agrandit une capture, puis la rend à sa place et au clavier", async ({ page }) => {
  await page.goto("projects/dauphineo");
  const trigger = page.getByRole("button", { name: /^Page d’accueil de Dauphinéo.*Agrandir l'image$/ });
  const thumb = trigger.locator("img");

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Capture agrandie" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("L’accueil de la démonstration");
  // La même image que la miniature, déjà chargée : rien de plus à télécharger.
  expect(await viewer(page).locator("[data-viewer-image]").evaluate((el: HTMLImageElement) => el.src)).toBe(
    await thumb.evaluate((el: HTMLImageElement) => el.currentSrc),
  );
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeFocused();
  // L'image a quitté la page pour la visionneuse.
  await expect(thumb).toHaveCSS("opacity", "0");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(thumb).toHaveCSS("opacity", "1");
});

test("zoome au clic, à la molette et aux boutons, et ferme à côté de l'image", async ({ page }) => {
  await page.goto("projects/dauphineo");
  await page.locator(".figure-zoom").first().click();
  const dialog = page.getByRole("dialog", { name: "Capture agrandie" });
  const level = viewer(page).locator("[data-viewer-level]");
  const zoomOut = dialog.getByRole("button", { name: "Dézoomer" });
  const image = viewer(page).locator("[data-viewer-image]");
  await expect(level).toHaveText("100 %");
  await expect(zoomOut).toBeDisabled();
  // L'ouverture finie, l'image est à sa place.
  await expect.poll(() => image.evaluate((el) => el.getAnimations().length)).toBe(0);

  await image.click();
  await expect(level).not.toHaveText("100 %");
  await expect(viewer(page)).toHaveAttribute("data-zoomed", "");

  // Un cran divise par 1,5 : quelques-uns ramènent à l'image ajustée, puis le bouton s'éteint.
  for (let i = 0; i < 6 && (await zoomOut.isEnabled()); i++) await zoomOut.click();
  await expect(level).toHaveText("100 %");
  await expect(zoomOut).toBeDisabled();
  // Le focus a suivi vers « Zoomer », sans sortir de la visionneuse.
  await expect(dialog.getByRole("button", { name: "Zoomer", exact: true })).toBeFocused();

  const box = (await image.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -300);
  await expect(level).not.toHaveText("100 %");

  await page.keyboard.press("0");
  await expect(level).toHaveText("100 %");

  // Le coin de la scène, à côté de l'image ajustée.
  const stage = (await viewer(page).locator("[data-viewer-stage]").boundingBox())!;
  await page.mouse.click(stage.x + 4, stage.y + 4);
  await expect(dialog).toBeHidden();
});

test("dit en anglais ce que fait la miniature", async ({ page }) => {
  await page.goto("en/projects/dauphineo");
  await expect(page.getByRole("button", { name: /Enlarge the image$/ })).toHaveCount(4);
});
