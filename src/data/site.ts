import type { NavLink, SocialLink } from "../types";

/** Informations globales du site. */
export const site = {
  name: "Damien",
  author: "Damien Aravena Bravo",
  title: "Damien — Portfolio",
  // Les aperçus LinkedIn demandent au moins 100 caractères de description.
  description:
    "Portfolio de Damien Aravena Bravo, étudiant en BUT Informatique à Grenoble : projets de développement web, d'applications Java et de bases de données.",
  email: "damien.aravena@gmail.com",
  github: "https://github.com/aravenad",
  linkedin: "https://www.linkedin.com/in/aravenad/",
} as const;

/** Même ordre que les sections de l'accueil. */
export const navLinks: NavLink[] = [
  { label: "Compétences", href: "/#skills", sections: ["skills", "soft-skills"] },
  { label: "Parcours", href: "/#career", sections: ["career"] },
  { label: "Projets", href: "/projects", sections: ["projects"] },
  { label: "Contact", href: "/#contact", sections: ["contact"] },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "Email", href: `mailto:${site.email}` },
];
