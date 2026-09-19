import type { CareerEntry } from "../types";

/**
 * Logos : `icon` pour les marques présentes dans simple-icons, sinon `initials`.
 * Pour un vrai logo (entreprise, université, lycée), déposer le fichier dans
 * `public/logos/` et renseigner `logo: "/logos/mon-fichier.svg"`.
 *
 * Format des périodes, à respecter pour toute nouvelle entrée :
 *
 * - « Mois AAAA » pour une date unique, « Mois AAAA – mois AAAA » pour un
 *   intervalle ; les années scolaires restent en « AAAA – AAAA ».
 * - Tiret demi-cadratin (–, U+2013) entouré d'espaces normales. Jamais de
 *   trait d'union, jamais d'espace insécable.
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
    organization: "Horizon Groupe",
    location: "Villard-Bonnot",
    period: "Juillet 2025 – juin 2026",
    description:
      "Groupe réunissant Microstore, Iso Rhône-Alpes et Chryséis, spécialisé dans le réemploi et l'infogérance de parcs informatiques.",
    initials: "HG",
    roles: [
      {
        title: "Technicien informatique",
        contract: "CDI",
        period: "Mai – juin 2026",
        description:
          "Masterisation et préparation du matériel informatique destiné au client grand compte Saint-Gobain, au sein du pôle technique. Configuration de matériels Lenovo, Microsoft, Honeywell et Cisco.",
      },
      {
        title: "Technicien diagnostic",
        contract: "CDI",
        period: "Janvier – mai 2026",
        description:
          "Audit et qualification du parc informatique destiné au réemploi pour différents clients : Capgemini, Saint-Gobain, Nexity.",
      },
      {
        title: "Technicien réception",
        contract: "CDI",
        period: "Septembre 2025 – janvier 2026",
        description:
          "Gestion du flux entrant de matériel informatique chez Microstore (Green IT) — PC, tablettes, téléphones, accessoires — et suivi des stocks pour l'ensemble des clients.",
      },
      {
        title: "Assistant administratif — Technicien réception",
        contract: "CDD",
        period: "Juillet – août 2025",
      },
    ],
  },
  {
    title: "Stage d'observation",
    organization: "Mentor Graphics (Siemens)",
    location: "Meylan",
    period: "Juin 2018",
    description:
      "Découverte des métiers de l'informatique en entreprise : échanges avec les salariés et accompagnement de l'un d'eux sur des tâches simples, sous sa supervision.",
    icon: "simple-icons:siemens",
  },
  {
    title: "Stage d'observation",
    organization:
      "Laboratoire de Linguistique et Didactique des Langues Étrangères et Maternelles — UGA",
    location: "Grenoble",
    period: "Janvier 2017",
    description:
      "Découverte du fonctionnement d'un laboratoire de recherche, échanges avec les chercheurs et assistance dans leur travail quotidien.",
    initials: "UGA",
  },
];

export const education: CareerEntry[] = [
  {
    title: "BUT Informatique",
    organization: "IUT2 — Université Grenoble Alpes",
    location: "Grenoble",
    period: "Septembre 2023 – juin 2028",
    description: "Année de césure de septembre 2025 à juillet 2026.",
    initials: "IUT2",
  },
  {
    title: "Certification PIX",
    organization: "Compétences numériques",
    period: "Avril 2022",
    icon: "simple-icons:pix",
  },
  {
    title: "Classe préparatoire TSI",
    organization: "Lycée polyvalent Gaspard Monge",
    location: "Chambéry",
    period: "2020 – 2023",
    description: "Technologie et sciences industrielles.",
    initials: "GM",
  },
  {
    title: "Baccalauréat STI2D",
    organization: "Lycée polyvalent Pablo Neruda",
    location: "Saint-Martin-d'Hères",
    period: "2018 – 2020",
    description: "Mention bien.",
    initials: "PN",
  },
];
