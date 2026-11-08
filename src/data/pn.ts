import type { Lang } from "../lib/i18n";
import { withFrenchSpacing } from "../lib/typography";
import type { Competence } from "../types";

/**
 * Le référentiel du BUT Informatique, parcours A « Réalisation d'applications :
 * conception, développement, validation », tel que le fixe le Programme
 * National de 2022 (annexe 15 du BO spécial n° 4 du 26 mai 2022).
 *
 * Les intitulés français sont recopiés du PN, mot pour mot : une fiche qui cite
 * un apprentissage critique doit dire exactement ce que le jury lira. Le PN
 * n'existe pas en anglais : les intitulés anglais sont notre traduction.
 */

/**
 * Les apprentissages critiques (AC) du parcours A, dans l'ordre du PN. Le code
 * dit où ranger chacun : `AC23.01` est le premier AC du niveau **2** de la
 * compétence **3** (Administrer), dans l'ordre de `COMPETENCES`.
 */
export const AC_CODES = [
  "AC11.01", "AC11.02", "AC11.03", "AC11.04",
  "AC12.01", "AC12.02", "AC12.03",
  "AC13.01", "AC13.02", "AC13.03", "AC13.04",
  "AC14.01", "AC14.02", "AC14.03",
  "AC15.01", "AC15.02", "AC15.03",
  "AC16.01", "AC16.02", "AC16.03", "AC16.04",
  "AC21.01", "AC21.02", "AC21.03", "AC21.04",
  "AC22.01", "AC22.02", "AC22.03", "AC22.04",
  "AC23.01", "AC23.02", "AC23.03",
  "AC24.01", "AC24.02", "AC24.03", "AC24.04",
  "AC25.01", "AC25.02", "AC25.03", "AC25.04",
  "AC26.01", "AC26.02", "AC26.03", "AC26.04",
  "AC31.01", "AC31.02", "AC31.03",
  "AC32.01", "AC32.02", "AC32.03",
  "AC36.01", "AC36.02", "AC36.03", "AC36.04",
] as const;

export type AcCode = (typeof AC_CODES)[number];

/**
 * Les SAÉ du parcours A et ses deux stages, dans l'ordre du PN. En BUT 1, le
 * dernier chiffre est celui de la compétence visée (1.04 : Gérer).
 */
export const SAE_CODES = [
  "1.01", "1.02", "1.03", "1.04", "1.05", "1.06",
  "2.01", "2.02", "2.03", "2.04", "2.05", "2.06",
  "3.Real.01",
  "4.Real.01", "STAGE",
  "5.Real.01",
  "6.Real.01", "STAGE.Real",
] as const;

export type SaeCode = (typeof SAE_CODES)[number];

interface PnLabels {
  /** « Niveau 2 », devant l'intitulé du niveau. */
  level: (level: number) => string;
  /** Intitulé de chaque niveau, du premier au dernier atteint dans le parcours. */
  levels: Record<Competence, readonly string[]>;
  ac: Record<AcCode, string>;
  /** « SAÉ 1.04 · Création d'une base de données », ou le stage seul. */
  sae: (code: SaeCode) => string;
}

const saeFr: Record<SaeCode, string> = {
  "1.01": "Implémentation d'un besoin client",
  "1.02": "Comparaison d'approches algorithmiques",
  "1.03": "Installation d'un poste pour le développement",
  "1.04": "Création d'une base de données",
  "1.05": "Recueil de besoins",
  "1.06": "Découverte de l'environnement économique et écologique",
  "2.01": "Développement d'une application",
  "2.02": "Exploration algorithmique d'un problème",
  "2.03": "Installation de services réseau",
  "2.04": "Exploitation d'une base de données",
  "2.05": "Gestion d'un projet",
  "2.06": "Organisation d'un travail d'équipe",
  "3.Real.01": "Développement d'une application",
  "4.Real.01": "Développement d'une application complexe",
  STAGE: "Stage du semestre 4",
  "5.Real.01": "Développement avancé",
  "6.Real.01": "Évolution d'une application existante",
  "STAGE.Real": "Stage du semestre 6",
};

const saeEn: Record<SaeCode, string> = {
  "1.01": "Implementing a client need",
  "1.02": "Comparing algorithmic approaches",
  "1.03": "Setting up a development workstation",
  "1.04": "Creating a database",
  "1.05": "Gathering requirements",
  "1.06": "Discovering the economic and ecological environment",
  "2.01": "Developing an application",
  "2.02": "Algorithmic exploration of a problem",
  "2.03": "Installing network services",
  "2.04": "Working with a database",
  "2.05": "Managing a project",
  "2.06": "Organising team work",
  "3.Real.01": "Developing an application",
  "4.Real.01": "Developing a complex application",
  STAGE: "Semester 4 internship",
  "5.Real.01": "Advanced development",
  "6.Real.01": "Evolving an existing application",
  "STAGE.Real": "Semester 6 internship",
};

/** Le stage n'a pas d'autre code que « STAGE » : son intitulé suffit. */
const saeLabel = (titles: Record<SaeCode, string>) => (code: SaeCode) =>
  code.startsWith("STAGE") ? titles[code] : `SAÉ ${code} · ${titles[code]}`;

const fr: PnLabels = {
  level: (level) => `Niveau ${level}`,
  levels: {
    realiser: [
      "Développer des applications informatiques simples",
      "Partir des exigences et aller jusqu'à une application complète",
      "Adapter des applications sur un ensemble de supports (embarqué, web, mobile, IoT…)",
    ],
    optimiser: [
      "Appréhender et construire des algorithmes",
      "Sélectionner les algorithmes adéquats pour répondre à un problème donné",
      "Analyser et optimiser des applications",
    ],
    administrer: [
      "Installer et configurer un poste de travail",
      "Déployer des services dans une architecture réseau",
    ],
    gerer: [
      "Concevoir et mettre en place une base de données à partir d'un cahier des charges client",
      "Optimiser une base de données, interagir avec une application et mettre en œuvre la sécurité",
    ],
    conduire: [
      "Identifier les besoins métiers des clients et des utilisateurs",
      "Appliquer une démarche de suivi de projet en fonction des besoins métiers des clients et des utilisateurs",
    ],
    collaborer: [
      "Identifier ses aptitudes pour travailler dans une équipe",
      "Situer son rôle et ses missions au sein d'une équipe informatique",
      "Manager une équipe informatique",
    ],
  },
  ac: {
    "AC11.01": "Implémenter des conceptions simples",
    "AC11.02": "Élaborer des conceptions simples",
    "AC11.03": "Faire des essais et évaluer leurs résultats en regard des spécifications",
    "AC11.04": "Développer des interfaces utilisateurs",
    "AC12.01":
      "Analyser un problème avec méthode (découpage en éléments algorithmiques simples, structure de données…)",
    "AC12.02": "Comparer des algorithmes pour des problèmes classiques (tris simples, recherche…)",
    "AC12.03": "Formaliser et mettre en œuvre des outils mathématiques pour l'informatique",
    "AC13.01": "Identifier les différents composants (matériels et logiciels) d'un système numérique",
    "AC13.02": "Utiliser les fonctionnalités de base d'un système multitâches / multiutilisateurs",
    "AC13.03": "Installer et configurer un système d'exploitation et des outils de développement",
    "AC13.04": "Configurer un poste de travail dans un réseau d'entreprise",
    "AC14.01":
      "Mettre à jour et interroger une base de données relationnelle (en requêtes directes ou à travers une application)",
    "AC14.02": "Visualiser des données",
    "AC14.03": "Concevoir une base de données relationnelle à partir d'un cahier des charges",
    "AC15.01": "Appréhender les besoins du client et de l'utilisateur",
    "AC15.02": "Mettre en place les outils de gestion de projet",
    "AC15.03": "Identifier les acteurs et les différentes phases d'un cycle de développement",
    "AC16.01": "Appréhender l'écosystème numérique",
    "AC16.02": "Découvrir les aptitudes requises selon les différents secteurs informatiques",
    "AC16.03":
      "Identifier les statuts, les fonctions et les rôles de chaque membre d'une équipe pluridisciplinaire",
    "AC16.04": "Acquérir les compétences interpersonnelles pour travailler en équipe",
    "AC21.01":
      "Élaborer et implémenter les spécifications fonctionnelles et non fonctionnelles à partir des exigences",
    "AC21.02": "Appliquer des principes d'accessibilité et d'ergonomie",
    "AC21.03": "Adopter de bonnes pratiques de conception et de programmation",
    "AC21.04": "Vérifier et valider la qualité de l'application par les tests",
    "AC22.01": "Choisir des structures de données complexes adaptées au problème",
    "AC22.02":
      "Utiliser des techniques algorithmiques adaptées pour des problèmes complexes (par ex. recherche opérationnelle, méthodes arborescentes, optimisation globale, intelligence artificielle…)",
    "AC22.03": "Comprendre les enjeux et moyens de sécurisation des données et du code",
    "AC22.04": "Évaluer l'impact environnemental et sociétal des solutions proposées",
    "AC23.01": "Concevoir et développer des applications communicantes",
    "AC23.02": "Utiliser des serveurs et des services réseaux virtualisés",
    "AC23.03": "Sécuriser les services et données d'un système",
    "AC24.01": "Optimiser les modèles de données de l'entreprise",
    "AC24.02": "Assurer la sécurité des données (intégrité et confidentialité)",
    "AC24.03": "Organiser la restitution de données à travers la programmation et la visualisation",
    "AC24.04": "Manipuler des données hétérogènes",
    "AC25.01":
      "Identifier les processus présents dans une organisation en vue d'améliorer les systèmes d'information",
    "AC25.02": "Formaliser les besoins du client et de l'utilisateur",
    "AC25.03": "Identifier les critères de faisabilité d'un projet informatique",
    "AC25.04": "Définir et mettre en œuvre une démarche de suivi de projet",
    "AC26.01":
      "Comprendre la diversité, la structure et la dimension de l'informatique dans une organisation (ESN, DSI…)",
    "AC26.02": "Appliquer une démarche pour intégrer une équipe informatique au sein d'une organisation",
    "AC26.03": "Mobiliser les compétences interpersonnelles pour travailler dans une équipe informatique",
    "AC26.04": "Rendre compte de son activité professionnelle",
    "AC31.01": "Choisir et implémenter les architectures adaptées",
    "AC31.02": "Faire évoluer une application existante",
    "AC31.03": "Intégrer des solutions dans un environnement de production",
    "AC32.01":
      "Anticiper les résultats de diverses métriques (temps d'exécution, occupation mémoire, montée en charge…)",
    "AC32.02": "Profiler, analyser et justifier le comportement d'un code existant",
    "AC32.03":
      "Choisir et utiliser des bibliothèques et méthodes dédiées au domaine d'application (imagerie, immersion, intelligence artificielle, jeux vidéos, parallélisme, calcul formel…)",
    "AC36.01": "Organiser et partager une veille technologique et informationnelle",
    "AC36.02": "Identifier les enjeux de l'économie de l'innovation numérique",
    "AC36.03": "Guider la conduite du changement informatique au sein d'une organisation",
    "AC36.04": "Accompagner le management de projet informatique",
  },
  sae: saeLabel(saeFr),
};

const en: PnLabels = {
  level: (level) => `Level ${level}`,
  levels: {
    realiser: [
      "Develop simple software applications",
      "Go from requirements to a complete application",
      "Adapt applications to a range of platforms (embedded, web, mobile, IoT…)",
    ],
    optimiser: [
      "Understand and build algorithms",
      "Select the right algorithms for a given problem",
      "Analyse and optimise applications",
    ],
    administrer: [
      "Install and configure a workstation",
      "Deploy services in a network architecture",
    ],
    gerer: [
      "Design and set up a database from a client's specification",
      "Optimise a database, connect it to an application and secure it",
    ],
    conduire: [
      "Identify the business needs of clients and users",
      "Apply a project monitoring approach based on the business needs of clients and users",
    ],
    collaborer: [
      "Identify one's own aptitudes for working in a team",
      "Understand one's role and duties within an IT team",
      "Manage an IT team",
    ],
  },
  ac: {
    "AC11.01": "Implement simple designs",
    "AC11.02": "Produce simple designs",
    "AC11.03": "Run tests and assess their results against the specification",
    "AC11.04": "Develop user interfaces",
    "AC12.01":
      "Analyse a problem methodically (breaking it down into simple algorithmic steps, data structures…)",
    "AC12.02": "Compare algorithms for classic problems (simple sorts, search…)",
    "AC12.03": "Formalise and apply mathematical tools for computing",
    "AC13.01": "Identify the components (hardware and software) of a digital system",
    "AC13.02": "Use the basic features of a multitasking, multi-user system",
    "AC13.03": "Install and configure an operating system and development tools",
    "AC13.04": "Configure a workstation on a corporate network",
    "AC14.01": "Update and query a relational database (directly or through an application)",
    "AC14.02": "Visualise data",
    "AC14.03": "Design a relational database from a specification",
    "AC15.01": "Understand the needs of the client and the user",
    "AC15.02": "Set up project management tools",
    "AC15.03": "Identify the stakeholders and phases of a development cycle",
    "AC16.01": "Understand the digital ecosystem",
    "AC16.02": "Discover the aptitudes required in different IT sectors",
    "AC16.03": "Identify the status, function and role of each member of a multidisciplinary team",
    "AC16.04": "Acquire the interpersonal skills to work in a team",
    "AC21.01": "Write and implement functional and non-functional specifications from requirements",
    "AC21.02": "Apply accessibility and usability principles",
    "AC21.03": "Adopt good design and programming practices",
    "AC21.04": "Check and validate the quality of the application with tests",
    "AC22.01": "Choose complex data structures suited to the problem",
    "AC22.02":
      "Use algorithmic techniques suited to complex problems (e.g. operations research, tree search methods, global optimisation, artificial intelligence…)",
    "AC22.03": "Understand the stakes and means of securing data and code",
    "AC22.04": "Assess the environmental and social impact of the proposed solutions",
    "AC23.01": "Design and develop networked applications",
    "AC23.02": "Use virtualised servers and network services",
    "AC23.03": "Secure the services and data of a system",
    "AC24.01": "Optimise the organisation's data models",
    "AC24.02": "Ensure data security (integrity and confidentiality)",
    "AC24.03": "Present data through programming and visualisation",
    "AC24.04": "Handle heterogeneous data",
    "AC25.01": "Identify the processes in an organisation in order to improve its information systems",
    "AC25.02": "Formalise the needs of the client and the user",
    "AC25.03": "Identify the feasibility criteria of an IT project",
    "AC25.04": "Define and apply a project monitoring approach",
    "AC26.01":
      "Understand the diversity, structure and scale of IT within an organisation (IT services company, IT department…)",
    "AC26.02": "Apply an approach to join an IT team within an organisation",
    "AC26.03": "Use interpersonal skills to work in an IT team",
    "AC26.04": "Report on one's professional activity",
    "AC31.01": "Choose and implement suitable architectures",
    "AC31.02": "Evolve an existing application",
    "AC31.03": "Integrate solutions into a production environment",
    "AC32.01": "Anticipate the results of various metrics (execution time, memory use, scalability…)",
    "AC32.02": "Profile, analyse and explain the behaviour of existing code",
    "AC32.03":
      "Choose and use libraries and methods specific to the application domain (imaging, immersion, artificial intelligence, video games, parallelism, computer algebra…)",
    "AC36.01": "Organise and share technology and information watch",
    "AC36.02": "Identify the stakes of the digital innovation economy",
    "AC36.03": "Guide IT change management within an organisation",
    "AC36.04": "Support IT project management",
  },
  sae: saeLabel(saeEn),
};

const pn: Record<Lang, PnLabels> = { fr: withFrenchSpacing(fr), en };

/** Les intitulés du référentiel dans la langue demandée. */
export function usePn(lang: Lang): PnLabels {
  return pn[lang];
}
