import { AC_CODES, type AcCode } from "../data/pn";
import { COMPETENCES, type Competence } from "../types";

/** Les AC d'une fiche pour un niveau d'une compétence. */
export interface AcLevel {
  level: number;
  codes: AcCode[];
}

/** Les AC d'une fiche pour une compétence, du niveau le plus bas au plus haut. */
export interface AcGroup {
  competence: Competence;
  levels: AcLevel[];
}

/**
 * Lit la compétence et le niveau dans le code d'un AC : `AC23.01` est au
 * niveau 2 de la troisième compétence, Administrer.
 */
export function parseAc(code: AcCode): { competence: Competence; level: number } {
  return { level: Number(code[2]), competence: COMPETENCES[Number(code[3]) - 1] };
}

/**
 * Range les AC d'une fiche par compétence puis par niveau, dans l'ordre du PN
 * quel que soit celui du fichier, sans doublon. Une fiche n'écrit donc que ses
 * AC : les compétences et les niveaux s'en déduisent.
 */
export function groupAc(codes: readonly AcCode[]): AcGroup[] {
  const groups: AcGroup[] = [];

  for (const code of AC_CODES.filter((code) => codes.includes(code))) {
    const { competence, level } = parseAc(code);
    let group = groups.find((group) => group.competence === competence);
    if (!group) groups.push((group = { competence, levels: [] }));

    let entry = group.levels.find((entry) => entry.level === level);
    if (!entry) group.levels.push((entry = { level, codes: [] }));
    entry.codes.push(code);
  }

  return groups.sort(
    (a, b) => COMPETENCES.indexOf(a.competence) - COMPETENCES.indexOf(b.competence),
  );
}
