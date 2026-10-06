import type { Lang } from "../lib/i18n";
import type { Competence, ProjectStatus } from "../types";
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
    /** Intitulé des données structurées `Person` (lib/structured-data.ts). */
    jobTitle: "Étudiant en BUT Informatique",
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

  about: {
    title: "À propos",
    paragraphs: [
      "Après un bac STI2D, j'ai passé trois ans en classe préparatoire TSI à Chambéry. J'y ai appris à tenir une forte charge de travail dans la durée, la rigueur, et ce que l'entraide entre camarades change au travail d'équipe. En rejoignant le BUT Informatique, je suis passé d'un enseignement très théorique à une formation par la pratique : une adaptation exigeante, que j'ai appréciée dès la première année.",
      "En 2025-2026, j'ai pris une année de césure pour découvrir le monde du travail. Chez Microstore (Horizon Groupe), une entreprise du Green IT qui gère et reconditionne les parcs informatiques de grands comptes, j'ai occupé trois postes au pôle technique, de la réception du matériel à la préparation logicielle d'environ 800 machines par mois. En parallèle, j'ai continué à développer des projets personnels.",
      "Ce que je préfère, c'est mener un projet de A à Z, du besoin jusqu'à une application qui fonctionne. Le développement web reste mon terrain favori, mais je suis ouvert à tous les types de développement d'applications.",
      "En dehors de l'informatique, j'aime la musique, les jeux vidéo et les documentaires, surtout ceux d'investigation. Curieux de nature, j'aime apprendre un peu sur tout, et je suis de près l'actualité des nouvelles technologies.",
    ],
    facts: [
      {
        label: "Formation",
        value: "BUT Informatique, 2e année · IUT2 Grenoble",
      },
      { label: "Métier visé", value: "Développeur web, et plus largement développeur d'applications" },
      { label: "Diplôme", value: "Baccalauréat STI2D, spécialité SIN, mention assez bien (2020)" },
      {
        label: "Recherche",
        value:
          "Stage du 19 avril au 25 juin 2027 (jusqu'au 9 juillet possible), puis alternance en 3e année",
      },
      { label: "Secteur", value: "Grenoble et alentours, en transports en commun" },
    ],
    cta: "Un stage ou une alternance à me proposer ?",
  },

  skills: {
    technical: {
      title: "Compétences techniques",
      paragraphs: [
        "Au fil de mes projets et de ma formation, j'ai pratiqué plusieurs langages et environnements de développement. Côté web, je travaille avec HTML, CSS, JavaScript et TypeScript, ainsi qu'avec PHP et le framework Symfony. Ce portfolio est lui-même construit avec Astro et Tailwind CSS. J'ai également développé en Java et en Python pour la programmation orientée objet, et en C++ pour une approche plus procédurale. Je manipule enfin les données en SQL, avec une pratique plus poussée de PostgreSQL.",
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
    upcoming: "À venir",
    seeProject: "Voir la fiche",
  },

  projects: {
    previewTitle: "Mes projets",
    previewDescription: "Ces compétences se retrouvent dans les projets menés durant ma formation.",
    seeAll: "Voir tous les projets",
    listTitle: "Tous mes projets",
    listDescription:
      "L'ensemble des projets réalisés durant ma formation, en commençant par ceux de mon parcours : la conception et le développement d'applications.",
    listMetaTitle: `Projets | ${site.author}`,
    listMetaDescription:
      "Les projets réalisés par Damien Aravena Bravo en BUT Informatique : développement web, applications Java, bases de données et services réseau.",
    pageMetaTitle: (page: number) => `Projets, page ${page} | ${site.author}`,
    pageMetaDescription: (page: number) =>
      `Les projets réalisés par Damien Aravena Bravo en BUT Informatique : développement web, applications Java, bases de données et services réseau (page ${page}).`,
    pageOf: (page: number, total: number) => `Page ${page} sur ${total}`,
    discover: "Découvrir le projet",
    neighbors: "Projets précédent et suivant",
    sections: {
      role: { slug: "mon-role", title: "Mon rôle" },
      competences: { slug: "competences-mobilisees", title: "Compétences mobilisées" },
      learned: { slug: "ce-que-j-ai-appris", title: "Ce que j'ai appris" },
    },
    competences: {
      realiser: "Réaliser un développement d'application",
      optimiser: "Optimiser des applications informatiques",
      administrer: "Administrer des systèmes informatiques communicants complexes",
      gerer: "Gérer des données de l'information",
      conduire: "Conduire un projet",
      collaborer: "Travailler dans une équipe informatique",
    } satisfies Record<Competence, string>,
    status: {
      termine: "Terminé",
      "en-cours": "En cours",
      "a-venir": "À venir",
    } satisfies Record<ProjectStatus, string>,
  },

  contact: {
    title: "Me contacter",
    description:
      "Je recherche un stage de 10 à 12 semaines, du 19 avril au 25 juin 2027, prolongeable jusqu'au 9 juillet, pour valider ma deuxième année de BUT Informatique. Idéalement à Grenoble, mais je peux aussi me déplacer dans les environs. Une question, une opportunité ? Écris-moi.",
    email: "Envoyer un e-mail",
    cv: "Télécharger mon CV",
    github: "Voir mon GitHub",
    linkedin: "Voir mon LinkedIn",
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

  readMore: { more: "Lire la suite", less: "Réduire" },

  legal: {
    title: "Mentions légales",
    metaTitle: `Mentions légales | ${site.author}`,
    metaDescription:
      "Mentions légales du portfolio de Damien Aravena Bravo : éditeur, contact, hébergeur et données personnelles.",
    publisher: {
      title: "Éditeur",
      text: "Ce site est édité à titre personnel et non professionnel par Damien Aravena Bravo, étudiant en BUT Informatique, qui en est aussi le directeur de la publication.",
      anonymity:
        "Éditeur non professionnel, il ne publie pas son adresse postale, comme le permet l'article 1-1 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique : ses éléments d'identification sont connus de l'hébergeur.",
    },
    contact: {
      title: "Contact",
      text: "Pour toute question sur le site ou son contenu, écrivez à :",
    },
    host: {
      title: "Hébergeur",
      country: "États-Unis",
    },
    domain: {
      title: "Nom de domaine",
      text: (domain: string) =>
        `Le nom de domaine ${domain} est enregistré auprès d'Infomaniak, qui en gère les DNS mais n'héberge pas le site :`,
      country: "Suisse",
    },
    privacy: {
      title: "Données personnelles",
      paragraphs: [
        "Ce site ne dépose aucun cookie, n'utilise aucun outil de mesure d'audience et ne charge aucun service tiers : polices et images sont servies par le site lui-même.",
        "Votre navigateur garde deux réglages, qui n'en sortent jamais : votre choix du thème clair (stockage local), pour le retrouver à la visite suivante, et, le temps de la visite, la dernière page consultée de la liste des projets (stockage de session), pour animer la pagination.",
        "Les e-mails envoyés à l'éditeur ne servent qu'à vous répondre. Vous pouvez demander à tout moment leur suppression, à la même adresse, et adresser une réclamation à la CNIL.",
      ],
      hostLogs: "Comme tout hébergeur, GitHub enregistre l'adresse IP des visiteurs à des fins de sécurité. Voir sa",
      hostPolicy: "déclaration de confidentialité",
    },
    credits: {
      title: "Propriété intellectuelle",
      text: "Les textes et les illustrations du site sont la propriété de Damien Aravena Bravo. Les logos des technologies sont des marques de leurs propriétaires respectifs ; ils proviennent de Simple Icons (licence CC0) et, pour Java, de devicon (licence MIT).",
    },
  },
  backToTop: "Revenir en haut de la page",
  footer: {
    rights: "Tous droits réservés.",
    /** Le plan du site : un lien du pied de page, ouvert par-dessus la page. */
    sitemapLabel: "Plan du site",
    close: "Fermer le plan du site",
    home: "Accueil",
    projects: "Projets",
    contact: "Contact",
    cv: "CV (PDF)",
    legal: "Mentions légales",
  },
};

export type Dictionary = typeof fr;

const en = {
  htmlLang: "en",
  ogLocale: "en_US",

  meta: {
    title: site.title,
    description:
      "Portfolio of Damien Aravena Bravo, computer science student (BUT Informatique) in Grenoble: web development, Java applications and database projects.",
    ogImageAlt: "Damien Aravena Bravo, computer science student in Grenoble",
    jobTitle: "Computer science student (BUT Informatique)",
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

  about: {
    title: "About",
    paragraphs: [
      "After a technology baccalaureate (STI2D), I spent three years in a TSI preparatory class in Chambéry. It taught me to sustain a heavy workload over time, to be rigorous, and how much helping one another changes teamwork. Moving on to the BUT in computer science took me from very theoretical teaching to learning by doing: a demanding shift, and one I enjoyed from the first year.",
      "In 2025-2026, I took a gap year to discover the working world. At Microstore (Horizon Groupe), a Green IT company that manages and refurbishes the IT fleets of large corporate clients, I held three positions in the technical department, from receiving hardware to preparing the software of about 800 machines a month. Alongside, I kept building personal projects.",
      "What I enjoy most is carrying a project from start to finish, from the need to an application that works. Web development remains my favourite field, but I am open to every kind of application development.",
      "Outside computing, I enjoy music, video games and documentaries, especially investigative ones. Curious by nature, I like learning a little about everything, and I closely follow news about new technologies.",
    ],
    facts: [
      {
        label: "Studies",
        value: "BUT in computer science, 2nd year · IUT2 Grenoble",
      },
      { label: "Target role", value: "Web developer, and more broadly application developer" },
      { label: "Diploma", value: "STI2D baccalaureate, SIN specialty, with honors (2020)" },
      {
        label: "Looking for",
        value:
          "Internship from April 19 to June 25, 2027 (extendable to July 9), then work-study in my 3rd year",
      },
      { label: "Area", value: "Grenoble and surroundings, by public transport" },
    ],
    cta: "An internship or a work-study position to offer?",
  },

  skills: {
    technical: {
      title: "Technical skills",
      paragraphs: [
        "Through my projects and my studies, I have worked with several languages and development environments. On the web side, I use HTML, CSS, JavaScript and TypeScript, as well as PHP with the Symfony framework. This portfolio itself is built with Astro and Tailwind CSS. I have also developed in Java and Python for object-oriented programming, and in C++ for a more procedural approach. Finally, I handle data with SQL, with deeper experience of PostgreSQL.",
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
    upcoming: "Upcoming",
    seeProject: "See the project page",
  },

  projects: {
    previewTitle: "My projects",
    previewDescription: "These skills come together in the projects I carried out during my studies.",
    seeAll: "See all projects",
    listTitle: "All my projects",
    listDescription:
      "Every project I carried out during my studies, starting with those of my track: designing and developing applications.",
    listMetaTitle: `Projects | ${site.author}`,
    listMetaDescription:
      "Projects by Damien Aravena Bravo during his computer science degree: web development, Java applications, databases and network services.",
    pageMetaTitle: (page: number) => `Projects, page ${page} | ${site.author}`,
    pageMetaDescription: (page: number) =>
      `Projects by Damien Aravena Bravo during his computer science degree: web development, Java applications, databases and network services (page ${page}).`,
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    discover: "Discover the project",
    neighbors: "Previous and next projects",
    sections: {
      role: { slug: "my-role", title: "My role" },
      competences: { slug: "skills-used", title: "Skills used" },
      learned: { slug: "what-i-learned", title: "What I learned" },
    },
    competences: {
      realiser: "Develop applications",
      optimiser: "Optimise applications",
      administrer: "Administer complex networked computer systems",
      gerer: "Manage information data",
      conduire: "Lead a project",
      collaborer: "Work in an IT team",
    } satisfies Record<Competence, string>,
    status: {
      termine: "Completed",
      "en-cours": "In progress",
      "a-venir": "Upcoming",
    },
  },

  contact: {
    title: "Contact me",
    description:
      "I am looking for a 10 to 12-week internship, from April 19 to June 25, 2027, extendable until July 9, to complete the second year of my computer science degree. Ideally in Grenoble, but I can also travel to the surrounding area. A question, an opportunity? Write to me.",
    email: "Send an email",
    // Le CV n'existe qu'en français : le dire avant le téléchargement.
    cv: "Download my résumé (French)",
    github: "See my GitHub",
    linkedin: "See my LinkedIn",
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

  readMore: { more: "Read more", less: "Show less" },

  legal: {
    title: "Legal notice",
    metaTitle: `Legal notice | ${site.author}`,
    metaDescription:
      "Legal notice for Damien Aravena Bravo's portfolio: publisher, contact, host and personal data.",
    publisher: {
      title: "Publisher",
      text: "This site is published in a personal, non-professional capacity by Damien Aravena Bravo, a computer science student (BUT), who is also its director of publication.",
      anonymity:
        "As a non-professional publisher, he does not publish his postal address, as allowed by article 1-1 of French law no. 2004-575 of 21 June 2004 on confidence in the digital economy: his identification details are known to the host.",
    },
    contact: {
      title: "Contact",
      text: "For any question about the site or its content, write to:",
    },
    host: {
      title: "Host",
      country: "United States",
    },
    domain: {
      title: "Domain name",
      text: (domain: string) =>
        `The domain name ${domain} is registered with Infomaniak, which manages its DNS but does not host the site:`,
      country: "Switzerland",
    },
    privacy: {
      title: "Personal data",
      paragraphs: [
        "This site sets no cookies, uses no analytics and loads no third-party service: fonts and images are served by the site itself.",
        "Your browser keeps two settings, which never leave it: your choice of the light theme (local storage), so it is there on your next visit, and, for the length of the visit, the last page of the project list you viewed (session storage), to animate the pagination.",
        "Emails sent to the publisher are only used to reply to you. You can ask for their deletion at any time, at the same address, and lodge a complaint with the CNIL, the French data protection authority.",
      ],
      hostLogs: "Like any host, GitHub logs visitors' IP addresses for security purposes. See its",
      hostPolicy: "privacy statement",
    },
    credits: {
      title: "Intellectual property",
      text: "The texts and illustrations of this site belong to Damien Aravena Bravo. Technology logos are trademarks of their respective owners; they come from Simple Icons (CC0 license) and, for Java, from devicon (MIT license).",
    },
  },
  backToTop: "Back to top",
  footer: {
    rights: "All rights reserved.",
    sitemapLabel: "Site map",
    close: "Close the site map",
    home: "Home",
    projects: "Projects",
    contact: "Contact",
    cv: "Résumé (PDF, French)",
    legal: "Legal notice",
  },
} satisfies Dictionary;

export const ui: Record<Lang, Dictionary> = { fr, en };

/** Les textes d'une langue. */
export function useTranslations(lang: Lang): Dictionary {
  return ui[lang];
}
