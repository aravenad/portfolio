import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { onEachPage } from "../../src/lib/enhance";

/**
 * `onEachPage` est le relais dont dépend tout le JavaScript du site : c'est lui
 * qui rejoue les initialisations après une navigation `<ClientRouter />` et qui
 * retire les écouteurs avant l'échange de DOM. Une régression ici ne casse rien
 * sur la première page — elle tue les comportements à partir de la deuxième,
 * sans la moindre erreur en console. D'où ces tests.
 *
 * Un `EventTarget` suffit à le jouer : le module ne touche au document que par
 * `addEventListener`.
 */
let fakeDocument: EventTarget;

/** Déclenche l'événement que `<ClientRouter />` émettrait. */
function emit(type: "astro:page-load" | "astro:before-swap") {
  fakeDocument.dispatchEvent(new Event(type));
}

beforeEach(() => {
  fakeDocument = new EventTarget();
  vi.stubGlobal("document", fakeDocument);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("onEachPage", () => {
  it("n'appelle rien avant le premier affichage", () => {
    const setup = vi.fn();
    onEachPage(setup);

    expect(setup).not.toHaveBeenCalled();
  });

  it("rejoue l'initialisation à chaque affichage de page", () => {
    const setup = vi.fn();
    onEachPage(setup);

    emit("astro:page-load");
    emit("astro:page-load");

    expect(setup).toHaveBeenCalledTimes(2);
  });

  it("fournit un signal vivant à chaque appel", () => {
    const signals: AbortSignal[] = [];
    onEachPage((signal) => signals.push(signal));

    emit("astro:page-load");
    expect(signals[0].aborted).toBe(false);
  });

  it("avorte le signal précédent avant l'échange de DOM", () => {
    // C'est ce qui retire les écouteurs posés sur `window` et `document` : sans
    // cela, ils s'accumulent à chaque navigation en visant des éléments détruits.
    const signals: AbortSignal[] = [];
    onEachPage((signal) => signals.push(signal));

    emit("astro:page-load");
    emit("astro:before-swap");

    expect(signals[0].aborted).toBe(true);
  });

  it("donne un signal neuf à chaque page, sans rendre l'ancien utilisable", () => {
    const signals: AbortSignal[] = [];
    onEachPage((signal) => signals.push(signal));

    emit("astro:page-load");
    emit("astro:before-swap");
    emit("astro:page-load");

    expect(signals).toHaveLength(2);
    expect(signals[0]).not.toBe(signals[1]);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("avorte aussi quand deux affichages se suivent sans échange", () => {
    // `astro:page-load` sans `astro:before-swap` : le cas d'un rechargement
    // complet. Le signal précédent doit tout de même être coupé.
    const signals: AbortSignal[] = [];
    onEachPage((signal) => signals.push(signal));

    emit("astro:page-load");
    emit("astro:page-load");

    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("supporte un échange de DOM avant tout affichage", () => {
    onEachPage(() => {});
    expect(() => emit("astro:before-swap")).not.toThrow();
  });

  it("supporte deux échanges de suite", () => {
    onEachPage(() => {});
    emit("astro:page-load");

    expect(() => {
      emit("astro:before-swap");
      emit("astro:before-swap");
    }).not.toThrow();
  });

  it("isole les comportements enregistrés séparément", () => {
    const premier = vi.fn();
    const second = vi.fn();

    onEachPage(premier);
    onEachPage(second);
    emit("astro:page-load");

    expect(premier).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("retire réellement un écouteur posé avec le signal", async () => {
    // Le contrat vu du composant : un écouteur câblé sur le signal cesse de
    // répondre après l'échange.
    const cible = new EventTarget();
    const clic = vi.fn();

    onEachPage((signal) => cible.addEventListener("click", clic, { signal }));

    emit("astro:page-load");
    cible.dispatchEvent(new Event("click"));
    expect(clic).toHaveBeenCalledTimes(1);

    emit("astro:before-swap");
    cible.dispatchEvent(new Event("click"));
    expect(clic).toHaveBeenCalledTimes(1);
  });
});
