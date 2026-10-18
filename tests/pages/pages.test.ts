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
const Legal = (await import("../../src/pages/legal.astro")).default;
const LegalEn = (await import("../../src/pages/en/legal.astro")).default;
const Accessibility = (await import("../../src/pages/accessibility.astro")).default;
const AccessibilityEn = (await import("../../src/pages/en/accessibility.astro")).default;
const Sitemap = (await import("../../src/pages/sitemap.astro")).default;
const SitemapEn = (await import("../../src/pages/en/sitemap.astro")).default;

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

    for (const id of ["about", "skills", "soft-skills", "career", "projects", "contact"]) {
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

    expect(document.querySelectorAll("main ul.grid > li h2").length).toBeGreaterThan(0);
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

    expect(document.title).toBe("Projet 2 | Damien Aravena Bravo");
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

  it("ajoute au corps les rubriques du PPP renseignées, et au sommaire leurs titres", async () => {
    const props = await propsFor("projet-3");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-3"),
      props,
    });
    const prose = document.querySelector(".prose")!;
    const links = [
      ...document.querySelectorAll('[data-toc="sidebar"] [data-toc-link]'),
    ].map((link) => link.textContent?.trim());

    expect(prose.querySelector("#mon-role + ul")?.textContent).toContain("Tests unitaires");
    expect(prose.querySelector("#competences-mobilisees + ul")?.textContent).toContain(
      "Travailler dans une équipe informatique",
    );
    expect(prose.querySelector("#ce-que-j-ai-appris + ul")?.textContent).toContain(
      "Écrire des tests avant le code",
    );
    expect(links.slice(-3)).toEqual(["Mon rôle", "Compétences mobilisées", "Ce que j'ai appris"]);
  });

  it("propose le site en ligne et le dépôt en boutons sous l'en-tête", async () => {
    const props = await propsFor("projet-3");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-3"),
      props,
    });
    const links = [...document.querySelectorAll('article header nav[aria-label="Liens du projet"] a')];

    expect(links.map((link) => [link.textContent?.trim(), link.getAttribute("href")])).toEqual([
      ["Voir le site (nouvel onglet)", "https://exemple.fr/projet-3/"],
      ["Voir le code (nouvel onglet)", "https://github.com/exemple/projet-3"],
    ]);
  });

  it("ouvre ces liens dans un nouvel onglet, sans lui laisser la main sur la fiche", async () => {
    const props = await propsFor("projet-3");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-3"),
      props,
    });

    for (const link of document.querySelectorAll('[aria-label="Liens du projet"] a')) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.querySelector(".sr-only")?.textContent?.trim()).toBe("(nouvel onglet)");
      // La flèche oblique d'Arrow.astro, le signe visible du nouvel onglet.
      expect(link.querySelector('svg.-rotate-45 path[d^="M2.5 8h11"]')).not.toBeNull();
    }
  });

  it("ne rend que les liens renseignés, et rien sans lien", async () => {
    const withRepo = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-4"),
      props: await propsFor("projet-4"),
    });
    const without = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props: await propsFor("projet-1"),
    });
    const nav = '[aria-label="Liens du projet"]';

    expect(
      [...withRepo.document.querySelectorAll(`${nav} a`)].map((link) => link.textContent?.trim()),
    ).toEqual(["Voir le code (nouvel onglet)"]);
    expect(without.document.querySelector(nav)).toBeNull();
  });

  it("montre la démo sous l'en-tête, en image d'attente et lien « Jouer »", async () => {
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props: await propsFor("projet-1"),
    });
    const demo = document.querySelector("article figure[data-demo]");
    const play = demo?.querySelector("a[data-demo-play]");

    // Juste après l'en-tête, avant le texte de la fiche.
    expect(document.querySelector("article header")?.nextElementSibling).toBe(demo);
    expect(demo?.getAttribute("aria-label")).toBe("Démo jouable");
    expect(demo?.getAttribute("data-demo-src")).toBe("/portfolio/demos/projet-1/");
    // Espace insécable devant le deux-points (`withFrenchSpacing`).
    expect(demo?.getAttribute("data-demo-title")).toMatch(/^Projet 1\s: démo jouable$/);
    expect(demo?.querySelector("img")?.getAttribute("src")).toBe("/portfolio/demos/projet-1/poster.webp");
    expect(demo?.querySelector("img")?.getAttribute("alt")).toBe("");
    // Sans script, le lien ouvre la démo en pleine page : rien n'est chargé avant le clic.
    expect(play?.getAttribute("href")).toBe("/portfolio/demos/projet-1/?lang=fr");
    expect(play?.textContent?.trim()).toBe("Jouer à la démo");
    expect(demo?.querySelector("iframe")).toBeNull();
    expect(demo?.querySelector("figcaption")?.textContent).toBe("But du jeu et commandes.");
    expect(demo?.querySelector('[role="status"]')).toBeTruthy();
  });

  it("ne montre pas de démo à une fiche qui n'en a pas", async () => {
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-2"),
      props: await propsFor("projet-2"),
    });

    expect(document.querySelector("[data-demo]")).toBeNull();
  });

  it("ne montre aucune rubrique du PPP tant qu'elle est vide", async () => {
    const props = await propsFor("projet-1");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-1"),
      props,
    });

    for (const id of ["mon-role", "competences-mobilisees", "ce-que-j-ai-appris"]) {
      expect(document.getElementById(id), id).toBeNull();
    }
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

  it("légende chaque voisin : précédent, puis suivant", async () => {
    const props = await propsFor("projet-4");
    const { document } = await renderPage(ProjectDetail, {
      request: request("/portfolio/projects/projet-4"),
      props,
    });
    const captions = [...document.querySelectorAll('nav[aria-label*="précédent"] a')].map(
      (link) => link.firstElementChild?.textContent?.trim(),
    );

    expect(captions).toEqual(["Précédent", "Suivant"]);
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
    expect(document.title).toBe(site.title);
    expect(meta(document, "og:locale")).toBe("en_US");
    expect(document.querySelector("h1 .sr-only")?.textContent?.replace(/\s+/g, " ").trim())
      .toBe("Hi, I'm Damien.");
    expect(document.getElementById("projects")?.textContent).toContain("See all projects");
  });

  it("porte les mêmes ancres que l'accueil français", async () => {
    const { document } = await renderPage(HomeEn, { request: request("/portfolio/en/") });

    for (const id of ["about", "skills", "soft-skills", "career", "projects", "contact"]) {
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

    expect(document.title).toBe("Projects | Damien Aravena Bravo");
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
    expect(document.title).toBe("Projects, page 2 | Damien Aravena Bravo");
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

  it("ouvre la démo en anglais", async () => {
    const page = await import("../../src/pages/en/projects/[slug].astro");
    const paths: Route<"slug">[] = await page.getStaticPaths({ paginate: (() => []) as never });
    const { props } = paths.find((route) => route.params.slug === "projet-1")!;

    const { document } = await renderPage(ProjectDetailEn, {
      request: request("/portfolio/en/projects/projet-1"),
      props,
    });
    const demo = document.querySelector("[data-demo]");

    expect(demo?.getAttribute("aria-label")).toBe("Playable demo");
    expect(demo?.getAttribute("data-demo-lang")).toBe("en");
    expect(demo?.querySelector("[data-demo-play]")?.getAttribute("href")).toBe(
      "/portfolio/demos/projet-1/?lang=en",
    );
    expect(demo?.querySelector("[data-demo-play]")?.textContent?.trim()).toBe("Play the demo");
  });
});

describe("mentions légales", () => {
  // Ce que la LCEN (art. 1-1) demande, et ce que le site choisit d'y ajouter.
  it("nomment l'éditeur, son contact et l'hébergeur avec son adresse", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });
    const text = document.body.textContent ?? "";

    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Mentions légales");
    expect(text).toContain(site.author);
    expect(document.querySelector(`a[href="mailto:${site.email}"]`)).toBeTruthy();
    expect(document.querySelector("address")?.textContent).toContain(site.host.street);
    expect(document.querySelector("address")?.textContent).toContain(site.host.city);
  });

  it("renvoient à la déclaration de confidentialité de GitHub en français", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });
    expect(document.querySelector('a[href*="privacy-statement"]')?.getAttribute("href"))
      .toContain("docs.github.com/fr/");
  });

  it("ne publient ni adresse postale ni téléphone de l'éditeur", async () => {
    // Choix assumé d'un éditeur non professionnel : les seules adresses de la
    // page sont celles de l'hébergeur et du bureau d'enregistrement.
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });
    const addresses = [...document.querySelectorAll("address")].map((a) => a.textContent ?? "");

    expect(addresses).toHaveLength(2);
    expect(addresses[0]).toContain(site.host.name);
    expect(addresses[1]).toContain(site.registrar.name);
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("citent le bureau d'enregistrement sans le faire passer pour l'hébergeur", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });
    const section = document.querySelector('[aria-labelledby="legal-domain"]')?.textContent ?? "";

    expect(section).toContain(site.registrar.domain);
    expect(section).toContain("n'héberge pas le site");
  });

  it("titrent la page et la décrivent pour les moteurs", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });

    expect(document.title).toBe(`Mentions légales | ${site.author}`);
    expect(meta(document, "description")).toContain("hébergeur");
  });

  it("n'emploient aucune ancre de l'accueil, que la barre surveille", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });

    for (const id of ["about", "skills", "soft-skills", "career", "projects", "contact"]) {
      expect(document.getElementById(id), id).toBeNull();
    }
  });

  it("existent en anglais, à la même adresse sous /en/", async () => {
    const { document } = await renderPage(LegalEn, { request: request("/portfolio/en/legal") });

    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Legal notice");
    expect(document.querySelector("address")?.textContent).toContain("United States");
    // La déclaration de confidentialité de GitHub, dans la langue de la page.
    expect(document.querySelector('a[href*="privacy-statement"]')?.getAttribute("href"))
      .toContain("docs.github.com/en/");
    expect(document.body.textContent).toContain("Switzerland");
  });
});

describe("déclaration d'accessibilité", () => {
  it("donne l'état de conformité, les chiffres de l'audit et le lien du rapport", async () => {
    const { document } = await renderPage(Accessibility, { request: request("/portfolio/accessibility") });
    const text = document.body.textContent ?? "";

    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Accessibilité");
    expect(text).toContain(`RGAA), version ${site.audit.rgaa}`);
    expect(text).toContain(`${site.audit.conform} critères conformes`);
    expect(text).toContain(`${site.audit.notApplicable} critères non applicables`);
  });

  it("ouvre le rapport Ara dans un nouvel onglet, et le dit", async () => {
    const { document } = await renderPage(Accessibility, { request: request("/portfolio/accessibility") });
    const report = document.querySelector(`a[href="${site.audit.report}"]`);

    expect(report?.getAttribute("target")).toBe("_blank");
    expect(report?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(report?.querySelector(".sr-only")?.textContent).toContain("(nouvel onglet)");
    expect(report?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("date l'audit en toutes lettres, avec la date machine", async () => {
    const { document } = await renderPage(Accessibility, { request: request("/portfolio/accessibility") });
    const time = document.querySelector("time");

    expect(time?.getAttribute("datetime")).toBe(site.audit.date);
    expect(time?.textContent).toBe("12 octobre 2026");
  });

  it("dit à qui écrire quand un contenu reste inaccessible", async () => {
    const { document } = await renderPage(Accessibility, { request: request("/portfolio/accessibility") });
    const section = document.querySelector('[aria-labelledby="a11y-contact"]');

    expect(section?.querySelector(`a[href="mailto:${site.email}"]`)).toBeTruthy();
  });

  it("titre la page et la décrit pour les moteurs", async () => {
    const { document } = await renderPage(Accessibility, { request: request("/portfolio/accessibility") });

    expect(document.title).toBe(`Accessibilité | ${site.author}`);
    expect(meta(document, "description")).toContain("RGAA");
  });

  it("existe en anglais, à la même adresse sous /en/", async () => {
    const { document } = await renderPage(AccessibilityEn, { request: request("/portfolio/en/accessibility") });

    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Accessibility");
    expect(document.querySelector("time")?.textContent).toBe("12 October 2026");
  });
});

describe("sommaire des pages d'information", () => {
  /** Les entrées du sommaire, dans sa forme de grand écran. */
  const toc = (document: Document) =>
    [...document.querySelectorAll('[data-toc="sidebar"] a')].map((a) => a.getAttribute("href"));

  it("mène à chaque partie des mentions légales", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });
    const ids = [...document.querySelectorAll("article h2")].map((h2) => `#${h2.id}`);

    expect(ids).toHaveLength(6);
    expect(toc(document)).toEqual(ids);
  });

  it("mène à chaque partie de la déclaration d'accessibilité", async () => {
    const { document } = await renderPage(Accessibility, { request: request("/portfolio/accessibility") });
    const ids = [...document.querySelectorAll("article h2")].map((h2) => `#${h2.id}`);

    expect(ids).toHaveLength(5);
    expect(toc(document)).toEqual(ids);
  });

  it("garde les titres visés hors de portée du header collant", async () => {
    const { document } = await renderPage(Legal, { request: request("/portfolio/legal") });

    for (const h2 of document.querySelectorAll("article h2")) {
      expect(h2.classList.contains("scroll-mt-22"), h2.id).toBe(true);
    }
  });

  it("se traduit avec la page", async () => {
    const { document } = await renderPage(AccessibilityEn, { request: request("/portfolio/en/accessibility") });

    expect(document.querySelector('[data-toc="compact"]')?.getAttribute("aria-label")).toBe("On this page");
    expect(document.querySelector('[data-toc="sidebar"] a')?.textContent?.trim()).toBe("Compliance status");
  });
});

describe("plan du site", () => {
  it("est une page, titrée et décrite pour les moteurs", async () => {
    const { document } = await renderPage(Sitemap, { request: request("/portfolio/sitemap") });

    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Plan du site");
    expect(document.title).toBe(`Plan du site | ${site.author}`);
    expect(meta(document, "description")).toContain("chaque projet");
  });

  it("mène à chaque section de l'accueil, à chaque projet et aux pages d'information", async () => {
    const { document } = await renderPage(Sitemap, { request: request("/portfolio/sitemap") });
    const hrefs = [...document.querySelectorAll("article a")].map((a) => a.getAttribute("href"));

    for (const id of ["about", "skills", "career", "contact"]) {
      expect(hrefs, id).toContain(`/portfolio/#${id}`);
    }
    expect(hrefs).toContain("/portfolio/projects");
    for (const project of fixtureProjects) {
      expect(hrefs, project.id).toContain(`/portfolio/projects/${project.id}`);
    }
    expect(hrefs).toContain("/portfolio/legal");
    expect(hrefs).toContain("/portfolio/accessibility");
    expect(hrefs).toContain(`mailto:${site.email}`);
    expect(document.querySelector("article a[download]")).toBeTruthy();
  });

  it("titre chaque groupe de liens", async () => {
    const { document } = await renderPage(Sitemap, { request: request("/portfolio/sitemap") });
    const groups = [...document.querySelectorAll("article h2")].map((h2) => h2.textContent?.trim());

    expect(groups).toEqual(["Accueil", "Projets", "Contact", "À propos du site"]);
    // Un titre-lien ne se distinguerait pas des autres titres (RGAA 10.6).
    expect(document.querySelector("article h2 a")).toBeNull();
  });

  it("existe en anglais, avec des liens restés en anglais", async () => {
    const { document } = await renderPage(SitemapEn, { request: request("/portfolio/en/sitemap") });
    const internal = [...document.querySelectorAll("article a:not([download])")]
      .map((a) => a.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/"));

    expect(document.querySelector("h1")?.textContent?.trim()).toBe("Site map");
    expect(internal.length).toBeGreaterThan(0);
    for (const href of internal) {
      expect(href).toMatch(/^\/portfolio\/en(\/|$)/);
    }
  });
});

describe("robots.txt", () => {
  it("ouvre tout le site et annonce le plan du site, base comprise", async () => {
    const { GET } = await import("../../src/pages/robots.txt");
    const response = await GET({ site: new URL(SITE_ORIGIN) } as never);
    const body = await response.text();

    expect(body).toContain("User-agent: *\nAllow: /");
    expect(body).toContain(`Sitemap: ${SITE_ORIGIN}/portfolio/sitemap-index.xml`);
  });
});
