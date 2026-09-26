import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:content", async () => (await import("../helpers/content")).contentModule);

import { site } from "../../src/data/site";
import { fixtureProjects } from "../helpers/content";
import { SITE_ORIGIN, meta, renderPage } from "../helpers/render";

const Home = (await import("../../src/pages/index.astro")).default;
const ProjectsIndex = (await import("../../src/pages/projects/index.astro")).default;
const ProjectsPage = (await import("../../src/pages/projects/page/[page].astro")).default;
const ProjectDetail = (await import("../../src/pages/projects/[slug].astro")).default;
const HomeEn = (await import("../../src/pages/en/index.astro")).default;
const ProjectsIndexEn = (await import("../../src/pages/en/projects/index.astro")).default;
const ProjectsPageEn = (await import("../../src/pages/en/projects/page/[page].astro")).default;
const ProjectDetailEn = (await import("../../src/pages/en/projects/[slug].astro")).default;

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

  it("résume la fiche par un sommaire", async () => {
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });
    const links = [
      ...document.querySelectorAll('[data-toc="sidebar"] [data-toc-link]'),
    ];

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Contexte",
      "Réalisation",
      "Résultats",
    ]);
  });

  it("place le sommaire avant le corps du texte", async () => {
    // Son ordre dans le document est aussi celui du clavier et des lecteurs
    // d'écran : on doit savoir ce que contient la fiche avant d'y entrer, même
    // quand la mise en page le renvoie dans la marge droite.
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });

    const prose = document.querySelector(".prose")!;
    const order = [...prose.parentElement!.children];
    const toc = order.find((node) => node.querySelector("[data-toc]"))!;

    expect(order.indexOf(toc)).toBeLessThan(order.indexOf(prose));
  });

  it("ancre chaque entrée du sommaire sur un titre du corps", async () => {
    // Le lien le plus fragile du dispositif : les ancres viennent des `slug`
    // rendus par Astro, les cibles des `id` qu'il pose sur les titres. Que les
    // deux divergent et le sommaire ne mène plus nulle part, sans rien casser
    // d'autre — donc sans que rien ne le signale.
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });
    const prose = document.querySelector(".prose")!;

    for (const link of document.querySelectorAll("[data-toc-link]")) {
      // Les deux formes du sommaire sont parcourues : chacune doit mener au
      // même endroit, et aucune ne doit rester en arrière lors d'un renommage.
      const id = (link.getAttribute("href") ?? "").slice(1);

      expect(id, "une entrée du sommaire sans ancre").not.toBe("");
      expect(
        prose.querySelector(`[id="${id}"]`),
        `aucun titre #${id} dans le corps de la fiche`,
      ).toBeTruthy();
    }
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

describe("version anglaise", () => {
  /*
   * Les pages anglaises sont les mêmes composants que les françaises : seule
   * l'URL change, et avec elle la langue. Ces tests vérifient que rien ne reste
   * en français et qu'aucun lien ne ramène vers la version française.
   */
  it("déclare l'anglais et traduit l'accueil", async () => {
    const { document } = await renderPage(HomeEn, { request: request("/portfolio/en/") });

    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(meta(document, "og:locale")).toBe("en_US");
    expect(document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim())
      .toBe("Hi, I'm Damien.");
    expect(document.getElementById("projects")?.textContent).toContain("See all projects");
  });

  it("porte les mêmes ancres que l'accueil français", async () => {
    const { document } = await renderPage(HomeEn, { request: request("/portfolio/en/") });

    for (const id of ["skills", "soft-skills", "career", "projects", "contact"]) {
      expect(document.getElementById(id), `section #${id} absente`).toBeTruthy();
    }
  });

  it("garde tous les liens internes dans la version anglaise", async () => {
    const { document } = await renderPage(HomeEn, { request: request("/portfolio/en/") });
    const internal = [...document.querySelectorAll("a[href^='/portfolio']")]
      .filter((link) => !link.hasAttribute("data-lang-switch"))
      .map((link) => link.getAttribute("href")!)
      // Le CV est un fichier, commun aux deux langues.
      .filter((href) => !href.endsWith(".pdf"));

    expect(internal.length).toBeGreaterThan(0);
    for (const href of internal) expect(href).toMatch(/^\/portfolio\/en\//);
  });

  it("traduit la liste des projets et sa pagination", async () => {
    const { document } = await renderPage(ProjectsIndexEn, {
      request: request("/portfolio/en/projects"),
    });

    expect(document.title).toBe("Projects — Damien");
    expect(document.querySelector('nav[aria-label="Breadcrumb"]')?.textContent).toContain("Home");
    expect(document.querySelector("[data-pagination]")?.textContent).toContain("Next");
    expect(document.querySelector('[data-page="2"]')?.getAttribute("href"))
      .toBe("/portfolio/en/projects/page/2");
  });

  it("numérote la deuxième page en anglais", async () => {
    const page = await import("../../src/pages/en/projects/page/[page].astro");
    const paths: Route<"page">[] = await page.getStaticPaths({ paginate: (() => []) as never });
    expect(paths.map((route) => route.params.page)).toEqual(["2"]);

    const { document } = await renderPage(ProjectsPageEn, {
      request: request("/portfolio/en/projects/page/2"),
      params: { page: "2" },
    });
    expect(document.title).toBe("Projects, page 2 — Damien");
  });

  it("traduit l'habillage d'une fiche et garde ses voisins en anglais", async () => {
    const page = await import("../../src/pages/en/projects/[slug].astro");
    const paths: Route<"slug">[] = await page.getStaticPaths({ paginate: (() => []) as never });
    const { props } = paths.find((route) => route.params.slug === "projet-2")!;

    const { document } = await renderPage(ProjectDetailEn, {
      request: request("/portfolio/en/projects/projet-2"),
      props,
    });
    const neighbors = document.querySelector('nav[aria-label="Previous and next projects"]');

    expect(neighbors).toBeTruthy();
    for (const link of neighbors!.querySelectorAll("a")) {
      expect(link.getAttribute("href")).toMatch(/^\/portfolio\/en\/projects\//);
    }
    expect(document.querySelector("article header")?.textContent).toContain("Completed");
  });
});
