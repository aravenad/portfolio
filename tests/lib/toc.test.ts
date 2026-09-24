import { describe, expect, it } from "vitest";

import {
  HEADER_HEIGHT,
  activeHeadingIndex,
  anchorFromHash,
  cursorBox,
  getTocEntries,
  groupByAnchor,
  lerp,
  readingLine,
  sectionEnd,
  sectionRatio,
} from "../../src/lib/toc";

/** Un titre de Markdown, réduit à ce dont le sommaire se sert. */
const heading = (depth: number, slug: string) => ({ depth, slug, text: slug });

describe("getTocEntries", () => {
  it("ne retient que les titres de niveau 2 et 3", async () => {
    const entries = getTocEntries([
      heading(1, "fiche"),
      heading(2, "contexte"),
      heading(3, "phase-1"),
      heading(4, "note"),
      heading(2, "resultats"),
    ]);

    expect(entries.map((entry) => entry.slug)).toEqual([
      "contexte",
      "phase-1",
      "resultats",
    ]);
  });

  it("garde l'ordre du document", async () => {
    const entries = getTocEntries([
      heading(2, "b"),
      heading(3, "b-1"),
      heading(2, "a"),
    ]);

    expect(entries.map((entry) => entry.slug)).toEqual(["b", "b-1", "a"]);
  });

  it("ne renvoie rien quand la fiche n'a aucun titre exploitable", async () => {
    expect(getTocEntries([])).toEqual([]);
    expect(getTocEntries([heading(1, "fiche")])).toEqual([]);
  });
});

describe("readingLine", () => {
  const VIEWPORT = 768;

  /** Loin du bas : il reste bien plus à défiler que la course de la ligne. */
  const PLENTY = VIEWPORT;

  it("part du bas du header, jamais du haut de la fenêtre", async () => {
    // Sans cela, sur un petit écran, la ligne tomberait derrière le header et
    // un titre serait « atteint » alors qu'il est encore caché.
    expect(readingLine(VIEWPORT, PLENTY)).toBeGreaterThan(HEADER_HEIGHT);
  });

  it("descend avec la hauteur de la fenêtre", async () => {
    expect(readingLine(1200, 2000)).toBeGreaterThan(readingLine(600, 2000));
  });

  it("ne bouge pas tant qu'il reste de quoi défiler", async () => {
    expect(readingLine(VIEWPORT, 3000)).toBe(readingLine(VIEWPORT, PLENTY));
  });

  it("rejoint le bas de la fenêtre en fin de course", async () => {
    // C'est ce qui permet aux dernières sections d'être atteintes : le
    // défilement s'arrête avant qu'elles aient pu remonter jusqu'à la ligne.
    expect(readingLine(VIEWPORT, 0)).toBe(VIEWPORT);
  });

  it("descend progressivement, sans saut", async () => {
    const fixed = readingLine(VIEWPORT, PLENTY);
    const half = readingLine(VIEWPORT, (VIEWPORT - fixed) / 2);

    expect(half).toBeGreaterThan(fixed);
    expect(half).toBeLessThan(VIEWPORT);
  });

  it("ne dépasse pas le bas de la fenêtre sur un défilement élastique", async () => {
    // iOS laisse dépasser le bas du document : `remainingScroll` devient
    // négatif, et la ligne partirait sous la fenêtre.
    expect(readingLine(VIEWPORT, -120)).toBe(VIEWPORT);
  });
});

describe("activeHeadingIndex", () => {
  const LINE = 200;
  const VIEWPORT = 768;

  it("retient le dernier titre passé sous la ligne de lecture", async () => {
    expect(activeHeadingIndex([-400, -80, 540], LINE, VIEWPORT)).toBe(1);
  });

  it("garde le titre courant allumé jusqu'au suivant", async () => {
    // Le titre suivant est loin sous la ligne : entre les deux, l'entrée
    // précédente doit rester allumée plutôt que s'éteindre.
    expect(activeHeadingIndex([-1000, 900], LINE, VIEWPORT)).toBe(0);
  });

  it("allume la première entrée dès que son titre entre dans la fenêtre", async () => {
    // Le chapeau de la fiche fait plus de 600 px : sans cela le sommaire reste
    // éteint alors que la première section occupe déjà le bas de l'écran.
    expect(activeHeadingIndex([615, 815], LINE, VIEWPORT)).toBe(0);
  });

  it("ne surligne rien tant que le premier titre n'est pas visible", async () => {
    // Le lecteur est encore dans le chapeau, qui n'est pas une section.
    expect(activeHeadingIndex([900, 1100], LINE, VIEWPORT)).toBe(-1);
  });

  it("n'invente pas d'entrée sur une fiche sans titre", async () => {
    expect(activeHeadingIndex([], LINE, VIEWPORT)).toBe(-1);
  });

  it("surligne un titre posé exactement sur la ligne", async () => {
    expect(activeHeadingIndex([LINE], LINE, VIEWPORT)).toBe(0);
  });
});

describe("sectionRatio", () => {
  it("part de zéro au titre de la section", async () => {
    expect(sectionRatio(100, 300, 100)).toBe(0);
  });

  it("atteint un au titre suivant", async () => {
    expect(sectionRatio(100, 300, 300)).toBe(1);
  });

  it("avance proportionnellement entre les deux", async () => {
    expect(sectionRatio(100, 300, 150)).toBeCloseTo(0.25);
  });

  it("reste borné de part et d'autre", async () => {
    // Le point de lecture sort de la section à chaque changement : sans bornes,
    // le curseur filerait hors de la liste.
    expect(sectionRatio(100, 300, -500)).toBe(0);
    expect(sectionRatio(100, 300, 900)).toBe(1);
  });

  it("ne divise pas par zéro sur une section vide", async () => {
    // Deux titres qui se suivent, un `h2` immédiatement suivi d'un `h3`.
    expect(sectionRatio(200, 200, 200)).toBe(0);
  });
});

describe("lerp", () => {
  it("rend les bornes aux extrémités", async () => {
    expect(lerp(10, 50, 0)).toBe(10);
    expect(lerp(10, 50, 1)).toBe(50);
  });

  it("rend le milieu à mi-course", async () => {
    expect(lerp(10, 50, 0.5)).toBe(30);
  });

  it("fonctionne vers le haut comme vers le bas", async () => {
    expect(lerp(50, 10, 0.5)).toBe(30);
  });
});

describe("le défilement d'une fiche, de bout en bout", () => {
  /*
   * Les deux fonctions prises ensemble, sur une fiche aux proportions réelles :
   * un long chapeau, des sections plus courtes que la fenêtre, un pied de page
   * ras. C'est le seul test qui voit ce que voit le lecteur, et le seul qui ait
   * attrapé les deux défauts de la première version — le sommaire éteint
   * pendant le cinquième du défilement, et les dernières entrées jamais
   * atteintes. Vérifié d'abord dans le navigateur sur une vraie fiche, puis
   * figé ici.
   */
  const VIEWPORT = 768;
  /** Titre, résumé et étiquettes, avant le premier titre du corps. */
  const LEAD = 615;
  const SECTION = 200;
  const COUNT = 8;
  /** Projets voisins et pied de page : de quoi ne pas sauver la fin. */
  const TAIL = 100;

  const starts = Array.from({ length: COUNT }, (_, index) => LEAD + index * SECTION);
  const maxScroll = LEAD + COUNT * SECTION + TAIL - VIEWPORT;

  /** Hauteur d'une entrée du sommaire, texte sur une ligne. */
  const ITEM = 36;
  /** Fin du corps de la fiche, qui borne la dernière section. */
  const BODY_END = LEAD + COUNT * SECTION;

  /** L'entrée surlignée à cette position de défilement. */
  const activeAt = (scrollY: number) =>
    activeHeadingIndex(
      starts.map((start) => start - scrollY),
      readingLine(VIEWPORT, maxScroll - scrollY),
      VIEWPORT,
    );

  /** Le haut du curseur dans la liste, à cette position de défilement. */
  const cursorAt = (scrollY: number) => {
    const active = activeAt(scrollY);

    if (active === -1) return null;

    const line = readingLine(VIEWPORT, maxScroll - scrollY);
    const end = active + 1 < COUNT ? starts[active + 1] : BODY_END;
    const ratio = sectionRatio(starts[active], end, scrollY + line);

    return lerp(active * ITEM, Math.min(active + 1, COUNT - 1) * ITEM, ratio);
  };

  /** Le surlignage relevé tous les 5 px, du haut de la fiche jusqu'en bas. */
  const trace = Array.from({ length: Math.floor(maxScroll / 5) + 1 }, (_, step) =>
    activeAt(step * 5),
  );

  it("ne laisse jamais le sommaire éteint", async () => {
    expect(trace.filter((index) => index === -1)).toHaveLength(0);
  });

  it("allume chaque entrée à son tour", async () => {
    // Une entrée qui ne s'allume jamais est un lien mort pour le lecteur qui
    // cherche où il en est.
    expect(new Set(trace).size).toBe(COUNT);
  });

  it("ne revient jamais en arrière", async () => {
    const backwards = trace.filter((index, step) => step > 0 && index < trace[step - 1]);

    expect(backwards).toHaveLength(0);
  });

  it("finit sur la dernière section", async () => {
    expect(activeAt(maxScroll)).toBe(COUNT - 1);
  });

  it("commence sur la première", async () => {
    expect(activeAt(0)).toBe(0);
  });

  /*
   * Le curseur est ce qui répond au reproche d'un sommaire saccadé : le
   * surlignage ne change qu'une fois par section — huit fois sur toute la
   * fiche — alors que le curseur doit avancer à chaque pixel de défilement.
   */
  describe("le curseur de lecture", () => {
    const path = Array.from({ length: Math.floor(maxScroll / 5) + 1 }, (_, step) =>
      cursorAt(step * 5),
    ) as number[];

    it("est posé dès le premier pixel", async () => {
      expect(path[0]).not.toBeNull();
    });

    it("ne recule jamais", async () => {
      const backwards = path.filter((top, step) => step > 0 && top < path[step - 1]);

      expect(backwards).toHaveLength(0);
    });

    it("avance sans jamais sauter", async () => {
      // Un saut, c'est précisément ce que faisait le surlignage seul : il
      // passait d'une entrée à l'autre d'un coup, soit 36 px.
      const steps = path.map((top, step) => (step > 0 ? top - path[step - 1] : 0));

      expect(Math.max(...steps)).toBeLessThan(ITEM / 4);
    });

    it("avance vraiment, et pas seulement aux changements de section", async () => {
      // Sans interpolation, le curseur ne prendrait que huit positions.
      expect(new Set(path).size).toBeGreaterThan(path.length / 2);
    });

    it("parcourt toute la liste, de la première entrée à la dernière", async () => {
      expect(path[0]).toBe(0);
      expect(path.at(-1)).toBe((COUNT - 1) * ITEM);
    });
  });
});

describe("groupByAnchor", () => {
  /** Les liens des deux formes du sommaire, à plat comme le DOM les rend. */
  const links = [
    { form: "compact", anchor: "contexte" },
    { form: "compact", anchor: "objectifs" },
    { form: "compact", anchor: "resultats" },
    { form: "sidebar", anchor: "contexte" },
    { form: "sidebar", anchor: "objectifs" },
    { form: "sidebar", anchor: "resultats" },
  ];

  const grouped = () => groupByAnchor(links, (link) => link.anchor);

  it("rend une entrée par ancre, pas une par lien", async () => {
    // Le surlignage raisonne par section : deux entrées pour « Contexte »
    // désordonneraient les hauts de titres et désigneraient n'importe quoi.
    expect([...grouped().keys()]).toEqual(["contexte", "objectifs", "resultats"]);
  });

  it("réunit les liens des deux formes sous la même ancre", async () => {
    // On ne sait pas laquelle est affichée : les deux s'allument ensemble.
    expect(grouped().get("contexte")?.map((link) => link.form)).toEqual([
      "compact",
      "sidebar",
    ]);
  });

  it("suit l'ordre de la première apparition", async () => {
    const out = groupByAnchor(
      [{ anchor: "b" }, { anchor: "a" }, { anchor: "b" }],
      (link) => link.anchor,
    );

    expect([...out.keys()]).toEqual(["b", "a"]);
  });

  it("ne renvoie rien sans lien", async () => {
    expect(groupByAnchor([], () => "")).toEqual(new Map());
  });
});

describe("anchorFromHash", () => {
  it("retrouve une ancre accentuée, que le navigateur percent-encode", () => {
    // `new URL("#présentation", …).hash` vaut « #pr%C3%A9sentation ».
    expect(anchorFromHash("#pr%C3%A9sentation")).toBe("présentation");
  });

  it("laisse intacte une ancre sans caractère spécial", () => {
    expect(anchorFromHash("#phase-1--analyse")).toBe("phase-1--analyse");
  });

  it("accepte une ancre donnée sans son dièse", () => {
    expect(anchorFromHash("r%C3%A9sultats")).toBe("résultats");
  });

  it("ne plante pas sur un « % » isolé", () => {
    // decodeURIComponent lèverait une URIError et couperait tout le surlignage.
    expect(anchorFromHash("#100%")).toBe("100%");
  });

  it("renvoie une chaîne vide pour un hash vide", () => {
    expect(anchorFromHash("")).toBe("");
    expect(anchorFromHash("#")).toBe("");
  });
});

describe("sectionEnd", () => {
  const tops = [100, 400, 900];

  it("termine une section au titre suivant", () => {
    expect(sectionEnd(tops, 0, 1500)).toBe(400);
    expect(sectionEnd(tops, 1, 1500)).toBe(900);
  });

  it("termine la dernière section au bas du corps de la fiche", () => {
    expect(sectionEnd(tops, 2, 1500)).toBe(1500);
  });

  it("donne une longueur nulle à la dernière section sans corps mesurable", () => {
    // `sectionRatio` renvoie alors 0 : le curseur reste sur son entrée.
    expect(sectionEnd(tops, 2)).toBe(900);
    expect(sectionRatio(900, sectionEnd(tops, 2), 1200)).toBe(0);
  });
});

describe("cursorBox", () => {
  const current = { top: 0, height: 20 };
  const next = { top: 40, height: 60 };

  it("se pose sur l'entrée courante en début de section", () => {
    expect(cursorBox(current, next, 0)).toEqual(current);
  });

  it("arrive exactement sur l'entrée suivante en fin de section", () => {
    // C'est ce qui rend le passage continu : l'entrée suivante devient
    // courante à l'instant où le curseur l'atteint.
    expect(cursorBox(current, next, 1)).toEqual(next);
  });

  it("interpole la position et la hauteur ensemble", () => {
    expect(cursorBox(current, next, 0.5)).toEqual({ top: 20, height: 40 });
  });

  it("reste sur la dernière entrée, qui n'a personne vers qui glisser", () => {
    expect(cursorBox(current, undefined, 0.7)).toEqual(current);
  });
});

