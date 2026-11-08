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
 *   une exception, même quand toutes les assertions passent. Seules sont
 *   tolérées celles qu'un fichier déclare par `test.use({ expectedErrors })`,
 *   comme le 404 du document que charge la page introuvable.
 */
export const test = base.extend<{ expectedErrors: RegExp[] }>({
  expectedErrors: [[], { option: true }],
  page: async ({ page, expectedErrors }, use) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (message.type() === "error" && !expectedErrors.some((pattern) => pattern.test(text))) {
        errors.push(text);
      }
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

/**
 * Attend la fin d'un défilement doux : deux mesures de suite, à 150 ms
 * d'écart, identiques. Un délai fixe ne suffit pas : sur une machine chargée,
 * le saut d'ancre dure plus longtemps.
 */
export async function scrollSettled(page: Page): Promise<void> {
  let last = Number.NaN;

  await expect
    .poll(
      async () => {
        const y = await scrollY(page);
        const still = y === last;
        last = y;
        return still;
      },
      { intervals: [150] },
    )
    .toBe(true);
}

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
 * La cible est d'abord attendue immobile, puis à portée : le point visé doit lui
 * appartenir, et non à `<html>` ou à un élément posé dessus.
 *
 * Immobile, c'est sans transition en cours sur elle ni sur ses parents : juste
 * après un défilement ou une navigation, les contrôles de la barre glissent
 * vers leur place (0,8 s). Deux mesures identiques ne suffisent pas : prises
 * avant l'image qui lance le glissement, elles concordent, et si la page est
 * ensuite occupée (trames construites à l'approche de l'écran), le clic
 * n'est traité qu'une fois le lien parti de sous le pointeur. On laisse donc
 * aussi passer une image et un moment de repos avant de regarder.
 */
export async function clickInPlace(page: Page, locator: Locator): Promise<void> {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestIdleCallback(resolve, { timeout: 2000 })),
      ),
  );

  let box = await locator.boundingBox();

  await expect
    .poll(async () => {
      const previous = box;
      box = await locator.boundingBox();
      if (!box || JSON.stringify(box) !== JSON.stringify(previous)) return false;

      const { x, y, width, height } = box;
      return locator.evaluate(
        (element, [px, py]) => {
          for (let node: Element | null = element; node; node = node.parentElement) {
            const moving = node
              .getAnimations()
              .some(
                (animation) =>
                  animation.playState === "running" &&
                  animation.effect?.getComputedTiming().iterations !== Infinity,
              );
            if (moving) return false;
          }
          return element.contains(document.elementFromPoint(px, py));
        },
        [x + width / 2, y + height / 2],
      );
    })
    .toBe(true);

  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

/**
 * Le lien de navigation affiché qui porte ce libellé : celui de la barre large
 * sur bureau, celui du menu replié sur téléphone. Le header en a un de chaque,
 * et `getByRole` ignore celui qui est en `display: none`. `[data-nav-link]`
 * écarte le « Projets » du fil d'Ariane, recopié dans la barre.
 */
export const navLink = (page: Page, name: string) =>
  page.getByRole("link", { name, exact: true }).and(page.locator("[data-nav-link]"));

/**
 * Les `count` éléments atteints à la touche Tab depuis `from`, nommés par leur
 * texte ou, à défaut, leur `aria-label`.
 */
export async function tabOrder(page: Page, from: Locator, count: number): Promise<string[]> {
  await from.focus();
  const names: string[] = [];

  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Tab");
    names.push(
      await page.evaluate(() => {
        const element = document.activeElement!;
        return element.textContent?.trim() || element.getAttribute("aria-label") || "";
      }),
    );
  }

  return names;
}

/**
 * Ouvre le panneau des réglages d'affichage (thème, reflet des titres) et
 * attend qu'il soit affiché.
 */
export async function openSettings(page: Page): Promise<void> {
  await page.locator("[data-settings-toggle]").click();
  await expect(page.locator("#settings-panel")).toBeVisible();
}
