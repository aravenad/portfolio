import { describe, expect, it, vi } from "vitest";

import {
  type BackToTopButton,
  type BackToTopWindow,
  backToTopVisible,
  wireBackToTop,
} from "../../src/lib/back-to-top";

/**
 * Le script du bouton tourne dans le navigateur, hors de la couverture. Ici, un
 * `EventTarget` joue la fenêtre et un autre le bouton : c'est tout ce que le
 * câblage en utilise.
 */

/** Fenêtre factice, dont on règle le défilement et la hauteur à la main. */
function fakeWindow(scrollY = 0, innerHeight = 800) {
  const target = new EventTarget();
  const win = Object.assign(target, {
    scrollY,
    innerHeight,
    scrollTo: vi.fn(),
  });

  return win as typeof win & BackToTopWindow;
}

function fakeButton() {
  const target = new EventTarget();
  return Object.assign(target, { dataset: {} as DOMStringMap }) as EventTarget &
    BackToTopButton;
}

/** Défile la fenêtre factice et prévient les écouteurs, comme le navigateur. */
function scroll(win: ReturnType<typeof fakeWindow>, y: number) {
  win.scrollY = y;
  win.dispatchEvent(new Event("scroll"));
}

const visible = (button: BackToTopButton) => "visible" in button.dataset;

describe("backToTopVisible", () => {
  it("reste caché tant que la première fenêtre n'est pas dépassée", () => {
    expect(backToTopVisible(0, 800)).toBe(false);
    expect(backToTopVisible(800, 800)).toBe(false);
  });

  it("apparaît au-delà d'une hauteur de fenêtre", () => {
    expect(backToTopVisible(801, 800)).toBe(true);
  });
});

describe("wireBackToTop", () => {
  it("part caché en haut de page", () => {
    const button = fakeButton();
    wireBackToTop(button, fakeWindow(0), new AbortController().signal);

    expect(visible(button)).toBe(false);
  });

  it("part visible sur une page rechargée au milieu", () => {
    // Pas besoin d'attendre un défilement : l'état est calculé tout de suite.
    const button = fakeButton();
    wireBackToTop(button, fakeWindow(2000), new AbortController().signal);

    expect(visible(button)).toBe(true);
  });

  it("apparaît et disparaît au fil du défilement", () => {
    const button = fakeButton();
    const win = fakeWindow(0, 800);
    wireBackToTop(button, win, new AbortController().signal);

    scroll(win, 1200);
    expect(visible(button)).toBe(true);

    scroll(win, 300);
    expect(visible(button)).toBe(false);
  });

  it("se recalcule quand la fenêtre change de taille", () => {
    // Même défilement, fenêtre agrandie : on repasse sous le seuil.
    const button = fakeButton();
    const win = fakeWindow(1000, 800);
    wireBackToTop(button, win, new AbortController().signal);
    expect(visible(button)).toBe(true);

    win.innerHeight = 1200;
    win.dispatchEvent(new Event("resize"));
    expect(visible(button)).toBe(false);
  });

  it("remonte tout en haut au clic, sans imposer de mouvement", () => {
    // Pas de `behavior` : c'est la feuille de style qui décide, et elle
    // respecte prefers-reduced-motion.
    const button = fakeButton();
    const win = fakeWindow(2000);
    wireBackToTop(button, win, new AbortController().signal);

    button.dispatchEvent(new Event("click"));

    expect(win.scrollTo).toHaveBeenCalledOnce();
    expect(win.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it("ne réagit plus à rien une fois la page quittée", () => {
    // Le signal est avorté avant l'échange de DOM : écouteurs de la fenêtre et
    // du bouton doivent tous disparaître, sinon ils s'accumulent.
    const button = fakeButton();
    const win = fakeWindow(0);
    const controller = new AbortController();
    wireBackToTop(button, win, controller.signal);

    controller.abort();
    scroll(win, 5000);
    win.dispatchEvent(new Event("resize"));
    button.dispatchEvent(new Event("click"));

    expect(visible(button)).toBe(false);
    expect(win.scrollTo).not.toHaveBeenCalled();
  });

  it("n'accumule pas les écouteurs d'une page à l'autre", () => {
    // Trois pages visitées, trois câblages : un seul clic doit rester actif.
    const button = fakeButton();
    const win = fakeWindow(2000);
    let controller = new AbortController();

    for (let page = 0; page < 3; page++) {
      controller.abort();
      controller = new AbortController();
      wireBackToTop(button, win, controller.signal);
    }

    button.dispatchEvent(new Event("click"));
    expect(win.scrollTo).toHaveBeenCalledOnce();
  });
});
