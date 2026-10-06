import type { CareerEntry } from "../types";

/**
 * Logos : `icon` pour les marques présentes dans simple-icons, sinon `initials`.
 * Pour un vrai logo (entreprise, université, lycée), déposer le fichier dans
 * `public/logos/` et renseigner `logo: "/logos/mon-fichier.svg"`.
 *
 * Format des périodes, à respecter pour toute nouvelle entrée :
 *
 * - « Mois AAAA » pour une date unique, « Mois AAAA – mois AAAA » pour un
 *   intervalle. Toujours au mois, y compris les diplômes : une précision qui
 *   varie d'une ligne à l'autre se lit comme une négligence.
 * - Tiret demi-cadratin (–, U+2013) entouré d'espaces normales : c'est là que
 *   la ligne doit se couper si elle est trop longue. Jamais de trait d'union.
 * - Espace insécable (U+00A0) entre le mois et l'année, pour qu'un « 2026 » ne
 *   se retrouve jamais seul sur une deuxième ligne. Elle ne se voit pas dans
 *   l'éditeur : copier celle d'une entrée existante.
 * - Capitale au premier mois seulement : il ouvre le libellé. Les suivants
 *   restent en minuscule, comme le veut le français.
 * - L'année n'est répétée que si elle change : « Mai – juin 2026 », mais
 *   « Septembre 2025 – janvier 2026 ».
 *
 * ⚠️ La capitalisation ne se voit pas à l'écran : CareerItem rend les périodes
 * en `uppercase`. Elle n'en compte pas moins — c'est la donnée, et elle
 * redeviendrait visible le jour où ce style changerait.
 */
export const experiences: CareerEntry[] = [
  {
    title: "Stage de développement",
    organization: "Entreprise à définir",
    location: "Grenoble et alentours",
    period: "Avril – juin 2027",
    description:
      "Stage de fin de 2e année de BUT, de 10 à 12 semaines : du 19 avril au 25 juin 2027, prolongeable jusqu'au 9 juillet. Je cherche une entreprise, de préférence en développement web.",
    icon: "calendar",
    upcoming: true,
    project: "stage-2027",
  },
  {
    organization: "Horizon Groupe",
    location: "Villard-Bonnot",
    period: "Juillet 2025 – juin 2026",
    description:
      "Groupe réunissant Microstore, Iso Rhône-Alpes et Chryséis, spécialisé dans le réemploi et l'infogérance de parcs informatiques.",
    initials: "HG",
    roles: [
      {
        title: "Technicien informatique",
        contract: "CDI",
        period: "Mai – juin 2026",
        description:
          "Masterisation et préparation du matériel informatique destiné au client grand compte Saint-Gobain, au sein du pôle technique. Configuration de matériels Lenovo, Microsoft, Honeywell et Cisco.",
      },
      {
        title: "Technicien diagnostic",
        contract: "CDI",
        period: "Janvier – mai 2026",
        description:
          "Audit et qualification du parc informatique destiné au réemploi pour différents clients : Capgemini, Saint-Gobain, Nexity.",
      },
      {
        title: "Technicien réception",
        contract: "CDI",
        period: "Septembre 2025 – janvier 2026",
        description:
          "Gestion du flux entrant de matériel informatique chez Microstore (Green IT) : PC, tablettes, téléphones et accessoires. Suivi des stocks pour l'ensemble des clients.",
      },
      {
        title: "Assistant administratif et technicien réception",
        contract: "CDD",
        period: "Juillet – août 2025",
      },
    ],
  },
  {
    title: "Stage d'observation",
    organization: "Mentor Graphics (Siemens)",
    location: "Meylan",
    period: "Juin 2018",
    description:
      "Découverte des métiers de l'informatique en entreprise : échanges avec les salariés et accompagnement de l'un d'eux sur des tâches simples, sous sa supervision.",
    icon: "simple-icons:siemens",
  },
  {
    title: "Stage d'observation",
    organization:
      "Laboratoire de Linguistique et Didactique des Langues Étrangères et Maternelles (UGA)",
    location: "Grenoble",
    period: "Janvier 2017",
    description:
      "Découverte du fonctionnement d'un laboratoire de recherche, échanges avec les chercheurs et assistance dans leur travail quotidien.",
    initials: "UGA",
  },
];

export const education: CareerEntry[] = [
  {
    title: "BUT Informatique",
    organization: "IUT2 (Université Grenoble Alpes)",
    location: "Grenoble",
    period: "Septembre 2023 – juin 2028",
    description: "Parcours Réalisation d'applications. Année de césure de septembre 2025 à juillet 2026.",
    initials: "IUT2",
  },
  {
    title: "Classe préparatoire TSI",
    organization: "Lycée polyvalent Gaspard Monge",
    location: "Chambéry",
    period: "Septembre 2020 – avril 2023",
    description: "Technologie et sciences industrielles. Première année validée (60 crédits ECTS).",
    initials: "GM",
  },
  {
    title: "Baccalauréat STI2D",
    organization: "Lycée polyvalent Pablo Neruda",
    location: "Saint-Martin-d'Hères",
    period: "Septembre 2018 – juin 2020",
    description: "Spécialité SIN (systèmes d'information et numérique), mention assez bien.",
    initials: "PN",
  },
];

/*
 * Le même parcours en anglais, entrée pour entrée et dans le même ordre : les
 * tests vérifient que les deux versions restent alignées.
 *
 * Mêmes règles de période qu'en français (espace insécable, tiret
 * demi-cadratin entouré d'espaces, année répétée seulement si elle change),
 * mais tous les mois prennent la capitale, comme le veut l'anglais.
 */
export const experiencesEn: CareerEntry[] = [
  {
    title: "Development internship",
    organization: "Company to be confirmed",
    location: "Grenoble area",
    period: "April – June 2027",
    description:
      "End-of-second-year internship of my BUT, 10 to 12 weeks: from April 19 to June 25, 2027, extendable to July 9. I am looking for a company, ideally in web development.",
    icon: "calendar",
    upcoming: true,
    project: "stage-2027",
  },
  {
    organization: "Horizon Groupe",
    location: "Villard-Bonnot",
    period: "July 2025 – June 2026",
    description:
      "Group bringing together Microstore, Iso Rhône-Alpes and Chryséis, specializing in the reuse and managed services of IT equipment fleets.",
    initials: "HG",
    roles: [
      {
        title: "IT technician",
        contract: "Permanent contract",
        period: "May – June 2026",
        description:
          "Imaging and preparation of IT equipment for the key account Saint-Gobain, within the technical department. Configuration of Lenovo, Microsoft, Honeywell and Cisco hardware.",
      },
      {
        title: "Diagnostic technician",
        contract: "Permanent contract",
        period: "January – May 2026",
        description:
          "Audit and grading of IT equipment intended for reuse, for several clients: Capgemini, Saint-Gobain, Nexity.",
      },
      {
        title: "Receiving technician",
        contract: "Permanent contract",
        period: "September 2025 – January 2026",
        description:
          "Management of incoming IT equipment at Microstore (Green IT): PCs, tablets, phones and accessories. Stock tracking for all clients.",
      },
      {
        title: "Administrative assistant and receiving technician",
        contract: "Fixed-term contract",
        period: "July – August 2025",
      },
    ],
  },
  {
    title: "Observation internship",
    organization: "Mentor Graphics (Siemens)",
    location: "Meylan",
    period: "June 2018",
    description:
      "Discovering IT jobs in a company: talks with employees, and shadowing one of them on simple tasks under their supervision.",
    icon: "simple-icons:siemens",
  },
  {
    title: "Observation internship",
    organization:
      "Laboratory of Linguistics and Didactics of Foreign and Native Languages (UGA)",
    location: "Grenoble",
    period: "January 2017",
    description:
      "Discovering how a research laboratory works, talking with researchers and assisting them in their daily work.",
    initials: "UGA",
  },
];

export const educationEn: CareerEntry[] = [
  {
    title: "Bachelor of Technology in Computer Science (BUT)",
    organization: "IUT2 (Université Grenoble Alpes)",
    location: "Grenoble",
    period: "September 2023 – June 2028",
    description: "Application development track. Gap year from September 2025 to July 2026.",
    initials: "IUT2",
  },
  {
    title: "TSI preparatory class",
    organization: "Gaspard Monge High School",
    location: "Chambéry",
    period: "September 2020 – April 2023",
    description: "Technology and industrial sciences. First year completed (60 ECTS credits).",
    initials: "GM",
  },
  {
    title: "STI2D Baccalaureate",
    organization: "Pablo Neruda High School",
    location: "Saint-Martin-d'Hères",
    period: "September 2018 – June 2020",
    description: "Information and digital systems (SIN) specialty, with honors (mention assez bien).",
    initials: "PN",
  },
];
