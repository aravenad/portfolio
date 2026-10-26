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

/**
 * Les deux listes des mêmes liens : celle de la barre large et celle du menu
 * replié. Chacune est à sa place dans l'ordre de tabulation (RGAA 12.8).
 */
const lists = { barre: "[data-nav-bar]", menu: "#nav-menu" } as const;

/** Les libellés des liens d'une liste. */
function labels(document: Document, list: string) {
  return [...document.querySelectorAll(`${list} [data-nav-link]`)].map((node) =>
    node.textContent?.trim(),
  );
}

/** Le lien de la barre large portant ce libellé. */
function link(document: Document, label: string) {
  const found = [...document.querySelectorAll(`${lists.barre} [data-nav-link]`)].find(
    (node) => node.textContent?.trim() === label,
  );
  expect(found, `lien « ${label} » absent du header`).toBeTruthy();

  return found as Element;
}

/**
 * Les libellés des liens marqués, quelle que soit la valeur d'`aria-current`.
 * Ceux de la barre large, après avoir vérifié que le menu marque les mêmes.
 */
function marked(document: Document) {
  const [bar, menu] = [lists.barre, lists.menu].map((list) =>
    [...document.querySelectorAll(`${list} [data-nav-link][aria-current]`)].map(
      (node) => `${node.textContent?.trim()}=${node.getAttribute("aria-current")}`,
    ),
  );
  expect(menu, "le menu replié ne marque pas les mêmes liens").toEqual(bar);

  return bar.map((entry) => entry.split("=")[0]);
}

/** Les éléments focalisables du header, dans l'ordre du code. */
function focusOrder(document: Document) {
  return [...document.querySelectorAll("header a, header button")];
}

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("Header", () => {
  it.each(Object.entries(lists))(
    "affiche tous les liens de navigation, dans l'ordre déclaré (%s)",
    async (_, list) => {
      const { document } = await render(Header, at("/portfolio/"));

      expect(labels(document, list)).toEqual(navLinks.map((navLink) => navLink.label));
    },
  );

  describe("ordre de tabulation (RGAA 12.8)", () => {
    // Une seule liste, remontée en tête par CSS au-delà de 640 px, faisait
    // passer le focus du nom à « EN » et au thème avant les liens qu'on voyait
    // en premier. L'ordre du code doit donc être celui de chaque disposition.
    it("place les liens de la barre large avant la langue et le thème", async () => {
      const { document } = await render(Header, at("/portfolio/"));
      const order = focusOrder(document);
      const lastBarLink = [...document.querySelectorAll(`${lists.barre} a`)].at(-1)!;

      expect(order.indexOf(lastBarLink)).toBeLessThan(
        order.indexOf(document.querySelector("[data-lang-switch]")!),
      );
    });

    it("place le bouton du menu après les réglages, et son panneau juste après lui", async () => {
      const { document } = await render(Header, at("/portfolio/"));
      const order = focusOrder(document);
      const toggle = order.indexOf(document.querySelector("[data-nav-toggle]")!);
      const firstMenuLink = order.indexOf(document.querySelector(`${lists.menu} a`)!);

      expect(order.indexOf(document.querySelector("[data-settings-toggle]")!)).toBeLessThan(toggle);
      expect(firstMenuLink).toBe(toggle + 1);
    });

    it("n'affiche qu'une des deux listes à chaque taille", async () => {
      // Sous 48rem la barre large, au-delà le menu : `display: none`, qui les
      // retire aussi de la tabulation et de l'arbre d'accessibilité.
      const { document } = await render(Header, at("/portfolio/"));
      const bar = document.querySelector(lists.barre)?.getAttribute("class")?.split(/\s+/);
      const menu = document.querySelector(lists.menu)?.closest("nav")?.getAttribute("class")?.split(/\s+/);

      expect(bar).toEqual(expect.arrayContaining(["hidden", "md:flex"]));
      expect(menu).toContain("md:hidden");
    });
  });

  it("préfixe chaque destination par la base du site", async () => {
    const { document } = await render(Header, at("/portfolio/"));

    for (const node of document.querySelectorAll("[data-nav-link], [data-home-link]")) {
      expect(node.getAttribute("href")).toMatch(/^\/portfolio\//);
    }
  });

  it.each(Object.entries(lists))("expose les sections du scroll-spy dans le DOM (%s)", async (_, list) => {
    const { document } = await render(Header, at("/portfolio/"));
    const sections = [...document.querySelectorAll(`${list} [data-nav-link]`)].map((node) =>
      node.getAttribute("data-sections"),
    );

    expect(sections).toEqual(navLinks.map((navLink) => navLink.sections?.join(" ")));
  });

  it("ramène le logo à l'accueil", async () => {
    const { document } = await render(Header, at("/portfolio/projects"));
    const home = document.querySelector("[data-home-link]");

    expect(home?.getAttribute("href")).toBe("/portfolio/");
    expect(home?.textContent?.trim()).toBe(site.brand);
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

    it("garde son `-z-10` hors de la barre large", async () => {
      // Quand la même liste servait aux deux tailles, ce `-z-10` s'appliquait
      // aussi dans la barre dès qu'elle y était un élément flex : les liens
      // passaient sous la barre, qui prenait leurs clics. La barre a désormais
      // sa propre liste, sans indice d'empilement.
      const { document } = await render(Header, at("/portfolio/"));
      const classes = document.querySelector(`${lists.barre} ul`)?.getAttribute("class")?.split(/\s+/);

      expect(classes?.some((name) => name.includes("z-"))).toBe(false);
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

    for (const list of Object.values(lists)) {
      expect(labels(document, list)).toEqual(navLinksEn.map((navLink) => navLink.label));
    }
    for (const node of document.querySelectorAll("[data-nav-link]")) {
      expect(node.getAttribute("href")).toMatch(/^\/portfolio\/en\//);
    }
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
    expect(link?.getAttribute("aria-label")).toBe("FR, version française");
  });
});

describe("panneau de réglages", () => {
  async function panel(path: string) {
    const { document } = await render(Header, at(path));
    const gear = document.querySelector("[data-settings-toggle]");
    const target = document.getElementById(gear?.getAttribute("popovertarget") ?? "");

    return { document, gear, target };
  }

  it("s'ouvre depuis un engrenage nommé dans la langue de la page", async () => {
    const fr = await panel("/portfolio/");
    const en = await panel("/portfolio/en/");

    expect(fr.gear?.tagName).toBe("BUTTON");
    expect(fr.gear?.getAttribute("aria-label")).toBe("Réglages d'affichage");
    expect(en.gear?.getAttribute("aria-label")).toBe("Display settings");
    // Un popover natif : Échap, le clic à côté et l'état déplié viennent du navigateur.
    expect(fr.target?.hasAttribute("popover")).toBe(true);
  });

  it("est un groupe titré qui suit l'engrenage dans l'ordre de tabulation (RGAA 12.8)", async () => {
    const { document, gear, target } = await panel("/portfolio/");
    const order = focusOrder(document);
    const title = document.getElementById(target?.getAttribute("aria-labelledby") ?? "");

    expect(target?.getAttribute("role")).toBe("group");
    expect(title?.textContent?.trim()).toBe("Affichage");
    expect(order.indexOf(target!.querySelector("button")!)).toBe(order.indexOf(gear!) + 1);
  });

  it.each([
    ["[data-theme-toggle]", "Thème clair", "Light theme"],
    ["[data-shine-toggle]", "Animer les titres", "Animate titles"],
    ["[data-glyph-toggle]", "Animer le fond", "Animate background"],
  ])("contient l'interrupteur %s, nommé par son texte", async (selector, fr, en) => {
    const french = (await panel("/portfolio/")).target?.querySelector(selector);
    const english = (await panel("/portfolio/en/")).target?.querySelector(selector);

    expect(french?.tagName).toBe("BUTTON");
    expect(french?.hasAttribute("aria-pressed")).toBe(true);
    expect(french?.hasAttribute("aria-label")).toBe(false);
    expect(french?.textContent?.trim()).toBe(fr);
    expect(english?.textContent?.trim()).toBe(en);
  });

  it("laisse sa place au menu replié sous 48rem", async () => {
    // À côté du bouton du menu, l'engrenage faisait une seconde icône « plus d'options ».
    const { gear } = await panel("/portfolio/");

    expect(gear?.getAttribute("class")?.split(/\s+/)).toContain("max-md:hidden");
  });

  it("se retrouve au pied du menu replié, sous le même titre, après les liens", async () => {
    const { document } = await panel("/portfolio/");
    const menu = document.getElementById("nav-menu")!;
    const group = menu.querySelector('[role="group"]');
    const title = document.getElementById(group?.getAttribute("aria-labelledby") ?? "");
    const order = focusOrder(document);
    const lastLink = [...menu.querySelectorAll("a")].at(-1)!;

    expect(title?.textContent?.trim()).toBe("Affichage");
    expect(group?.querySelector("[data-theme-toggle]")?.textContent?.trim()).toBe("Thème clair");
    expect(group?.querySelector("[data-shine-toggle]")?.textContent?.trim()).toBe("Animer les titres");
    expect(group?.querySelector("[data-glyph-toggle]")?.textContent?.trim()).toBe("Animer le fond");
    expect(order.indexOf(group!.querySelector("button")!)).toBe(order.indexOf(lastLink) + 1);
  });

  it("part avec le thème clair relâché : le sombre est le thème par défaut", async () => {
    const { target } = await panel("/portfolio/");

    expect(target?.querySelector("[data-theme-toggle]")?.getAttribute("aria-pressed")).toBe("false");
  });
});
