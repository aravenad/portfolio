import { describe, expect, it } from "vitest";

import { RAMPE, TEINTES } from "../../src/lib/glyph";
import {
  BORDURE,
  CELLULE,
  COLONNE,
  DUREE,
  ECART,
  HOULE,
  LARGEUR,
  PAS,
  SACCADE,
  adoucir,
  bordure,
  bruit,
  cellule,
  front,
  imagesDuMasque,
  inverse,
  peindreFront,
  positionsDuMasque,
  rayon,
  retards,
  taillesDuMasque,
  seuil,
  table,
  type Toile,
} from "../../src/lib/theme-front";

describe("adoucir", () => {
  it("part de 0, passe par le milieu à mi-course et finit à 1", () => {
    expect(adoucir(0)).toBe(0);
    expect(adoucir(0.5)).toBeCloseTo(0.5);
    expect(adoucir(1)).toBe(1);
  });

  it("démarre et s'arrête en douceur", () => {
    expect(adoucir(0.1)).toBeLessThan(0.1);
    expect(adoucir(0.9)).toBeGreaterThan(0.9);
  });

  it("borne le temps hors de la course", () => {
    expect(adoucir(-1)).toBe(0);
    expect(adoucir(2)).toBe(1);
  });
});

describe("bruit", () => {
  it("reste dans [0, 1[ et ne change pas d'une image à l'autre", () => {
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const valeur = bruit(x, y);
        expect(valeur).toBeGreaterThanOrEqual(0);
        expect(valeur).toBeLessThan(1);
        expect(bruit(x, y)).toBe(valeur);
      }
    }
  });

  it("varie d'une cellule à sa voisine", () => {
    const valeurs = new Set(Array.from({ length: 40 }, (_, x) => bruit(x, 3)));
    expect(valeurs.size).toBe(40);
  });
});

describe("front", () => {
  it("couvre la fenêtre de cellules de la trame du fond", () => {
    const grille = front(100, 50);

    expect(grille.colonnes).toBe(Math.ceil(100 / CELLULE));
    expect(grille.lignes).toBe(Math.ceil(50 / CELLULE));
    expect(grille.distances).toHaveLength(grille.colonnes * grille.lignes);
  });

  /** Le retard de la colonne de la cellule `x`. */
  const retardDe = (grille: ReturnType<typeof front>, x: number) =>
    grille.retards[Math.floor((x * CELLULE) / COLONNE)];

  it("mesure chaque cellule depuis le haut, en retard de sa colonne, à l'écart du bruit près", () => {
    const grille = front(900, 600, "descend", 7);

    grille.distances.forEach((distance, i) => {
      const x = i % grille.colonnes;
      const y = Math.floor(i / grille.colonnes);
      const attendue = (y + 0.5) * CELLULE + retardDe(grille, x);
      expect(Math.abs(distance - attendue)).toBeLessThanOrEqual(ECART / 2 + 0.01);
    });
  });

  it("mesure depuis le bas quand le front monte", () => {
    const grille = front(900, 600, "monte", 7);
    const derniere = (grille.lignes - 1) * grille.colonnes;
    const retard = retardDe(grille, 0);

    expect(Math.abs(grille.distances[derniere] - CELLULE / 2 - retard)).toBeLessThanOrEqual(ECART / 2 + 0.01);
    expect(Math.abs(grille.distances[0] - (grille.lignes - 0.5) * CELLULE - retard)).toBeLessThanOrEqual(
      ECART / 2 + 0.01,
    );
  });

  it("découpe la fenêtre en colonnes du front", () => {
    expect(front(900, 600).retards).toHaveLength(Math.ceil(900 / COLONNE));
  });

  it("finit sa course quand le front a quitté le bas de la fenêtre", () => {
    const grille = front(1440, 900, "descend", 3);
    const plusBas = Math.max(...grille.distances);

    expect(grille.fin - LARGEUR).toBeGreaterThan(plusBas);
  });
});

describe("rayon", () => {
  const grille = front(1440, 900);

  it("part du haut et finit au bout de la course", () => {
    expect(rayon(grille, 0)).toBe(0);
    expect(rayon(grille, DUREE / 2)).toBeCloseTo(grille.fin / 2);
    expect(rayon(grille, DUREE)).toBeCloseTo(grille.fin);
    expect(rayon(grille, DUREE * 2)).toBeCloseTo(grille.fin);
  });
});

describe("retards", () => {
  it("restent dans la houle et la saccade, sans avance, en pixels entiers", () => {
    for (const graine of [0, 1, 42, 99999]) {
      for (const retard of retards(60, graine)) {
        expect(retard).toBeGreaterThanOrEqual(0);
        expect(retard).toBeLessThanOrEqual(2 * HOULE + SACCADE);
        expect(Number.isInteger(retard)).toBe(true);
      }
    }
  });

  it("dessinent un bord irrégulier, qui n'est pas une ligne droite", () => {
    const valeurs = [...retards(60, 5)];
    expect(Math.max(...valeurs) - Math.min(...valeurs)).toBeGreaterThan(HOULE);
  });

  it("gardent la même forme pour une graine, en changent pour une autre", () => {
    expect([...retards(30, 5)]).toEqual([...retards(30, 5)]);
    expect([...retards(30, 5)]).not.toEqual([...retards(30, 6)]);
  });
});

describe("bordure", () => {
  /** Le SVG d'une bordure, décodé. */
  const svg = (url: string) => decodeURIComponent(url.slice('url("data:image/svg+xml,'.length, -2));
  const grille = front(300, 200, "descend", 11);

  it("est une image SVG d'une colonne par retard, de la hauteur du bord", () => {
    const image = svg(bordure(grille));

    expect(image).toContain(`width="${grille.retards.length * COLONNE}" height="${BORDURE}"`);
    expect(image.match(/<rect /g)).toHaveLength(grille.retards.length);
  });

  it("met chaque dégradé en retard de sa colonne", () => {
    const image = svg(bordure(grille));
    const max = 2 * HOULE + SACCADE;

    grille.retards.forEach((retard, i) =>
      expect(image).toContain(`<rect x="${i * COLONNE}" y="${max - retard}" width="${COLONNE}" height="${LARGEUR}"`),
    );
  });

  it("se retourne quand le front monte", () => {
    expect(svg(bordure(grille))).not.toContain("transform");
    expect(svg(bordure(front(300, 200, "monte", 11)))).toContain(`matrix(1 0 0 -1 0 ${BORDURE})`);
  });
});

describe("taillesDuMasque", () => {
  it("donne au bord la taille de son image, à l'aplat la hauteur de la course", () => {
    const grille = front(300, 200, "descend", 2);

    expect(taillesDuMasque(grille)).toBe(`${grille.retards.length * COLONNE}px ${BORDURE}px, 100% ${grille.fin}px`);
  });
});

describe("imagesDuMasque", () => {
  it("prend la course du masque sur rayon(), du départ à l'arrivée", () => {
    const grille = front(300, 200, "descend", 2);
    const images = imagesDuMasque(grille, 10);

    expect(images).toHaveLength(11);
    expect(images[0]).toEqual({ offset: 0, maskPosition: positionsDuMasque(grille, 0) });
    expect(images[5]).toEqual({ offset: 0.5, maskPosition: positionsDuMasque(grille, rayon(grille, DUREE / 2)) });
    expect(images[10]).toEqual({ offset: 1, maskPosition: positionsDuMasque(grille, grille.fin) });
  });

  it("suit l'adoucissement entre deux images, à l'arrondi des positions près", () => {
    const grille = front(1440, 900, "monte", 3);
    const images = imagesDuMasque(grille);
    const bord = (position: string) => Number.parseFloat(position.split(" ")[1]);

    for (let t = 0; t <= 1; t += 0.01) {
      const k = Math.min(images.length - 2, Math.floor(t * (images.length - 1)));
      const [a, b] = [images[k], images[k + 1]];
      const f = (t - Number(a.offset)) / (Number(b.offset) - Number(a.offset));
      const interpole = bord(String(a.maskPosition)) * (1 - f) + bord(String(b.maskPosition)) * f;

      // Chaque position est arrondie au pixel : un demi-pixel d'écart de chaque côté.
      expect(Math.abs(interpole - bord(positionsDuMasque(grille, rayon(grille, t * DUREE))))).toBeLessThan(1.6);
    }
  });
});

describe("positionsDuMasque", () => {
  it("fait descendre le bord, l'aplat juste au-dessus, d'un pixel en recouvrement", () => {
    const grille = front(300, 200, "descend", 1);

    expect(positionsDuMasque(grille, 500.4)).toBe(`0px ${500 - BORDURE}px, 0px ${500 - BORDURE - grille.fin + 1}px`);
  });

  it("fait monter le bord depuis le bas, l'aplat juste en dessous", () => {
    const grille = front(300, 200, "monte", 1);

    expect(positionsDuMasque(grille, 0)).toBe(`0px 200px, 0px ${200 + BORDURE - 1}px`);
    expect(positionsDuMasque(grille, 120)).toBe(`0px 80px, 0px ${80 + BORDURE - 1}px`);
  });

  it("cache toute la nouvelle page au départ et la découvre toute à l'arrivée", () => {
    for (const sens of ["descend", "monte"] as const) {
      const grille = front(300, 200, sens, 4);
      const [bordDepart] = positionsDuMasque(grille, 0).split(", ").map((p) => Number.parseFloat(p.split(" ")[1]));
      const [bordFin, aplatFin] = positionsDuMasque(grille, grille.fin)
        .split(", ")
        .map((p) => Number.parseFloat(p.split(" ")[1]));

      if (sens === "descend") {
        // Le bord entier au-dessus de la fenêtre, puis l'aplat la couvrant toute.
        expect(bordDepart + BORDURE).toBeLessThanOrEqual(0);
        expect(aplatFin).toBeLessThanOrEqual(0);
        expect(aplatFin + grille.fin).toBeGreaterThanOrEqual(200);
      } else {
        expect(bordDepart).toBeGreaterThanOrEqual(200);
        expect(bordFin + BORDURE).toBeLessThanOrEqual(0);
        expect(aplatFin).toBeLessThanOrEqual(0);
      }
    }
  });
});

describe("inverse", () => {
  it("alterne le sens d'un changement à l'autre", () => {
    expect(inverse("descend")).toBe("monte");
    expect(inverse("monte")).toBe("descend");
  });
});

describe("cellule", () => {
  it("n'affiche rien hors du front", () => {
    expect(cellule(0, 0.5)).toBeNull();
    expect(cellule(-0.2, 0.5)).toBeNull();
    expect(cellule(1, 0.5)).toBeNull();
    expect(cellule(1.3, 0.5)).toBeNull();
  });

  it("n'affiche rien là où l'encre est trop faible pour un glyphe", () => {
    expect(cellule(0.01, 0.1)).toBeNull();
    expect(cellule(0.99, 0.1)).toBeNull();
  });

  it("prend les teintes du nouveau thème au seuil de sa case", () => {
    expect(cellule(0.3, 0.4)?.nouveau).toBe(false);
    expect(cellule(0.5, 0.4)?.nouveau).toBe(true);
  });

  it("s'estompe vers les bords du front", () => {
    for (const p of [0.2, 0.4, 0.5, 0.6, 0.8]) expect(cellule(p, 0.5)?.opacite).toBe(1);
    expect(cellule(0.05, 0.5)!.opacite).toBeLessThan(1);
    expect(cellule(0.95, 0.5)!.opacite).toBeLessThan(1);
  });

  it("encre le plus au milieu du front, sans dépasser l'azur", () => {
    const milieu = cellule(0.5, 0.5)!;
    const bord = cellule(0.05, 0.5)!;

    expect(milieu.glyphe).toBe(RAMPE.length - 1);
    expect(milieu.teinte).toBe(TEINTES.indexOf("azur"));
    expect(bord.glyphe).toBeLessThan(milieu.glyphe);
    expect(bord.teinte).toBeLessThan(milieu.teinte);

    for (let p = 0.01; p < 1; p += 0.01) {
      for (const s of [0.5 / 16, 15.5 / 16]) {
        const etat = cellule(p, s);
        if (etat) expect(etat.teinte).toBeLessThanOrEqual(TEINTES.indexOf("azur"));
      }
    }
  });
});

describe("table", () => {
  it("reprend l'état de cellule() au centre de chaque pas", () => {
    const { glyphes, teintes, opacites } = table();

    for (let k = 0; k < PAS; k += 7) {
      for (let b = 0; b < 16; b++) {
        const etat = cellule((k + 0.5) / PAS, (b + 0.5) / 16);
        const i = k * 16 + b;

        expect(glyphes[i]).toBe(etat?.glyphe ?? 0);
        if (!etat) continue;
        expect(teintes[i]).toBe((etat.nouveau ? TEINTES.length : 0) + etat.teinte);
        expect(opacites[i]).toBeCloseTo(etat.opacite);
      }
    }
  });
});

describe("seuil", () => {
  it("suit la matrice de Bayer, de période 4", () => {
    expect(seuil(0, 0)).toBe(0.5 / 16);
    expect(seuil(1, 0)).toBe(8.5 / 16);
    expect(seuil(4, 4)).toBe(seuil(0, 0));
  });
});

describe("peindreFront", () => {
  /** Un contexte 2D qui retient ce qu'on lui demande. */
  function fakeToile() {
    const glyphes: { sx: number; sy: number; dx: number; dy: number }[] = [];
    const effacements: number[][] = [];

    const toile: Toile = {
      globalAlpha: 1,
      clearRect: (...args) => effacements.push(args),
      drawImage: (_image, sx, sy, _sw, _sh, dx, dy) => glyphes.push({ sx, sy, dx, dy }),
    };

    return { toile, glyphes, effacements };
  }

  const tuile = 18;
  const tuiles = { height: tuile * TEINTES.length * 2 } as unknown as CanvasImageSource;
  const grille = front(300, 200);

  it("efface la toile, puis ne peint que les glyphes du front", () => {
    const { toile, glyphes, effacements } = fakeToile();
    const bord = 150;

    const compte = peindreFront(toile, tuiles, tuile, grille, bord);

    expect(effacements).toEqual([[0, 0, grille.colonnes * CELLULE, grille.lignes * CELLULE]]);
    // Toute la grille, au pas de la table : la peinture ne doit en oublier aucune.
    const attendus = [...grille.distances].filter((d, i) => {
      const x = i % grille.colonnes;
      const y = Math.floor(i / grille.colonnes);
      const p = (bord - d) / LARGEUR;
      return p > 0 && p < 1 && cellule((Math.floor(p * PAS) + 0.5) / PAS, seuil(x, y)) !== null;
    }).length;
    expect(attendus).toBeGreaterThan(0);
    expect(compte).toBe(attendus);
    expect(glyphes).toHaveLength(attendus);
    expect(toile.globalAlpha).toBe(1);
  });

  it("mêle les teintes de l'ancien thème et du nouveau, alignées sur la trame", () => {
    const { toile, glyphes } = fakeToile();

    peindreFront(toile, tuiles, tuile, grille, 150);

    const lignes = new Set(glyphes.map((glyphe) => glyphe.sy / tuile >= TEINTES.length));
    expect(lignes).toEqual(new Set([false, true]));
    for (const glyphe of glyphes) {
      expect(glyphe.sx % tuile).toBe(0);
      expect(glyphe.sx).toBeGreaterThan(0);
      expect(glyphe.dx % CELLULE).toBe(0);
    }
  });

  it("peint aussi le front qui monte, depuis le bas", () => {
    const { toile, glyphes } = fakeToile();
    const montant = front(300, 200, "monte");

    expect(peindreFront(toile, tuiles, tuile, montant, 120)).toBeGreaterThan(0);
    expect(Math.min(...glyphes.map((glyphe) => glyphe.dy))).toBeGreaterThan(50);
  });

  it("ne peint plus rien une fois le front sorti de la fenêtre", () => {
    const { toile, glyphes } = fakeToile();

    expect(peindreFront(toile, tuiles, tuile, grille, grille.fin)).toBe(0);
    expect(glyphes).toEqual([]);
  });
});
