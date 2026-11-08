import type { AcCode, SaeCode } from "../../src/data/pn";
import type { Cover, ProjectKind } from "../../src/types";
import Content from "./Content.astro";

export interface FixtureProject {
  id: string;
  data: {
    title: string;
    summary: string;
    tags: string[];
    kind: ProjectKind;
    status: "termine" | "en-cours" | "a-venir";
    team?: string;
    year?: number;
    order: number;
    featured: boolean;
    cover?: Cover;
    links: { site?: string; repo?: string };
    demo?: { src: string; caption: string };
    role: string[];
    sae: SaeCode[];
    ac: AcCode[];
    learned: string[];
  };
}

/**
 * Sept projets, comme le dossier réel : assez pour dépasser la page (six) et
 * donc pour que la pagination apparaisse.
 */
export const fixtureProjects: FixtureProject[] = Array.from({ length: 7 }, (_, index) => ({
  id: `projet-${index + 1}`,
  data: {
    title: `Projet ${index + 1}`,
    summary: `Résumé du projet ${index + 1}.`,
    tags: index % 2 === 0 ? ["Java", "SQL"] : ["PHP"],
    // Trois applications web, quatre bases de données : le filtre par type
    // doit compter chacun.
    kind: index % 3 === 0 ? "web-app" : "database",
    status: index === 0 ? "en-cours" : "termine",
    team: index === 0 ? "En binôme" : undefined,
    year: 2026 - index,
    order: index + 1,
    featured: index < 3,
    // Le troisième a ses deux liens, le quatrième son dépôt seul : chaque
    // bouton doit pouvoir manquer sans emporter l'autre.
    links:
      index === 2
        ? { site: "https://exemple.fr/projet-3/", repo: "https://github.com/exemple/projet-3" }
        : index === 3
          ? { repo: "https://github.com/exemple/projet-4" }
          : {},
    // Seul le premier a une démo : les autres ne doivent rien en montrer.
    demo: index === 0 ? { src: "/demos/projet-1/", caption: "But du jeu et commandes." } : undefined,
    // Seul le troisième remplit les rubriques du PPP : les autres prouvent
    // qu'une fiche incomplète n'en montre rien.
    role: index === 2 ? ["Conception de la base", "Tests unitaires"] : [],
    // Ses AC sont dans le désordre, et deux compétences sur deux niveaux : la
    // fiche doit les ranger dans l'ordre du PN.
    sae: index === 2 ? ["2.06"] : [],
    ac: index === 2 ? ["AC26.03", "AC11.01", "AC16.04", "AC21.04"] : [],
    learned: index === 2 ? ["Écrire des tests avant le code"] : [],
  },
}));

/**
 * Les titres du corps factice, tels qu'Astro les renverrait pour ce Markdown.
 * Un `h1` et un `h4` encadrent les niveaux retenus : le sommaire doit les
 * écarter, et seul un jeu qui les contient peut le prouver.
 */
export const fixtureHeadings = [
  { depth: 1, slug: "titre-de-la-fiche", text: "Titre de la fiche" },
  { depth: 2, slug: "contexte", text: "Contexte" },
  { depth: 3, slug: "realisation", text: "Réalisation" },
  { depth: 2, slug: "resultats", text: "Résultats" },
  { depth: 4, slug: "note", text: "Note" },
];

/**
 * Remplaçant d'`astro:content`, module virtuel qui n'existe pas hors d'un rendu
 * Astro complet. `render` renvoie un corps factice : les tests de page portent
 * sur la mise en page, pas sur la compilation du Markdown.
 */
export const contentModule = {
  getCollection: async () => fixtureProjects,
  render: async () => ({ Content, headings: fixtureHeadings }),
};
