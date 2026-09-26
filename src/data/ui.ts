import type { Lang } from "../lib/i18n";
import type { ProjectStatus } from "../types";
import { site } from "./site";

/**
 * Tous les textes de l'interface, dans chaque langue.
 *
 * Le français fait référence : l'anglais doit avoir exactement la même forme
 * (`satisfies Dictionary`), si bien qu'un texte ajouté d'un côté et oublié de
 * l'autre arrête la compilation au lieu d'afficher un trou.
 *
 * Les contenus longs vivent ailleurs, à côté de leur version française :
 * compétences et parcours dans `skills.ts` et `career.ts` (`…En`), fiches
 * projet dans `src/content/projects/en/`.
 */
const fr = {
  /** Valeur de `<html lang>` et de `og:locale`. */
  htmlLang: "fr",
  ogLocale: "fr_FR",

  meta: {
    title: site.title,
    description: site.description,
    ogImageAlt: "Damien Aravena Bravo, étudiant en BUT Informatique à Grenoble",
  },

  header: {
    navLabel: "Navigation principale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    /** Le bouton bascule le thème clair : il est « pressé » quand le clair est actif. */
    lightTheme: "Thème clair",
    /** Lien vers l'autre langue : texte court, nom complet pour les lecteurs d'écran. */
    otherLang: { short: "EN", label: "English version" },
  },

  hero: {
    intro: "Bonjour, moi c'est",
    description:
      "Étudiant en BUT informatique à Grenoble, je développe des applications, des sites web et différents projets logiciels.",
    projects: "Voir mes projets",
    contact: "Me contacter",
  },

  skills: {
    technical: {
      title: "Compétences techniques",
      paragraphs: [
        "Au fil de mes projets et de ma formation, j'ai pratiqué plusieurs langages et environnements de développement. Côté web, je travaille avec HTML, CSS, PHP et JavaScript. J'ai également développé en Java et en Python pour la programmation orientée objet, et en C++ pour une approche plus procédurale. Je manipule enfin les données en SQL, avec une pratique plus poussée de PostgreSQL.",
        "Côté outils, j'utilise les IDE de la suite JetBrains adaptés à ces langages, ainsi que Git et GitHub pour le versionnement et le travail collaboratif.",
      ],
    },
    soft: {
      title: "Compétences transversales",
      paragraphs: [
        "La plupart de mes projets se sont déroulés en équipe, de deux à sept personnes. J'y ai appris à répartir le travail, à tenir des délais et à documenter mes choix pour que les autres puissent reprendre le code derrière moi.",
        "Plusieurs d'entre eux m'ont demandé de sortir du code : recueillir un besoin auprès d'un client, vulgariser un sujet technique pour un public qui ne l'est pas, ou rédiger en anglais un guide d'installation suffisamment précis pour être reproduit pas à pas.",
      ],
    },
  },

  career: {
    title: "Parcours",
    description: "Ma formation et les expériences qui m'ont fait découvrir le métier.",
    experience: "Expérience",
    education: "Formation",
  },

  projects: {
    previewTitle: "Mes projets",
    previewDescription: "Ces compétences se retrouvent dans les projets menés durant ma formation.",
    seeAll: "Voir tous les projets",
    listTitle: "Tous mes projets",
    listDescription:
      "L'ensemble des projets réalisés durant ma formation, du plus ancien au plus récent.",
    listMetaTitle: "Projets — Damien",
    listMetaDescription:
      "Les projets réalisés par Damien Aravena Bravo en BUT Informatique : développement web, applications Java, bases de données et services réseau.",
    pageMetaTitle: (page: number) => `Projets, page ${page} — Damien`,
    pageMetaDescription: (page: number) =>
      `Les projets réalisés par Damien Aravena Bravo en BUT Informatique : développement web, applications Java, bases de données et services réseau (page ${page}).`,
    pageOf: (page: number, total: number) => `Page ${page} sur ${total}`,
    discover: "Découvrir le projet",
    neighbors: "Projets précédent et suivant",
    status: {
      termine: "Terminé",
      "en-cours": "En cours",
      "a-venir": "À venir",
    } satisfies Record<ProjectStatus, string>,
  },

  contact: {
    title: "Me contacter",
    description:
      "Je recherche un stage de 10 à 12 semaines, du 19 avril au 25 juin 2027, prolongeable jusqu'au 9 juillet, pour valider ma deuxième année de BUT Informatique. Une question, une opportunité ? Écris-moi.",
    email: "Envoyer un e-mail",
    cv: "Télécharger mon CV",
    github: "Voir mon GitHub",
  },

  breadcrumb: {
    label: "Fil d'Ariane",
    home: "Accueil",
    projects: "Projets",
    page: (page: number) => `Page ${page}`,
  },

  pagination: {
    label: "Pagination",
    previous: "Précédent",
    next: "Suivant",
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    page: (page: number) => `Page ${page}`,
  },

  toc: { title: "Sur cette page" },
  backToTop: "Revenir en haut de la page",
  footer: { rights: "Tous droits réservés." },
};

export type Dictionary = typeof fr;

const en = {
  htmlLang: "en",
  ogLocale: "en_US",

  meta: {
    title: "Damien — Portfolio",
    description:
      "Portfolio of Damien Aravena Bravo, computer science student (BUT Informatique) in Grenoble: web development, Java applications and database projects.",
    ogImageAlt: "Damien Aravena Bravo, computer science student in Grenoble",
  },

  header: {
    navLabel: "Main navigation",
    openMenu: "Open the menu",
    closeMenu: "Close the menu",
    lightTheme: "Light theme",
    otherLang: { short: "FR", label: "Version française" },
  },

  hero: {
    intro: "Hi, I'm",
    description:
      "Computer science student in Grenoble, I build applications, websites and all kinds of software projects.",
    projects: "See my projects",
    contact: "Contact me",
  },

  skills: {
    technical: {
      title: "Technical skills",
      paragraphs: [
        "Through my projects and my studies, I have worked with several languages and development environments. On the web side, I use HTML, CSS, PHP and JavaScript. I have also developed in Java and Python for object-oriented programming, and in C++ for a more procedural approach. Finally, I handle data with SQL, with deeper experience of PostgreSQL.",
        "As for tools, I use the JetBrains IDEs suited to these languages, along with Git and GitHub for version control and collaborative work.",
      ],
    },
    soft: {
      title: "Soft skills",
      paragraphs: [
        "Most of my projects were team efforts, with two to seven people. They taught me to share the work, meet deadlines and document my choices so that others can pick up the code after me.",
        "Several of them required me to step away from the code: gathering a client's requirements, explaining a technical topic to a non-technical audience, or writing an installation guide in English precise enough to be followed step by step.",
      ],
    },
  },

  career: {
    title: "Background",
    description: "My education and the experiences that introduced me to the field.",
    experience: "Experience",
    education: "Education",
  },

  projects: {
    previewTitle: "My projects",
    previewDescription: "These skills come together in the projects I carried out during my studies.",
    seeAll: "See all projects",
    listTitle: "All my projects",
    listDescription: "Every project I carried out during my studies, from the oldest to the most recent.",
    listMetaTitle: "Projects — Damien",
    listMetaDescription:
      "Projects by Damien Aravena Bravo during his computer science degree: web development, Java applications, databases and network services.",
    pageMetaTitle: (page: number) => `Projects, page ${page} — Damien`,
    pageMetaDescription: (page: number) =>
      `Projects by Damien Aravena Bravo during his computer science degree: web development, Java applications, databases and network services (page ${page}).`,
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    discover: "Discover the project",
    neighbors: "Previous and next projects",
    status: {
      termine: "Completed",
      "en-cours": "In progress",
      "a-venir": "Upcoming",
    },
  },

  contact: {
    title: "Contact me",
    description:
      "I am looking for a 10 to 12-week internship, from April 19 to June 25, 2027, extendable until July 9, to complete the second year of my computer science degree. A question, an opportunity? Write to me.",
    email: "Send an email",
    // Le CV n'existe qu'en français : le dire avant le téléchargement.
    cv: "Download my résumé (French)",
    github: "See my GitHub",
  },

  breadcrumb: {
    label: "Breadcrumb",
    home: "Home",
    projects: "Projects",
    page: (page: number) => `Page ${page}`,
  },

  pagination: {
    label: "Pagination",
    previous: "Previous",
    next: "Next",
    previousPage: "Previous page",
    nextPage: "Next page",
    page: (page: number) => `Page ${page}`,
  },

  toc: { title: "On this page" },
  backToTop: "Back to top",
  footer: { rights: "All rights reserved." },
} satisfies Dictionary;

export const ui: Record<Lang, Dictionary> = { fr, en };

/** Les textes d'une langue. */
export function useTranslations(lang: Lang): Dictionary {
  return ui[lang];
}
