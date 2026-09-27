import { beforeEach, describe, expect, it, vi } from "vitest";

import Header from "../../src/components/layout/Header.astro";
import { navLinks, navLinksEn, site } from "../../src/data/site";
import { at, render } from "../helpers/render";

/**
 * Le marquage du lien courant est calculé deux fois : ici au rendu, et de
 * nouveau côté client après chaque navigation, parce que `transition:persist`
 * conserve le header d'une page à l'autre. Ces tests couvrent la moitié serveur
 * — celle qui peint le premier écran — et fixent le comportement attendu des
 * deux, qui ont chacune produit un bug cette semaine.
 */

/** Le lien de navigation portant ce libellé. */
function link(document: Document, label: string) {
  const found = [...document.querySelectorAll("[data-nav-link]")].find(
    (node) => node.textContent?.trim() === label,
  );
  expect(found, `lien « ${label} » absent du header`).toBeTruthy();

  return found as Element;
}

/** Les libellés des liens marqués, quelle que soit la valeur d'`aria-current`. */
function marked(document: Document) {
  return [...document.querySelectorAll("[data-nav-link][aria-current]")].map((node) =>
    node.textContent?.trim(),
  );
}

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("Header", () => {
  it("affiche tous les liens de navigation, dans l'ordre déclaré", async () => {
    const { document } = await render(Header, at("/portfolio/"));
    const labels = [...document.querySelectorAll("[data-nav-link]")].map((node) =>
      node.textContent?.trim(),
    );

    expect(labels).toEqual(navLinks.map((navLink) => navLink.label));
  });

  it("préfixe chaque destination par la base du site", async () => {
    const { document } = await render(Header, at("/portfolio/"));

    for (const node of document.querySelectorAll("[data-nav-link], [data-home-link]")) {
      expect(node.getAttribute("href")).toMatch(/^\/portfolio\//);
    }
  });

  it("expose les sections du scroll-spy dans le DOM", async () => {
    const { document } = await render(Header, at("/portfolio/"));

    for (const navLink of navLinks) {
      expect(link(document, navLink.label).getAttribute("data-sections")).toBe(
        navLink.sections?.join(" "),
      );
    }
  });

  it("ramène le logo à l'accueil", async () => {
    const { document } = await render(Header, at("/portfolio/projects"));
    const home = document.querySelector("[data-home-link]");

    expect(home?.getAttribute("href")).toBe("/portfolio/");
    expect(home?.textContent?.trim()).toBe(site.name);
  });

  it("part dans son état « haut de page » : nu et élargi", async () => {
    // C'est le script qui pose `data-scrolled` au défilement. Le HTML servi
    // doit donc décrire le haut de page, celui de toute page ouverte par un lien.
    const { document } = await render(Header, at("/portfolio/"));

    expect(document.querySelector("header")?.hasAttribute("data-scrolled")).toBe(false);
    expect(document.querySelector("header .header-bar")).toBeTruthy();
    expect(document.querySelector("header .header-backdrop")).toBeTruthy();
  });

  it("survit à la navigation client sans rejouer son animation", async () => {
    // `transition:persist` : sans lui, le header clignote à chaque page.
    const { document } = await render(Header, at("/portfolio/"));
    expect(document.querySelector("header")?.hasAttribute("data-astro-transition-persist"))
      .toBe(true);
  });

  describe("marquage de la rubrique courante", () => {
    it("ne marque rien sur l'accueil, où le défilement décide", async () => {
      // Les liens à ancre pointent tous vers l'accueil : les marquer tous
      // allumerait la moitié de la barre d'un coup.
      const { document } = await render(Header, at("/portfolio/"));
      expect(marked(document)).toEqual([]);
    });

    it("marque « Projets » comme la page courante sur la liste", async () => {
      const { document } = await render(Header, at("/portfolio/projects"));

      expect(marked(document)).toEqual(["Projets"]);
      expect(link(document, "Projets").getAttribute("aria-current")).toBe("page");
    });

    it("ignore la barre finale", async () => {
      const { document } = await render(Header, at("/portfolio/projects/"));
      expect(link(document, "Projets").getAttribute("aria-current")).toBe("page");
    });

    it("garde « Projets » marqué sur la fiche d'un projet", async () => {
      // « true » et non « page » : on est dans la rubrique, pas sur sa page.
      const { document } = await render(Header, at("/portfolio/projects/mon-projet"));

      expect(marked(document)).toEqual(["Projets"]);
      expect(link(document, "Projets").getAttribute("aria-current")).toBe("true");
    });

    it("garde « Projets » marqué sur la deuxième page de la liste", async () => {
      const { document } = await render(Header, at("/portfolio/projects/page/2"));
      expect(link(document, "Projets").getAttribute("aria-current")).toBe("true");
    });

    it("ne fait jamais d'un lien à ancre le parent d'une page", async () => {
      // « /portfolio/#skills » suivi d'une barre ne préfixe aucun chemin : si la
      // comparaison se faisait sur la seule racine, « Compétences » resterait
      // allumé partout.
      const { document } = await render(Header, at("/portfolio/projects/mon-projet"));
      expect(marked(document)).not.toContain("Compétences");
    });

    it("marque « Projets » même si le site est publié à la racine", async () => {
      // La normalisation réduit « / » à « / » et non à une chaîne vide : sans
      // ce repli, aucun chemin ne correspondrait plus à l'accueil.
      vi.stubEnv("BASE_URL", "/");
      const { document } = await render(Header, at("/projects"));

      expect(link(document, "Projets").getAttribute("aria-current")).toBe("page");
      expect(document.querySelector("[data-home-link]")?.getAttribute("href")).toBe("/");
    });

    it("n'allume rien sur une racine sans base", async () => {
      // « / » se réduit à la chaîne vide une fois la barre finale retirée : le
      // repli sur « / » est ce qui empêche la comparaison de partir en vrille.
      vi.stubEnv("BASE_URL", "/");
      const { document } = await render(Header, at("/"));

      expect(marked(document)).toEqual([]);
    });

    it("ne marque aucun lien sur une page hors navigation", async () => {
      const { document } = await render(Header, at("/portfolio/404"));
      expect(marked(document)).toEqual([]);
    });
  });

  describe("menu mobile", () => {
    it("part fermé et décrit son état", async () => {
      const toggle = (await render(Header, at("/portfolio/"))).document.querySelector(
        "[data-nav-toggle]",
      );

      expect(toggle?.getAttribute("aria-expanded")).toBe("false");
      expect(toggle?.getAttribute("aria-controls")).toBe("nav-menu");
      expect(toggle?.getAttribute("aria-label")).toBeTruthy();
    });

    it("prolonge la barre au lieu de s'ouvrir sous elle", async () => {
      // Parti de 64 px, le panneau formait une marche visible à la jonction avec
      // le fond de la barre. Il part du haut et passe sous le logo et le bouton.
      const { document } = await render(Header, at("/portfolio/"));
      const classes = document.getElementById("nav-menu")?.getAttribute("class")?.split(/\s+/);

      expect(classes).toContain("top-0");
      expect(classes).toContain("-z-10");
      expect(classes).not.toContain("top-16");
    });

    it("ne passe pas derrière la barre sur grand écran", async () => {
      // Le `-z-10` du panneau mobile s'appliquait aussi au-delà de 640 px dès
      // que la liste était un élément flex : les liens passaient sous la barre,
      // qui prenait leurs clics et les masquait au défilement.
      const { document } = await render(Header, at("/portfolio/"));
      const classes = document.getElementById("nav-menu")?.getAttribute("class")?.split(/\s+/);

      expect(classes).toContain("-z-10");
      expect(classes).toContain("sm:z-auto");
    });

    it("commande bien le panneau qu'il annonce", async () => {
      const { document } = await render(Header, at("/portfolio/"));
      const controls = document.querySelector("[data-nav-toggle]")?.getAttribute("aria-controls");

      expect(document.getElementById(controls!)).toBeTruthy();
    });
  });
});

describe("Header en anglais", () => {
  it("traduit les liens et les garde dans la version anglaise", async () => {
    const { document } = await render(Header, at("/portfolio/en/"));
    const links = [...document.querySelectorAll("[data-nav-link]")];

    expect(links.map((node) => node.textContent?.trim())).toEqual(
      navLinksEn.map((navLink) => navLink.label),
    );
    for (const node of links) expect(node.getAttribute("href")).toMatch(/^\/portfolio\/en\//);
    expect(document.querySelector("[data-home-link]")?.getAttribute("href")).toBe("/portfolio/en/");
  });

  it("marque « Projects » sur la liste anglaise", async () => {
    const { document } = await render(Header, at("/portfolio/en/projects"));
    expect(marked(document)).toEqual(["Projects"]);
  });

  it("traduit les libellés du menu mobile, pour le script aussi", async () => {
    const toggle = (await render(Header, at("/portfolio/en/"))).document.querySelector(
      "[data-nav-toggle]",
    );

    expect(toggle?.getAttribute("aria-label")).toBe("Open the menu");
    expect(toggle?.getAttribute("data-label-close")).toBe("Close the menu");
  });

  it("persiste séparément dans chaque langue", async () => {
    // Un même nom garderait le header français en arrivant sur une page anglaise.
    const fr = (await render(Header, at("/portfolio/"))).document.querySelector("header");
    const en = (await render(Header, at("/portfolio/en/"))).document.querySelector("header");

    expect(fr?.getAttribute("data-astro-transition-persist")).not.toBe(
      en?.getAttribute("data-astro-transition-persist"),
    );
  });
});

describe("sélecteur de langue", () => {
  it("mène à la même page en anglais depuis le français", async () => {
    const { document } = await render(Header, at("/portfolio/projects/page/2"));
    const link = document.querySelector("[data-lang-switch]");

    expect(link?.getAttribute("href")).toBe("/portfolio/en/projects/page/2");
    expect(link?.getAttribute("hreflang")).toBe("en");
    expect(link?.getAttribute("lang")).toBe("en");
    expect(link?.textContent?.trim()).toBe("EN");
  });

  it("ramène au français depuis l'anglais", async () => {
    const { document } = await render(Header, at("/portfolio/en/"));
    const link = document.querySelector("[data-lang-switch]");

    expect(link?.getAttribute("href")).toBe("/portfolio/");
    expect(link?.getAttribute("aria-label")).toBe("Version française");
  });
});

describe("bouton de thème", () => {
  it("est un bouton à bascule, nommé dans la langue de la page", async () => {
    const fr = (await render(Header, at("/portfolio/"))).document.querySelector("[data-theme-toggle]");
    const en = (await render(Header, at("/portfolio/en/"))).document.querySelector("[data-theme-toggle]");

    expect(fr?.tagName).toBe("BUTTON");
    // Le sombre est le thème par défaut : le bouton du clair part relâché.
    expect(fr?.getAttribute("aria-pressed")).toBe("false");
    expect(fr?.getAttribute("aria-label")).toBe("Thème clair");
    expect(en?.getAttribute("aria-label")).toBe("Light theme");
  });
});
