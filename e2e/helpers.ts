import { test as base, expect, type Locator, type Page } from "@playwright/test";

declare global {
  interface Window {
    __pageLoads: number;
  }
}

/**
 * `test` de Playwright, avec deux ajouts sur chaque page :
 *
 * - un compteur d'`astro:page-load`, que `afterNavigation()` attend. Après un
 *   changement de page par le routeur, l'URL change avant que les scripts ne
 *   soient recâblés par `onEachPage()` : attendre l'URL ne suffit pas ;
 * - un test qui échoue si la page a écrit une erreur dans la console ou levé
 *   une exception, même quand toutes les assertions passent.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.addInitScript(() => {
      window.__pageLoads = 0;
      document.addEventListener("astro:page-load", () => window.__pageLoads++);
    });

    await use(page);

    expect(errors, "erreurs dans la console").toEqual([]);
  },
});

export { expect };

/**
 * Lance `action`, puis attend que la page suivante soit montée par le routeur
 * et que sa transition soit finie.
 *
 * Pendant la transition, le navigateur envoie les clics à `<html>` et non aux
 * éléments de la page : un clic à la souris y serait perdu.
 */
export async function afterNavigation(page: Page, action: () => Promise<unknown>): Promise<void> {
  const before = await page.evaluate(() => window.__pageLoads);
  await action();
  await page.waitForFunction((count) => window.__pageLoads > count, before);
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-astro-transition"));
}

/**
 * Amène le haut d'un élément en haut de la fenêtre, sans défilement doux : le
 * test mesure une position d'arrivée, pas une trajectoire.
 */
export async function scrollToId(page: Page, id: string, offset = 0): Promise<void> {
  await page.evaluate(
    ([target, shift]) => {
      const element = document.getElementById(target as string)!;
      const top = element.getBoundingClientRect().top + window.scrollY + (shift as number);
      window.scrollTo({ top, behavior: "instant" });
    },
    [id, offset],
  );
}

/** Défile jusqu'à une position, sans défilement doux. */
export async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
}

export const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

/** Position du haut d'un élément dans la fenêtre. */
export const topOf = (page: Page, id: string) =>
  page.evaluate((target) => document.getElementById(target)!.getBoundingClientRect().top, id);

/**
 * Clique au centre de l'élément comme le ferait un visiteur, sans le faire
 * défiler dans la vue d'abord.
 *
 * `locator.click()` amène toujours sa cible à l'écran avant de cliquer. Sur un
 * élément de la barre collante, ce recadrage lance un défilement doux de
 * quelques pixels, qu'aucun visiteur ne provoque. Il fausse la position de
 * lecture, et, s'il se termine après le changement de page, il annule le
 * défilement vers l'ancre visée. À utiliser pour tout clic dans la barre dont
 * le test observe le défilement.
 *
 * La cible est d'abord attendue immobile — juste après une navigation, les
 * contrôles de la barre glissent encore vers leur place — puis à portée : le
 * point visé doit lui appartenir, et non à `<html>` ou à un élément posé dessus.
 */
export async function clickInPlace(page: Page, locator: Locator): Promise<void> {
  let box = await locator.boundingBox();

  await expect
    .poll(async () => {
      const previous = box;
      box = await locator.boundingBox();
      if (!box || JSON.stringify(box) !== JSON.stringify(previous)) return false;

      const { x, y, width, height } = box;
      return locator.evaluate(
        (element, [px, py]) => element.contains(document.elementFromPoint(px, py)),
        [x + width / 2, y + height / 2],
      );
    })
    .toBe(true);

  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

/** Le lien de la barre de navigation qui porte ce libellé. */
export const navLink = (page: Page, name: string) =>
  page.locator("#nav-menu").getByRole("link", { name, exact: true });
