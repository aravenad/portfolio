import Content from "./Content.astro";

export interface FixtureProject {
  id: string;
  data: {
    title: string;
    summary: string;
    tags: string[];
    status: "termine" | "en-cours" | "a-venir";
    team?: string;
    year?: number;
    order: number;
    featured: boolean;
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
    status: index === 0 ? "en-cours" : "termine",
    team: index === 0 ? "En binôme" : undefined,
    year: 2026 - index,
    order: index + 1,
    featured: index < 3,
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
