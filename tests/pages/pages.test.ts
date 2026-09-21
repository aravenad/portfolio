import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:content", async () => (await import("../helpers/content")).contentModule);

import { site } from "../../src/data/site";
import { fixtureProjects } from "../helpers/content";
import { SITE_ORIGIN, meta, renderPage } from "../helpers/render";

const Home = (await import("../../src/pages/index.astro")).default;
const ProjectsIndex = (await import("../../src/pages/projects/index.astro")).default;
const ProjectsPage = (await import("../../src/pages/projects/page/[page].astro")).default;
const ProjectDetail = (await import("../../src/pages/projects/[slug].astro")).default;

/**
 * Une route générée. Le type est écrit à la main : un `import()` dynamique d'un
 * fichier `.astro` est un `any` pour TypeScript, et le `satisfies
 * GetStaticPaths` de la page ne traverse pas cette frontière.
 */
type Route<P extends string> = {
  params: Record<P, string>;
  props: Record<string, unknown>;
};

/** Les routes générées, telles que le build les demanderait. */
const routes = {
  async projects(): Promise<Route<"slug">[]> {
    const page = await import("../../src/pages/projects/[slug].astro");
    return page.getStaticPaths({ paginate: (() => []) as never });
  },
  async pages(): Promise<Route<"page">[]> {
    const page = await import("../../src/pages/projects/page/[page].astro");
    return page.getStaticPaths({ paginate: (() => []) as never });
  },
};

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

/** Requête pour une page du site déployé. */
function request(pathname: string) {
  return new Request(`${SITE_ORIGIN}${pathname}`);
}

describe("page d'accueil", () => {
  it("annonce le titre et la description du site", async () => {
    const { document } = await renderPage(Home, { request: request("/portfolio/") });

    expect(document.title).toBe(site.title);
    expect(meta(document, "description")).toBe(site.description);
  });

  it("déclare la langue du document", async () => {
    const { document } = await renderPage(Home, { request: request("/portfolio/") });
    expect(document.documentElement.getAttribute("lang")).toBe("fr");
  });

  it("porte les ancres visées par la navigation", async () => {
    // Un lien « /#skills » vers une section absente ne mène nulle part.
    const { document } = await renderPage(Home, { request: request("/portfolio/") });

    for (const id of ["skills", "soft-skills", "career", "projects", "contact"]) {
      expect(document.getElementById(id), `section #${id} absente de l'accueil`).toBeTruthy();
    }
  });

  it("n'a qu'un seul h1", async () => {
    const { document } = await renderPage(Home, { request: request("/portfolio/") });
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it("met en avant trois projets et propose la liste complète", async () => {
    const { document } = await renderPage(Home, { request: request("/portfolio/") });
    const section = document.getElementById("projects")!;

    expect(section.querySelectorAll("h3")).toHaveLength(3);
    expect(section.textContent).toContain("Voir tous les projets");
  });

  it("masque les étiquettes sur l'aperçu de l'accueil", async () => {
    const { document } = await renderPage(Home, { request: request("/portfolio/") });
    expect(document.getElementById("projects")?.textContent).not.toContain("Java");
  });
});

describe("liste des projets", () => {
  it("affiche la première page et sa pagination", async () => {
    const { document } = await renderPage(ProjectsIndex, {
      request: request("/portfolio/projects"),
    });

    expect(document.querySelectorAll("article h3, .grid h3").length).toBeGreaterThan(0);
    expect(document.querySelector("[data-pagination]")).toBeTruthy();
    expect(document.querySelector('[data-page][aria-current="page"]')?.textContent?.trim())
      .toBe("1");
  });

  it("ouvre le fil d'Ariane sur la rubrique courante", async () => {
    const { document } = await renderPage(ProjectsIndex, {
      request: request("/portfolio/projects"),
    });

    expect(document.querySelector('nav[aria-label="Fil d\'Ariane"]')?.textContent)
      .toContain("Projets");
  });

  it("donne à la page sa propre description", async () => {
    const { document } = await renderPage(ProjectsIndex, {
      request: request("/portfolio/projects"),
    });

    expect(document.title).toContain("Projets");
    expect(meta(document, "description")).not.toBe(site.description);
  });

  it("ne génère de pages numérotées qu'à partir de la deuxième", async () => {
    const paths = await routes.pages();
    expect(paths.map((route) => route.params.page)).toEqual(["2"]);
  });

  it("numérote la deuxième page et y garde le fil d'Ariane complet", async () => {
    const { document } = await renderPage(ProjectsPage, {
      request: request("/portfolio/projects/page/2"),
      params: { page: "2" },
    });

    expect(document.title).toContain("page 2");
    expect(document.querySelector('[data-page][aria-current="page"]')?.textContent?.trim())
      .toBe("2");
    expect(document.querySelector('nav[aria-label="Fil d\'Ariane"]')?.textContent)
      .toContain("Page 2");
  });
});

describe("fiche d'un projet", () => {
  /** Les props que `getStaticPaths` prépare pour un projet donné. */
  async function propsFor(slug: string) {
    const paths = await routes.projects();
    const match = paths.find((route) => route.params.slug === slug);

    expect(match, `aucune route générée pour ${slug}`).toBeTruthy();
    return match!.props;
  }

  it("génère une route par projet", async () => {
    const paths = await routes.projects();
    expect(paths.map((route) => route.params.slug)).toEqual(fixtureProjects.map((p) => p.id));
  });

  it("titre la page avec le projet et reprend son résumé en description", async () => {
    const props = await propsFor("projet-2");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-2"),
      props,
    });

    expect(document.title).toBe("Projet 2 — Damien");
    expect(meta(document, "description")).toBe("Résumé du projet 2.");
    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Projet 2");
  });

  it("affiche les étiquettes, le statut et le contexte", async () => {
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });
    const header = document.querySelector("article header")!;

    expect(header.textContent).toContain("Java");
    expect(header.textContent).toContain("En cours");
    expect(header.textContent).toContain("En binôme");
  });

  it("rend le corps du projet", async () => {
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });

    expect(document.querySelector(".prose")?.textContent).toContain("Contexte");
  });

  it("relie chaque projet à ses voisins", async () => {
    const props = await propsFor("projet-4");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-4"),
      props,
    });
    const links = [...document.querySelectorAll('nav[aria-label*="précédent"] a')];

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/portfolio/projects/projet-3",
      "/portfolio/projects/projet-5",
    ]);
  });

  it("n'invente pas de voisin avant le premier projet", async () => {
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });
    const links = [...document.querySelectorAll('nav[aria-label*="précédent"] a')];

    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/portfolio/projects/projet-2");
  });

  it("n'invente pas de voisin après le dernier projet", async () => {
    const last = fixtureProjects.at(-1)!.id;
    const props = await propsFor(last);
    const { document } = await renderPage(ProjectDetail, {
      request: request(`/portfolio/projects/${last}`),
      props,
    });
    const links = [...document.querySelectorAll('nav[aria-label*="précédent"] a')];

    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toContain("projet-6");
  });
});
