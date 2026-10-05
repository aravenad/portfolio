/** Avancement d'un projet, tel qu'écrit dans l'en-tête des fiches. */
export type ProjectStatus = "termine" | "en-cours" | "a-venir";

/**
 * Les six compétences du BUT Informatique, dans l'ordre du Programme National.
 * Une fiche cite celles que le projet mobilise ; leurs intitulés sont dans
 * src/data/ui.ts.
 */
export const COMPETENCES = [
  "realiser",
  "optimiser",
  "administrer",
  "gerer",
  "conduire",
  "collaborer",
] as const;

export type Competence = (typeof COMPETENCES)[number];

/**
 * Motifs dessinés sur la couverture d'une carte projet (ProjectCover.astro) :
 * diagramme de classes, barres d'un tri, fenêtre de navigateur, schéma
 * entités-associations, courbe, serveur en réseau, terminal.
 */
export const COVERS = ["uml", "algo", "web", "erd", "chart", "network", "terminal"] as const;

export type Cover = (typeof COVERS)[number];

export interface NavLink {
  label: string;
  href: string;
  /** Ids des sections de l'accueil qui rendent ce lien actif au défilement. */
  sections?: string[];
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Skill {
  /** Libellé affiché dans la tuile. */
  label: string;
  /** Version courte affichée quand aucune icône n'existe (2 à 4 caractères). */
  short?: string;
  /** Icône Iconify, par exemple `simple-icons:php`. */
  icon?: string;
  /**
   * Logo dessiné au trait plutôt qu'en glyphe plein. Déclenche une correction
   * de poids optique dans la tuile — voir SkillTile.astro.
   */
  lineArt?: boolean;
  /** Précision affichée à côté du libellé dans la variante liste. */
  detail?: string;
  /** Couleur de marque appliquée au logo au survol. */
  color?: string;
  /**
   * Seconde couleur de marque, pour les rares logos bicolores. Elle est exposée
   * au logo sous `--logo-accent` au survol ; à lui de décider quelles parties la
   * prennent. Seul Java s'en sert aujourd'hui — sa vapeur.
   */
  color2?: string;
  /**
   * Couleur de marque en thème clair, pour les marques dont la couleur du
   * thème sombre disparaîtrait sur une tuile claire (le blanc de GitHub, le
   * jaune de JavaScript). Les autres gardent leur couleur vive dans les deux
   * thèmes.
   */
  colorLight?: string;
}

export interface CareerRole {
  title: string;
  /** Type de contrat : CDI, CDD, stage… */
  contract?: string;
  period: string;
  description?: string;
}

export interface CareerEntry {
  /** Intitulé du poste ou du diplôme. Omis quand `roles` est renseigné. */
  title?: string;
  organization: string;
  location?: string;
  /** Période affichée telle quelle, par exemple « Depuis septembre 2023 ». */
  period: string;
  description?: string;
  /** Postes successifs occupés dans la même structure. */
  roles?: CareerRole[];
  /** Logo déposé dans `public/logos/`, prioritaire sur `icon`. */
  logo?: string;
  /** Icône Iconify, par exemple `simple-icons:siemens`. */
  icon?: string;
  /** Repli affiché quand aucun logo n'est disponible. */
  initials?: string;
}
