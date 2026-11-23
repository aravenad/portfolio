import type { Lang } from "../lib/i18n";

/**
 * Le stage recherché, source unique de ses dates : le hero, la section Contact
 * et le parcours les lisent ici, pour ne plus diverger. La fiche
 * src/content/projects/stage-2027.md les répète en Markdown : à corriger à la
 * main si elles changent.
 */
export const internship = {
  /**
   * Passe à `false` le jour où le stage est trouvé : la ligne de disponibilité
   * du hero disparaît. Les textes de Contact et du parcours restent à réécrire.
   */
  open: true,
  start: "2027-04-19",
  end: "2027-06-25",
  /** Prolongation possible, au-delà des 10 à 12 semaines. */
  extendedTo: "2027-07-09",
} as const;

/**
 * « 19 avril » ou « 25 juin 2027 » ; « April 19 » ou « June 25, 2027 ». Les
 * espaces sont insécables, comme dans les dates écrites jusqu'ici : le jour ne
 * se sépare pas de son mois en fin de ligne.
 */
export function formatDay(iso: string, lang: Lang, withYear = false): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    ...(withYear && { year: "numeric" }),
    timeZone: "UTC",
  })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace(/\s/g, "\u00a0");
}

/** Les dates du stage, telles que les phrases du site les citent. */
export function internshipDates(lang: Lang) {
  return {
    start: formatDay(internship.start, lang),
    end: formatDay(internship.end, lang, true),
    extendedTo: formatDay(internship.extendedTo, lang),
  };
}
