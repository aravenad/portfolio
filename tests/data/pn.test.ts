import { describe, expect, it } from "vitest";

import { AC_CODES, SAE_CODES, usePn } from "../../src/data/pn";
import { languages } from "../../src/lib/i18n";
import { parseAc } from "../../src/lib/competences";
import { COMPETENCES } from "../../src/types";

describe("référentiel du PN", () => {
  it("n'a que des codes d'AC bien formés, chacun une seule fois", () => {
    for (const code of AC_CODES) expect(code).toMatch(/^AC[1-3][1-6]\.0[1-4]$/);
    expect(new Set(AC_CODES).size).toBe(AC_CODES.length);
  });

  it("n'emmène au niveau 3 que Réaliser, Optimiser et Collaborer, comme le parcours A", () => {
    const top = new Set(AC_CODES.filter((code) => parseAc(code).level === 3).map((code) => parseAc(code).competence));
    expect([...top]).toEqual(["realiser", "optimiser", "collaborer"]);
  });

  describe.each(languages)("%s", (lang) => {
    const pn = usePn(lang);

    it("nomme chaque AC", () => {
      for (const code of AC_CODES) expect(pn.ac[code], code).toBeTruthy();
    });

    it("nomme chaque niveau qu'un AC atteint, et aucun autre", () => {
      for (const competence of COMPETENCES) {
        const levels = AC_CODES.map(parseAc).filter((ac) => ac.competence === competence);
        const highest = Math.max(...levels.map((ac) => ac.level));
        expect(pn.levels[competence], competence).toHaveLength(highest);
      }
    });

    it("nomme chaque SAÉ, le stage sans code", () => {
      for (const code of SAE_CODES) expect(pn.sae(code), code).toBeTruthy();
      expect(pn.sae("STAGE")).not.toContain("STAGE");
    });
  });

  it("recopie les intitulés français du PN", () => {
    const pn = usePn("fr");
    expect(pn.sae("3.Real.01")).toBe("SAÉ 3.Real.01 · Développement d'une application");
    expect(pn.ac["AC21.04"]).toBe("Vérifier et valider la qualité de l'application par les tests");
    expect(pn.levels.realiser[1]).toBe("Partir des exigences et aller jusqu'à une application complète");
  });
});
