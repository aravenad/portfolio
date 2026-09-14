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
  /** Précision affichée à côté du libellé dans la variante liste. */
  detail?: string;
  /** Couleur de marque appliquée au logo au survol. */
  color?: string;
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
