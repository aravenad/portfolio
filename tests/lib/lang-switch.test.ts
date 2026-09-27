import { describe, expect, it } from "vitest";

import { readingPosition, restoredScrollY } from "../../src/lib/lang-switch";

const sections = (...tops: number[]) =>
  tops.map((top, index) => ({ id: `s${index + 1}`, top }));

describe("readingPosition", () => {
  it("retient la dernière section commencée et sa position dans la fenêtre", () => {
    // s2 a commencé 300 px plus haut ; s3 n'est pas encore arrivée en haut.
    expect(readingPosition(sections(-1200, -300, 250), 1500, 4000)).toEqual({
      id: "s2",
      offset: -300,
      ratio: 1500 / 4000,
    });
  });

  it("n'a pas de repère tant qu'aucune section n'a atteint le haut", () => {
    // Dans le hero de l'accueil, ou sur une page sans section.
    expect(readingPosition(sections(400, 900), 120, 3000).id).toBeNull();
    expect(readingPosition([], 120, 3000).id).toBeNull();
  });

  it("borne la part défilée, rebond élastique compris", () => {
    expect(readingPosition([], -40, 3000).ratio).toBe(0);
    expect(readingPosition([], 3100, 3000).ratio).toBe(1);
  });

  it("ne divise pas par zéro sur une page qui ne défile pas", () => {
    expect(readingPosition([], 0, 0).ratio).toBe(0);
  });
});

describe("restoredScrollY", () => {
  it("replace le repère au même pixel dans la fenêtre", () => {
    // Le repère est 2 500 px dans le document traduit et était à -300 px :
    // on défile jusqu'à 2 800 pour le retrouver au même endroit.
    const position = { id: "s2", offset: -300, ratio: 0.4 };
    expect(restoredScrollY(position, 2500, 5000)).toBe(2800);
  });

  it("se rabat sur la part défilée quand le repère n'existe pas", () => {
    // Fiche projet : les ancres des titres sont traduites.
    const position = { id: "contexte", offset: -120, ratio: 0.5 };
    expect(restoredScrollY(position, undefined, 3000)).toBe(1500);
    expect(restoredScrollY({ id: null, offset: 0, ratio: 0.25 }, undefined, 3000)).toBe(750);
  });

  it("reste dans le défilement possible de la nouvelle page", () => {
    const position = { id: "s1", offset: -900, ratio: 1 };

    // La page traduite est plus courte : pas au-delà de son bas.
    expect(restoredScrollY(position, 2600, 3000)).toBe(3000);
    // Ni au-dessus de son haut.
    expect(restoredScrollY({ id: "s1", offset: 200, ratio: 0 }, 100, 3000)).toBe(0);
  });
});
