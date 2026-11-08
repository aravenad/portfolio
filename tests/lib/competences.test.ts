import { describe, expect, it } from "vitest";

import { groupAc, parseAc } from "../../src/lib/competences";

describe("parseAc", () => {
  it("lit le niveau puis la compétence dans le code", () => {
    expect(parseAc("AC23.01")).toEqual({ level: 2, competence: "administrer" });
    expect(parseAc("AC36.04")).toEqual({ level: 3, competence: "collaborer" });
  });
});

describe("groupAc", () => {
  it("range les AC par compétence puis par niveau, dans l'ordre du PN", () => {
    expect(groupAc(["AC26.03", "AC11.01", "AC16.04", "AC21.04", "AC11.03"])).toEqual([
      {
        competence: "realiser",
        levels: [
          { level: 1, codes: ["AC11.01", "AC11.03"] },
          { level: 2, codes: ["AC21.04"] },
        ],
      },
      {
        competence: "collaborer",
        levels: [
          { level: 1, codes: ["AC16.04"] },
          { level: 2, codes: ["AC26.03"] },
        ],
      },
    ]);
  });

  it("ignore les doublons", () => {
    expect(groupAc(["AC14.01", "AC14.01"])).toEqual([
      { competence: "gerer", levels: [{ level: 1, codes: ["AC14.01"] }] },
    ]);
  });

  it("ne rend rien sans AC", () => {
    expect(groupAc([])).toEqual([]);
  });
});
