import { frenchSpacing } from "../lib/typography";
import type { NavLink, SocialLink } from "../types";

/** Informations globales du site. */
export const site = {
  /** Prénom : l'accroche du hero, le pied de page, les titres d'onglet. */
  name: "Damien",
  /** Nom affiché en logo dans la barre de navigation. */
  brand: "Damien Aravena",
  author: "Damien Aravena Bravo",
  // Le nom complet, pas le seul prénom : c'est lui qu'on tape pour trouver le
  // site, et Google pèse fortement le titre de la page.
  title: "Damien Aravena Bravo | Portfolio",
  // Les aperçus LinkedIn demandent au moins 100 caractères de description.
  description: frenchSpacing(
    "Portfolio de Damien Aravena Bravo, étudiant en BUT Informatique à Grenoble : projets de développement web, d'applications Java et de bases de données.",
  ),
  email: "damien.aravena@gmail.com",
  github: "https://github.com/aravenad",
  linkedin: "https://www.linkedin.com/in/aravenad/",
  /**
   * L'hébergeur, que les mentions légales doivent nommer (LCEN, art. 1-1).
   * Adresse relevée le 6 octobre 2026 dans la déclaration de confidentialité
   * de GitHub. GitHub ne publie pas de téléphone, et un éditeur non
   * professionnel n'est tenu de donner que le nom et l'adresse.
   */
  host: {
    name: "GitHub Pages (GitHub, Inc.)",
    street: "88 Colin P. Kelly Jr. Street",
    city: "San Francisco, CA 94107",
    url: "https://pages.github.com",
    privacy: "https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement",
  },
  /**
   * Le bureau d'enregistrement du domaine, qui en gère aussi les DNS. Il
   * n'héberge rien : la LCEN ne l'exige pas, il est cité par transparence.
   */
  registrar: {
    domain: "damien-aravena.fr",
    name: "Infomaniak Network SA",
    street: "Rue Eugène-Marziano 25",
    city: "1227 Les Acacias (Genève)",
    url: "https://www.infomaniak.com",
  },
} as const;

/**
 * Même ordre que les sections de l'accueil. Les `href` sont neutres : le header
 * y ajoute le préfixe de la langue (`localizedUrl`).
 */
export const navLinks: NavLink[] = [
  { label: "À propos", href: "/#about", sections: ["about"] },
  { label: "Compétences", href: "/#skills", sections: ["skills", "soft-skills"] },
  { label: "Parcours", href: "/#career", sections: ["career"] },
  { label: "Projets", href: "/projects", sections: ["projects"] },
  { label: "Contact", href: "/#contact", sections: ["contact"] },
];

/** Les mêmes liens en anglais : seuls les libellés changent. */
export const navLinksEn: NavLink[] = [
  { label: "About", href: "/#about", sections: ["about"] },
  { label: "Skills", href: "/#skills", sections: ["skills", "soft-skills"] },
  { label: "Background", href: "/#career", sections: ["career"] },
  { label: "Projects", href: "/projects", sections: ["projects"] },
  { label: "Contact", href: "/#contact", sections: ["contact"] },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "Email", href: `mailto:${site.email}` },
];
