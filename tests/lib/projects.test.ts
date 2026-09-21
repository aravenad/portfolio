import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `astro:content` est un module virtuel construit au build : hors d'un rendu
 * Astro, il n'a pas de collection à lire. On le remplace par un jeu de projets
 * maîtrisé — ce qui est de toute façon préférable, puisque les tests portent ici
 * sur le tri et le découpage, pas sur le contenu réel du dossier.
 */
const entries = vi.hoisted(() => ({ value: [] as unknown[] }));

vi.mock("astro:content", () => ({
  getCollection: async () => entries.value,
}));

const {
  PROJECTS_PER_PAGE,
  getFeaturedProjects,
  getProjects,
  getProjectsPage,
  getProjectsPageHref,
  statusLabels,
} = await import("../../src/lib/projects");

/** Projet minimal : seuls `order` et `featured` comptent pour ces fonctions. */
function project(id: string, order: number, featured = false) {
  return { id, data: { title: id, summary: "", tags: [], status: "termine", order, featured } };
}

/** `n` projets d'ordre croissant, nommés p1, p2… */
function projects(n: number, featured: number[] = []) {
  return Array.from({ length: n }, (_, i) =>
    project(`p${i + 1}`, i + 1, featured.includes(i + 1)),
  );
}

beforeEach(() => {
  entries.value = [];
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("getProjects", () => {
  it("trie par ordre croissant, quel que soit l'ordre du dossier", async () => {
    entries.value = [project("c", 3), project("a", 1), project("b", 2)];
    expect((await getProjects()).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("renvoie une liste vide sans projet", async () => {
    expect(await getProjects()).toEqual([]);
  });
});

describe("getProjectsPage", () => {
  it("remplit la première page et garde le reste pour la suivante", async () => {
    entries.value = projects(PROJECTS_PER_PAGE + 2);

    const first = await getProjectsPage(1);
    expect(first.projects).toHaveLength(PROJECTS_PER_PAGE);
    expect(first.totalPages).toBe(2);
    expect(first.currentPage).toBe(1);

    const second = await getProjectsPage(2);
    expect(second.projects.map((p) => p.id)).toEqual([
      `p${PROJECTS_PER_PAGE + 1}`,
      `p${PROJECTS_PER_PAGE + 2}`,
    ]);
  });

  it("ne compte qu'une page quand tout tient dessus", async () => {
    entries.value = projects(PROJECTS_PER_PAGE);
    expect((await getProjectsPage(1)).totalPages).toBe(1);
  });

  it("annonce une page même sans aucun projet", async () => {
    // Zéro page ferait échouer `getStaticPaths` et laisserait /projects en 404.
    const page = await getProjectsPage(1);
    expect(page.totalPages).toBe(1);
    expect(page.projects).toEqual([]);
  });

  it("renvoie une tranche vide au-delà de la dernière page", async () => {
    entries.value = projects(3);
    expect((await getProjectsPage(9)).projects).toEqual([]);
  });
});

describe("getProjectsPageHref", () => {
  it("garde la première page sur /projects", () => {
    expect(getProjectsPageHref(1)).toBe("/portfolio/projects");
  });

  it("numérote les suivantes", () => {
    expect(getProjectsPageHref(2)).toBe("/portfolio/projects/page/2");
  });

  it("traite 0 et les négatifs comme la première page", () => {
    // Pagination passe `currentPage - 1` sans le borner.
    expect(getProjectsPageHref(0)).toBe("/portfolio/projects");
    expect(getProjectsPageHref(-1)).toBe("/portfolio/projects");
  });
});

describe("getFeaturedProjects", () => {
  it("ne retient que les projets mis en avant", async () => {
    entries.value = projects(6, [2, 4]);
    expect((await getFeaturedProjects()).map((p) => p.id)).toEqual(["p2", "p4"]);
  });

  it("se rabat sur les premiers projets quand aucun n'est mis en avant", async () => {
    // L'accueil ne doit jamais afficher une section « Projets » vide.
    entries.value = projects(6);
    expect((await getFeaturedProjects()).map((p) => p.id)).toEqual(["p1", "p2", "p3", "p4"]);
  });

  it("respecte la limite demandée", async () => {
    entries.value = projects(6, [1, 2, 3, 4, 5]);
    expect(await getFeaturedProjects(2)).toHaveLength(2);
  });
});

describe("statusLabels", () => {
  it("couvre les trois statuts du schéma, sans clé morte", () => {
    expect(Object.keys(statusLabels).sort()).toEqual(["a-venir", "en-cours", "termine"]);
  });
});
