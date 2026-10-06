import type { Skill } from "../types";

/**
 * Les couleurs de marque d'une compétence, en variables CSS pour l'attribut
 * `style` : `--skill-color`, `--skill-color-2` (logo bicolore) et
 * `--skill-color-light` (thème clair).
 *
 * Elles ne sont que transportées : ce sont les règles de survol de SkillTile
 * et de SkillChip qui les allument. Sans aucune couleur, rien n'est posé, et
 * le logo garde `currentColor`.
 */
export function brandStyle(skill: Skill): string | undefined {
  return (
    [
      skill.color && `--skill-color: ${skill.color}`,
      skill.color2 && `--skill-color-2: ${skill.color2}`,
      skill.colorLight && `--skill-color-light: ${skill.colorLight}`,
    ]
      .filter(Boolean)
      .join("; ") || undefined
  );
}
