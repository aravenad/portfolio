import { describe, expect, it } from "vitest";

import {
  BALAYAGE,
  GLYPH_KEY,
  MARQUE,
  MATIERE_LARGEUR,
  NIVEAUX,
  NIVEAUX_MATIERE,
  RAMPE,
  TEINTES,
  aLaSource,
  atlas,
  bande,
  cadrageCouverture,
  cadrageFond,
  champ,
  code,
  empreinte,
  fraction,
  grille,
  lumiere,
  peindre,
  ton,
  trame,
  trameLogo,
  wireGlyphToggle,
} from "../../src/lib/glyph";

/** Un contexte 2D qui retient ce qu'on lui demande. */
function fakePinceau() {
  const textes: { texte: string; x: number; y: number; couleur: unknown }[] = [];
  const effaces: number[][] = [];
  const copies: number[][] = [];

  return {
    textes,
    effaces,
    copies,
    font: "",
    textAlign: "start" as CanvasTextAlign,
    textBaseline: "alphabetic" as CanvasTextBaseline,
    fillStyle: "" as string,
    fillText(texte: string, x: number, y: number) {
      textes.push({ texte, x, y, couleur: this.fillStyle });
    },
    clearRect: (...args: number[]) => effaces.push(args),
    drawImage: (_image: unknown, ...args: number[]) => copies.push(args),
  };
}

/** Des pixels RGBA tous gris de la même valeur. */
function gris(valeur: number, cellules: number) {
  return new Uint8ClampedArray(cellules * 4).map((_, i) => (i % 4 === 3 ? 255 : valeur));
}

describe("ton", () => {
  it("met à 0 ce qui est plus sombre que le noir, à 1 ce qui est plus clair que le blanc", () => {
    expect(ton(0)).toBe(0);
    expect(ton(NIVEAUX.noir)).toBe(0);
    expect(ton(NIVEAUX.blanc)).toBe(1);
    expect(ton(1)).toBe(1);
  });

  it("écrase les ombres : le gamma tire le milieu vers le bas", () => {
    const milieu = (NIVEAUX.noir + NIVEAUX.blanc) / 2;

    expect(ton(milieu)).toBeLessThan(0.5);
    expect(ton(milieu, { ...NIVEAUX, gamma: 1 })).toBeCloseTo(0.5);
  });
});

describe("NIVEAUX_MATIERE", () => {
  it("ouvre les niveaux de la matière sombre du fond", () => {
    expect(ton(0.13, NIVEAUX_MATIERE)).toBeGreaterThan(0.1);
    expect(ton(0.13)).toBe(0);
  });
});

describe("bande", () => {
  it("range les valeurs de la nuit au givre", () => {
    expect([0, 0.2, 0.4, 0.6, 0.8, 0.95, 1].map((t) => TEINTES[bande(t)])).toEqual([
      "nuit",
      "abysse",
      "cobalt",
      "azur",
      "ciel",
      "givre",
      "givre",
    ]);
  });
});

describe("champ", () => {
  it("lit la luminance et la saturation de chaque pixel", () => {
    const rgba = [255, 255, 255, 255, 0, 0, 0, 255, 255, 0, 0, 255];
    const { colonnes, lignes, luminance, saturation } = champ(rgba, 3, 1);

    expect([colonnes, lignes]).toEqual([3, 1]);
    expect(luminance[0]).toBeCloseTo(1);
    expect(luminance[1]).toBe(0);
    expect(luminance[2]).toBeCloseTo(0.2126);
    expect([...saturation]).toEqual([0, 0, 1]);
  });
});

describe("lumiere", () => {
  it("fait traverser un reflet, qui revient au bout d'un balayage", () => {
    const debut = lumiere(10, 10, 40, 40, 1);
    const tour = lumiere(10, 10, 40, 40, 1 + BALAYAGE);

    expect(tour).toBeCloseTo(debut, 1);
  });

  it("passe par chaque cellule : le coin bas droit s'éclaire plus tard que le haut gauche", () => {
    const pic = (x: number, y: number) => {
      let meilleur = 0;
      for (let pas = 0; pas < 90; pas++) {
        if (lumiere(x, y, 40, 40, (pas / 90) * BALAYAGE) > lumiere(x, y, 40, 40, (meilleur / 90) * BALAYAGE)) {
          meilleur = pas;
        }
      }
      return meilleur;
    };

    expect(pic(0, 0)).toBeLessThan(pic(39, 39));
  });

  it("reste discrète : jamais plus d'un quart de luminance", () => {
    for (let temps = 0; temps < BALAYAGE; temps += 0.5) {
      expect(Math.abs(lumiere(7, 3, 20, 20, temps))).toBeLessThanOrEqual(0.27);
    }
  });
});

describe("code", () => {
  it("garde 0 pour le vide, quelle que soit la teinte", () => {
    expect(code(4, 0)).toBe(0);
    expect(code(2, 3)).toBe(2 * RAMPE.length + 3);
  });
});

describe("trame", () => {
  it("laisse vide une image noire", () => {
    const sortie = trame(champ(gris(0, 16), 4, 4), new Uint8Array(16));

    expect([...sortie].every((valeur) => valeur === 0)).toBe(true);
  });

  it("couvre une image blanche du glyphe le plus plein, en givre", () => {
    const sortie = trame(champ(gris(255, 16), 4, 4), new Uint8Array(16));
    const plein = code(TEINTES.indexOf("givre"), RAMPE.length - 1);

    expect([...sortie].every((valeur) => valeur === plein)).toBe(true);
  });

  it("trame les demi-teintes : un gris uni donne plusieurs glyphes voisins", () => {
    const sortie = trame(champ(gris(140, 16), 4, 4), new Uint8Array(16));
    const glyphes = new Set([...sortie].map((valeur) => valeur % RAMPE.length));

    expect(glyphes.size).toBeGreaterThan(1);
  });

  it("passe les demi-teintes neutres en cendre, et garde les bleus pour la couleur", () => {
    const neutre = trame(champ(gris(150, 16), 4, 4), new Uint8Array(16));
    const bleu = new Uint8ClampedArray(64).map((_, i) => [80, 140, 240, 255][i % 4]);
    const colore = trame(champ(bleu, 4, 4), new Uint8Array(16));
    const teintes = (sortie: Uint8Array) =>
      new Set([...sortie].filter(Boolean).map((valeur) => TEINTES[Math.floor(valeur / RAMPE.length)]));

    expect(teintes(neutre)).toContain("cendre");
    expect(teintes(colore)).not.toContain("cendre");
  });

  it("change sous la lumière, sans toucher à la grille", () => {
    const source = champ(gris(110, 400), 20, 20);
    const fige = trame(source, new Uint8Array(400));
    const anime = trame(source, new Uint8Array(400), BALAYAGE / 2);

    expect(anime).toHaveLength(fige.length);
    expect(anime).not.toEqual(fige);
  });
});

describe("empreinte", () => {
  it("lit l'encre dans l'alpha et l'accent dans la part de vert", () => {
    const logo = empreinte([255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 0, 0], 3, 1);

    expect([...logo.encre]).toEqual([1, 128 / 255, 0].map(Math.fround));
    expect([...logo.accent]).toEqual([0, 1, 0]);
  });
});

describe("trameLogo", () => {
  /** Un logo de 4 × 4, plein d'encre, en couleur principale (0) ou d'accent (1). */
  const plein = (accent: number) =>
    empreinte(new Uint8ClampedArray(64).map((_, i) => [255 * (1 - accent), 255 * accent, 0, 255][i % 4]), 4, 4);

  it("laisse vide ce qui n'a pas d'encre", () => {
    const sortie = trameLogo(empreinte(new Uint8ClampedArray(64), 4, 4), new Uint8Array(16), BALAYAGE / 2, true);

    expect([...sortie].every((valeur) => valeur === 0)).toBe(true);
  });

  it("reste dans la palette au repos", () => {
    const sortie = trameLogo(plein(0), new Uint8Array(16));

    expect(sortie.every((valeur) => valeur > 0 && valeur < MARQUE * RAMPE.length)).toBe(true);
  });

  it("prend les couleurs de la marque au survol, accent compris", () => {
    const teintes = (accent: number) =>
      new Set([...trameLogo(plein(accent), new Uint8Array(16), null, true)].map((v) => Math.floor(v / RAMPE.length)));

    expect(teintes(0)).toEqual(new Set([MARQUE]));
    expect(teintes(1)).toEqual(new Set([MARQUE + 1]));
  });
});

describe("atlas", () => {
  it("rend chaque glyphe non vide dans chaque teinte, centré dans sa tuile", () => {
    const pinceau = fakePinceau();
    atlas(pinceau, 10, ["#000", "#111"]);

    expect(pinceau.font).toMatch(/^500 12px "IBM Plex Mono"/);
    expect(pinceau.textAlign).toBe("center");
    expect(pinceau.textBaseline).toBe("middle");
    expect(pinceau.textes).toHaveLength(2 * (RAMPE.length - 1));
    expect(pinceau.textes[0]).toEqual({ texte: "·", x: 15, y: 5.6000000000000005, couleur: "#000" });
    expect(pinceau.textes.at(-1)).toMatchObject({ texte: "#", couleur: "#111" });
  });
});

describe("peindre", () => {
  it("ne repeint que les cellules qui ont changé, et les retient", () => {
    const pinceau = fakePinceau();
    const avant = new Uint8Array([0, 9, 255]);
    const codes = new Uint8Array([0, 10, 0]);

    expect(peindre(pinceau, {} as CanvasImageSource, codes, avant, 2, 8)).toBe(2);
    expect(pinceau.effaces).toEqual([
      [8, 0, 8, 8],
      [0, 8, 8, 8],
    ]);
    // Code 10 : teinte 1, glyphe 2.
    expect(pinceau.copies).toEqual([[16, 8, 8, 8, 8, 0, 8, 8]]);
    expect([...avant]).toEqual([0, 10, 0]);
    expect(peindre(pinceau, {} as CanvasImageSource, codes, avant, 2, 8)).toBe(0);
  });
});

describe("grille", () => {
  it("couvre toute la surface, au moins d'une cellule", () => {
    expect(grille(100, 45, 10)).toEqual({ colonnes: 10, lignes: 5 });
    expect(grille(0, 0, 10)).toEqual({ colonnes: 1, lignes: 1 });
  });
});

describe("cadrageFond", () => {
  it("reprend le départ de motif du fond, quelle que soit la largeur", () => {
    expect(cadrageFond(1920, 1024).sy).toBeCloseTo(0.87 * MATIERE_LARGEUR);
    expect(cadrageFond(1920, 1024)).toMatchObject({ sx: 0, sw: 1920, sh: 1024 });
  });

  it("garde une image large de 64rem au moins, centrée", () => {
    const etroit = cadrageFond(512, 1024);

    expect(etroit.sw).toBeCloseTo(960);
    expect(etroit.sx).toBeCloseTo(480);
    expect(etroit.sh).toBeCloseTo(1920);
  });
});

describe("cadrageCouverture", () => {
  it("cadre un fragment agrandi à 360 %, placé comme un background-position", () => {
    const gauche = cadrageCouverture(360, 200, 0, 0);
    const droite = cadrageCouverture(360, 200, 1, 1);

    expect(gauche).toMatchObject({ sx: 0, sy: 0 });
    expect(gauche.sw).toBeCloseTo(MATIERE_LARGEUR / 3.6);
    expect(droite.sx + droite.sw).toBeCloseTo(MATIERE_LARGEUR);
    expect(droite.sy + droite.sh).toBeCloseTo(3770);
  });
});

describe("aLaSource", () => {
  it("ramène un cadre de la matière pleine taille à la copie réduite", () => {
    const plein = cadrageCouverture(360, 200, 1, 1);
    const reduit = aLaSource(plein, 480);

    expect(reduit.sx + reduit.sw).toBeCloseTo(480);
    expect(reduit.sy + reduit.sh).toBeCloseTo((3770 * 480) / MATIERE_LARGEUR);
    expect(aLaSource(plein, MATIERE_LARGEUR)).toEqual(plein);
  });
});

describe("fraction", () => {
  it("lit un pourcentage, borné entre 0 et 1", () => {
    expect(fraction("22%")).toBeCloseTo(0.22);
    expect(fraction(" 140% ")).toBe(1);
  });

  it("se replie sur le centre si la valeur manque", () => {
    expect(fraction("")).toBe(0.5);
    expect(fraction("", 0.3)).toBe(0.3);
  });
});

describe("wireGlyphToggle", () => {
  it("bascule data-glyph et mémorise sous la clé que lit BaseLayout", () => {
    let onClick: (() => void) | undefined;
    const pressed: string[] = [];
    const button = {
      setAttribute: (_name: string, value: string) => pressed.push(value),
      addEventListener: (_type: string, listener: () => void) => {
        onClick = listener;
      },
    };
    const root = { dataset: {} as DOMStringMap };
    const values = new Map<string, string>();

    wireGlyphToggle(
      [button],
      root,
      () => ({ setItem: (key: string, value: string) => values.set(key, value) }),
      new AbortController().signal,
    );
    onClick?.();

    expect(GLYPH_KEY).toBe("glyph");
    expect(root.dataset.glyph).toBe("off");
    expect(pressed).toEqual(["true", "false"]);
    expect(values.get("glyph")).toBe("off");
  });
});
