import { describe, expect, it } from "vitest";

import {
  BAR,
  activeSectionIndex,
  ariaCurrentFor,
  barReturnThreshold,
  initialBarScrolled,
  nextBarScrolled,
  normalizePath,
  readingLine,
} from "../../src/lib/nav";

/**
 * Ces règles tournent pour l'essentiel dans le navigateur, dans les scripts du
 * header, où la couverture ne les voit pas. Chacune a déjà coûté un bug ou un
 * réglage : le lien courant resté figé après une navigation, la rubrique
 * éteinte sur la fiche d'un projet, la barre qui se détendait trop tard.
 */

describe("normalizePath", () => {
  it("ignore la barre finale", () => {
    expect(normalizePath("/portfolio/projects/")).toBe("/portfolio/projects");
    expect(normalizePath("/portfolio/projects///")).toBe("/portfolio/projects");
  });

  it("garde la racine intacte au lieu de la vider", () => {
    expect(normalizePath("/")).toBe("/");
  });
});

describe("ariaCurrentFor", () => {
  it("marque la page elle-même", () => {
    expect(ariaCurrentFor("/portfolio/projects", "/portfolio/projects")).toBe("page");
  });

  it("ne dépend pas de la barre finale, d'un côté ou de l'autre", () => {
    expect(ariaCurrentFor("/portfolio/projects/", "/portfolio/projects")).toBe("page");
    expect(ariaCurrentFor("/portfolio/projects", "/portfolio/projects/")).toBe("page");
  });

  it("marque la rubrique sur ses sous-pages, sans en faire la page courante", () => {
    expect(ariaCurrentFor("/portfolio/projects", "/portfolio/projects/mon-projet")).toBe("true");
    expect(ariaCurrentFor("/portfolio/projects", "/portfolio/projects/page/2")).toBe("true");
  });

  it("ne confond pas une rubrique avec un chemin qui la prolonge sans barre", () => {
    // « /projects-archive » commence par « /projects » sans en être une sous-page.
    expect(ariaCurrentFor("/portfolio/projects", "/portfolio/projects-archive")).toBeUndefined();
  });

  it("ne fait jamais d'un lien à ancre la page courante ni un parent", () => {
    for (const path of ["/portfolio/", "/portfolio/projects", "/portfolio/projects/a"]) {
      expect(ariaCurrentFor("/portfolio/#skills", path), path).toBeUndefined();
    }
  });

  it("ne marque rien hors de la rubrique", () => {
    expect(ariaCurrentFor("/portfolio/projects", "/portfolio/")).toBeUndefined();
  });

  it("n'allume pas l'accueil sur toutes les pages du site", () => {
    // L'accueil est le préfixe de tout : il ne peut être que « page ».
    expect(ariaCurrentFor("/portfolio/", "/portfolio/")).toBe("page");
    expect(ariaCurrentFor("/", "/projects")).toBeUndefined();
  });
});

describe("barReturnThreshold", () => {
  it("laisse toute la marge quand le premier texte est loin, comme sur l'accueil", () => {
    expect(barReturnThreshold(350)).toBe(BAR.returnMax);
  });

  it("s'arrête avant le premier texte, comme le fil d'Ariane des pages projets", () => {
    // Premier texte à 106 px, texte de la barre jusqu'au 48e : 58 px au plus.
    expect(barReturnThreshold(106)).toBe(58);
  });

  it("ne descend jamais sous le seuil de descente", () => {
    // Sinon la barre ne se détendrait plus du tout en arrivant en haut.
    expect(barReturnThreshold(20)).toBe(BAR.down);
    expect(barReturnThreshold(-Infinity)).toBe(BAR.down);
  });

  it("supporte une page sans texte", () => {
    expect(barReturnThreshold(Infinity)).toBe(BAR.returnMax);
  });
});

describe("nextBarScrolled", () => {
  const returnAt = 180;
  const step = (scrolled: boolean, lastY: number, y: number) =>
    nextBarScrolled({ scrolled, y, lastY, returnAt });

  it("prend son fond dès qu'on dépasse le seuil en descendant", () => {
    expect(step(false, 0, BAR.down + 1)).toBe(true);
  });

  it("reste nue sous le seuil, rebond élastique compris", () => {
    expect(step(false, 0, BAR.down)).toBe(false);
    expect(step(true, 20, -30)).toBe(false);
  });

  it("garde son fond en remontant tant qu'on est au-dessus du seuil de retour", () => {
    expect(step(true, 600, 400)).toBe(true);
    expect(step(true, 200, returnAt)).toBe(true);
  });

  it("se détend en remontant dès le seuil de retour, avant d'arriver en haut", () => {
    expect(step(true, 200, returnAt - 1)).toBe(false);
  });

  it("reprend son fond au premier pixel de descente après un demi-tour", () => {
    expect(step(false, 120, 121)).toBe(true);
  });

  it("ne bouge pas quand la position ne change pas", () => {
    expect(step(true, 100, 100)).toBe(true);
    expect(step(false, 100, 100)).toBe(false);
  });

  it("déroule une remontée complète comme mesurée sur l'accueil", () => {
    // Même scénario que la mesure dans Chrome : premier texte à 350 px, pas de
    // 20 px. La barre s'y détendait à y = 180.
    const homeReturnAt = barReturnThreshold(350);
    let scrolled = true;
    let lastY = 700;
    let released: number | undefined;

    for (let y = 680; y >= 0; y -= 20) {
      scrolled = nextBarScrolled({ scrolled, y, lastY, returnAt: homeReturnAt });
      if (!scrolled && released === undefined) released = y;
      lastY = y;
    }

    expect(released).toBe(180);
    expect(scrolled).toBe(false);
  });
});

describe("initialBarScrolled", () => {
  it("se fie au seul seuil de descente quand le sens est inconnu", () => {
    expect(initialBarScrolled(0)).toBe(false);
    expect(initialBarScrolled(BAR.down)).toBe(false);
    expect(initialBarScrolled(900)).toBe(true);
  });
});

describe("readingLine", () => {
  it("se place au premier tiers de la fenêtre, sous le header", () => {
    expect(readingLine(864)).toBe(64 + 800 * 0.3);
  });

  it("suit la hauteur du header demandée", () => {
    expect(readingLine(100, 0)).toBe(30);
  });
});

describe("activeSectionIndex", () => {
  const line = 300;

  it("n'allume rien tant qu'aucune section n'a franchi la ligne", () => {
    expect(activeSectionIndex([400, 900], line, false)).toBe(-1);
  });

  it("allume la dernière section dont le haut a franchi la ligne", () => {
    expect(activeSectionIndex([-800, -100, 250, 900], line, false)).toBe(2);
  });

  it("garde la précédente allumée entre deux sections", () => {
    // La section 1 a commencé, la 2 pas encore : pas de trou dans le surlignage.
    expect(activeSectionIndex([-800, -100, 700], line, false)).toBe(1);
  });

  it("accepte une section pile sur la ligne", () => {
    expect(activeSectionIndex([line], line, false)).toBe(0);
  });

  it("force la dernière section en bas de page", () => {
    expect(activeSectionIndex([-900, -300, 500], line, true)).toBe(2);
  });

  it("ne renvoie rien sans section, même en bas de page", () => {
    expect(activeSectionIndex([], line, true)).toBe(-1);
    expect(activeSectionIndex([], line, false)).toBe(-1);
  });

  it("départage deux sections au même niveau par l'ordre du document", () => {
    expect(activeSectionIndex([100, 100], line, false)).toBe(0);
  });
});
