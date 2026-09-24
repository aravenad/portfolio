import { describe, expect, it } from "vitest";

import {
  PAGINATION_KEY,
  rememberPage,
  slideOffset,
  slideOrigin,
} from "../../src/lib/pagination";

/**
 * Le glissement du calque de la pagination tourne dans le navigateur, hors de
 * la couverture. La règle qui compte : c'est un agrément. Sans stockage, sans
 * bouton d'origine ou sous mouvement réduit, le calque est simplement en place.
 */

/** Stockage en mémoire, qui se comporte comme `sessionStorage`. */
function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("rememberPage", () => {
  it("renvoie la page quittée et retient la page courante", () => {
    const store = memoryStore({ [PAGINATION_KEY]: "1" });

    expect(rememberPage(() => store, "2")).toBe("1");
    expect(store.data.get(PAGINATION_KEY)).toBe("2");
  });

  it("ne renvoie rien à la première visite, mais retient la page", () => {
    const store = memoryStore();

    expect(rememberPage(() => store, "1")).toBeNull();
    expect(store.data.get(PAGINATION_KEY)).toBe("1");
  });

  it("ne retient pas une page inconnue", () => {
    const store = memoryStore({ [PAGINATION_KEY]: "3" });

    expect(rememberPage(() => store, undefined)).toBe("3");
    expect(store.data.get(PAGINATION_KEY)).toBe("3");
  });

  it("se passe du stockage quand y accéder lève une erreur", () => {
    // Navigation privée, cookies bloqués : le simple accès à `sessionStorage`
    // peut lever une SecurityError.
    const blocked = () => {
      throw new DOMException("Refusé", "SecurityError");
    };

    expect(rememberPage(blocked, "2")).toBeNull();
  });

  it("se passe du stockage quand l'écriture échoue", () => {
    // Quota dépassé : la lecture a réussi, mais l'échec d'écriture ne doit pas
    // remonter jusqu'au script.
    const full = {
      getItem: () => "1",
      setItem: () => {
        throw new DOMException("Plein", "QuotaExceededError");
      },
    };

    expect(() => rememberPage(() => full, "2")).not.toThrow();
  });
});

describe("slideOrigin", () => {
  it("fait glisser depuis la page quittée", () => {
    expect(slideOrigin("1", "2")).toBe("1");
  });

  it("ne glisse pas au rechargement de la même page", () => {
    expect(slideOrigin("2", "2")).toBeNull();
  });

  it("ne glisse pas sans page quittée", () => {
    expect(slideOrigin(null, "2")).toBeNull();
    expect(slideOrigin("", "2")).toBeNull();
  });
});

describe("slideOffset", () => {
  it("part de la position du bouton quitté", () => {
    expect(slideOffset({ motionOk: true, originLeft: 100, currentLeft: 148 })).toBe(-48);
    expect(slideOffset({ motionOk: true, originLeft: 196, currentLeft: 148 })).toBe(48);
  });

  it("n'anime rien sous prefers-reduced-motion", () => {
    expect(slideOffset({ motionOk: false, originLeft: 100, currentLeft: 148 })).toBeNull();
  });

  it("n'anime rien quand le bouton quitté a disparu", () => {
    // L'ellipsis a bougé : la page d'origine n'a plus de bouton.
    expect(slideOffset({ motionOk: true, originLeft: undefined, currentLeft: 148 })).toBeNull();
  });

  it("n'anime rien sans déplacement", () => {
    expect(slideOffset({ motionOk: true, originLeft: 148, currentLeft: 148 })).toBeNull();
  });

  it("enchaîne les trois étapes comme le script", () => {
    const store = memoryStore({ [PAGINATION_KEY]: "1" });
    const from = slideOrigin(rememberPage(() => store, "2"), "2");

    expect(from).toBe("1");
    expect(slideOffset({ motionOk: true, originLeft: 100, currentLeft: 148 })).toBe(-48);
  });
});
