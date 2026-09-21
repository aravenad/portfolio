import { beforeEach, describe, expect, it, vi } from "vitest";

import Arrow from "../../src/components/ui/Arrow.astro";
import BackToTop from "../../src/components/ui/BackToTop.astro";
import Badge from "../../src/components/ui/Badge.astro";
import Breadcrumb from "../../src/components/ui/Breadcrumb.astro";
import Button from "../../src/components/ui/Button.astro";
import Card from "../../src/components/ui/Card.astro";
import Container from "../../src/components/ui/Container.astro";
import Footer from "../../src/components/layout/Footer.astro";
import Section from "../../src/components/ui/Section.astro";
import SectionHeading from "../../src/components/ui/SectionHeading.astro";
import TableOfContents from "../../src/components/ui/TableOfContents.astro";
import { socialLinks } from "../../src/data/site";
import { render } from "../helpers/render";

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("Button", () => {
  it("rend un lien quand une destination est donnée", async () => {
    const { body } = await render(Button, {
      props: { href: "/contact" },
      slots: { default: "Écrire" },
    });

    expect(body.querySelector("a")?.getAttribute("href")).toBe("/contact");
    expect(body.querySelector("button")).toBeNull();
  });

  it("rend un bouton sans destination", async () => {
    const { body } = await render(Button, { slots: { default: "Envoyer" } });

    expect(body.querySelector("button")).toBeTruthy();
    expect(body.querySelector("a")).toBeNull();
  });

  it("distingue les deux variantes", async () => {
    const primary = await render(Button, { slots: { default: "A" } });
    const secondary = await render(Button, {
      props: { variant: "secondary" },
      slots: { default: "A" },
    });

    expect(primary.html).not.toBe(secondary.html);
  });

  it("laisse passer les attributs supplémentaires", async () => {
    // `rel="noreferrer"` sur les liens sortants en dépend.
    const { body } = await render(Button, {
      props: { href: "https://example.com", rel: "noreferrer", "aria-label": "Sortir" },
      slots: { default: "Sortir" },
    });

    expect(body.querySelector("a")?.getAttribute("rel")).toBe("noreferrer");
    expect(body.querySelector("a")?.getAttribute("aria-label")).toBe("Sortir");
  });

  it("ajoute les classes reçues sans perdre les siennes", async () => {
    const { body } = await render(Button, {
      props: { class: "w-full" },
      slots: { default: "A" },
    });
    const classes = body.querySelector("button")?.getAttribute("class") ?? "";

    expect(classes).toContain("w-full");
    expect(classes).toContain("inline-flex");
  });
});

describe("Card", () => {
  it("devient cliquable avec une destination", async () => {
    const { body } = await render(Card, {
      props: { href: "/projects/a" },
      slots: { default: "contenu" },
    });

    expect(body.querySelector("a")?.getAttribute("href")).toBe("/projects/a");
  });

  it("reste un bloc inerte sans destination", async () => {
    const { body } = await render(Card, { slots: { default: "contenu" } });

    expect(body.querySelector("a")).toBeNull();
    expect(body.querySelector("div")).toBeTruthy();
  });

  it("s'annonce comme un bloc à révéler au défilement", async () => {
    const { body } = await render(Card, { slots: { default: "contenu" } });
    expect(body.firstElementChild?.getAttribute("class")).toContain("reveal");
  });
});

describe("Badge", () => {
  it("rend son contenu dans un span", async () => {
    const { body } = await render(Badge, { slots: { default: "Java" } });
    expect(body.querySelector("span")?.textContent?.trim()).toBe("Java");
  });
});

describe("Container", () => {
  it("borne la largeur du contenu", async () => {
    const { body } = await render(Container, { slots: { default: "x" } });
    expect(body.firstElementChild?.getAttribute("class")).toContain("max-w-6xl");
  });
});

describe("Section", () => {
  it("porte l'ancre visée par la navigation", async () => {
    const { body } = await render(Section, {
      props: { id: "skills" },
      slots: { default: "x" },
    });

    expect(body.querySelector("section")?.getAttribute("id")).toBe("skills");
  });

  it("dégage la hauteur du header sur l'ancre", async () => {
    // Sans `scroll-mt`, une ancre place le titre sous la barre collante.
    const { body } = await render(Section, { props: { id: "a" }, slots: { default: "x" } });
    expect(body.querySelector("section")?.getAttribute("class")).toContain("scroll-mt-16");
  });

  it("relaie aria-labelledby", async () => {
    const { body } = await render(Section, {
      props: { id: "a", "aria-labelledby": "a-title" },
      slots: { default: "x" },
    });

    expect(body.querySelector("section")?.getAttribute("aria-labelledby")).toBe("a-title");
  });
});

describe("SectionHeading", () => {
  it("rend un h2 par défaut et un h1 sur demande", async () => {
    const two = await render(SectionHeading, { props: { title: "Mes projets" } });
    const one = await render(SectionHeading, { props: { title: "Mes projets", as: "h1" } });

    expect(two.body.querySelector("h2")).toBeTruthy();
    expect(one.body.querySelector("h1")).toBeTruthy();
  });

  it("chrome le dernier mot, et lui seul", async () => {
    const { body } = await render(SectionHeading, {
      props: { title: "Compétences techniques", chrome: true },
    });

    expect(body.querySelector(".text-chrome")?.textContent?.trim()).toBe("techniques");
    expect(body.querySelector("h2")?.textContent?.replace(/\s+/g, " ").trim())
      .toBe("Compétences techniques");
  });

  it("chrome un titre d'un seul mot en entier", async () => {
    const { body } = await render(SectionHeading, { props: { title: "Projets", chrome: true } });
    expect(body.querySelector(".text-chrome")?.textContent?.trim()).toBe("Projets");
  });

  it("laisse le titre nu sans `chrome`", async () => {
    const { body } = await render(SectionHeading, { props: { title: "Mes projets" } });
    expect(body.querySelector(".text-chrome")).toBeNull();
  });

  it("pose l'id demandé sur le titre, pas sur son conteneur", async () => {
    const { body } = await render(SectionHeading, {
      props: { title: "Contact", headingId: "contact-title" },
    });

    expect(body.querySelector("h2")?.getAttribute("id")).toBe("contact-title");
  });

  it("n'affiche un paragraphe que s'il y a une description", async () => {
    const sans = await render(SectionHeading, { props: { title: "Contact" } });
    const avec = await render(SectionHeading, {
      props: { title: "Contact", description: "Une phrase." },
    });

    expect(sans.body.querySelector("p")).toBeNull();
    expect(avec.body.querySelector("p")?.textContent?.trim()).toBe("Une phrase.");
  });
});

describe("Arrow", () => {
  it("est décorative", async () => {
    const { body } = await render(Arrow);
    expect(body.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("tourne selon la direction demandée", async () => {
    const right = await render(Arrow);
    const left = await render(Arrow, { props: { direction: "left" } });
    const up = await render(Arrow, { props: { direction: "up" } });

    expect(right.html).not.toContain("rotate-180");
    expect(left.html).toContain("rotate-180");
    expect(up.html).toContain("-rotate-90");
  });
});

describe("BackToTop", () => {
  it("part invisible et se nomme pour les lecteurs d'écran", async () => {
    const { body } = await render(BackToTop);
    const button = body.querySelector("[data-back-to-top]");

    expect(button?.getAttribute("aria-label")).toBeTruthy();
    expect(button?.getAttribute("class")).toContain("invisible");
    expect(button?.hasAttribute("data-visible")).toBe(false);
  });
});

describe("Breadcrumb", () => {
  it("ouvre toujours le fil par l'accueil", async () => {
    const { body } = await render(Breadcrumb, { props: { items: [{ label: "Projets" }] } });
    const first = body.querySelector("li a");

    expect(first?.textContent?.trim()).toBe("Accueil");
    expect(first?.getAttribute("href")).toBe("/portfolio/");
  });

  it("préfixe chaque niveau par la base du site", async () => {
    const { body } = await render(Breadcrumb, {
      props: { items: [{ label: "Projets", href: "/projects" }, { label: "Un projet" }] },
    });

    for (const link of body.querySelectorAll("a")) {
      expect(link.getAttribute("href")).toMatch(/^\/portfolio\//);
    }
  });

  it("laisse le dernier niveau sans lien et le marque comme page courante", async () => {
    const { body } = await render(Breadcrumb, {
      props: { items: [{ label: "Projets", href: "/projects" }, { label: "Un projet" }] },
    });
    const last = body.querySelectorAll("li")[2];

    expect(last.querySelector("a")).toBeNull();
    expect(last.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe("Un projet");
  });

  it("se nomme pour les lecteurs d'écran", async () => {
    const { body } = await render(Breadcrumb, { props: { items: [{ label: "Projets" }] } });
    expect(body.querySelector("nav")?.getAttribute("aria-label")).toBeTruthy();
  });

  it("cache les chevrons de séparation", async () => {
    const { body } = await render(Breadcrumb, {
      props: { items: [{ label: "Projets", href: "/projects" }, { label: "Un projet" }] },
    });

    for (const svg of body.querySelectorAll("svg")) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });
});

describe("Footer", () => {
  it("reprend tous les liens sociaux", async () => {
    const { body } = await render(Footer);
    const hrefs = [...body.querySelectorAll("ul a")].map((a) => a.getAttribute("href"));

    expect(hrefs).toEqual(socialLinks.map((link) => link.href));
  });

  it("coupe le référent sur les liens sortants, et sur eux seuls", async () => {
    const { body } = await render(Footer);

    for (const link of body.querySelectorAll("ul a")) {
      const href = link.getAttribute("href") ?? "";
      expect(link.getAttribute("rel"), href).toBe(href.startsWith("http") ? "noreferrer" : null);
    }
  });

  it("affiche l'année en cours", async () => {
    const { body } = await render(Footer);
    expect(body.textContent).toContain(String(new Date().getFullYear()));
  });

  it("survit à la navigation client", async () => {
    const { body } = await render(Footer);
    expect(body.querySelector("footer")?.hasAttribute("data-astro-transition-persist")).toBe(true);
  });
});

describe("TableOfContents", () => {
  /** Les titres qu'Astro renverrait pour une fiche complète. */
  const headings = [
    { depth: 1, slug: "fiche", text: "Titre de la fiche" },
    { depth: 2, slug: "contexte", text: "Contexte" },
    { depth: 3, slug: "phase-1", text: "Phase 1" },
    { depth: 4, slug: "note", text: "Note" },
    { depth: 2, slug: "resultats", text: "Résultats" },
  ];

  /** Les libellés d'une des deux formes du sommaire. */
  const labels = (body: HTMLElement, form: "compact" | "sidebar") =>
    [...body.querySelectorAll(`[data-toc="${form}"] [data-toc-link]`)].map((link) =>
      link.textContent?.trim(),
    );

  it("reprend les titres du corps, dans l'ordre", async () => {
    const { body } = await render(TableOfContents, { props: { headings } });

    expect(labels(body, "sidebar")).toEqual(["Contexte", "Phase 1", "Résultats"]);
  });

  it("dit la même chose sous les deux formes", async () => {
    // Elles ne sont jamais visibles ensemble : une divergence donnerait deux
    // sommaires différents selon la largeur de l'écran, sans que rien ne le
    // signale. C'est ce que le `TocList` partagé doit rendre impossible.
    const { body } = await render(TableOfContents, { props: { headings } });

    expect(labels(body, "compact")).toEqual(labels(body, "sidebar"));
  });

  it("pointe sur les ancres du document, sans préfixe de base", async () => {
    // Ce sont des ancres dans la page courante : `url()` y ajouterait
    // « /portfolio/ » et ferait sortir de la fiche.
    const { body } = await render(TableOfContents, { props: { headings } });
    const hrefs = [
      ...body.querySelectorAll('[data-toc="sidebar"] [data-toc-link]'),
    ].map((link) => link.getAttribute("href"));

    expect(hrefs).toEqual(["#contexte", "#phase-1", "#resultats"]);
  });

  it("décale les sous-titres sous leur section", async () => {
    const { body } = await render(TableOfContents, { props: { headings } });
    const [contexte, phase] = [
      ...body.querySelectorAll('[data-toc="sidebar"] [data-toc-link]'),
    ];

    expect(contexte.getAttribute("class")).toContain("pl-4");
    expect(phase.getAttribute("class")).toContain("pl-8");
  });

  it("nomme chaque forme pour les lecteurs d'écran", async () => {
    const { body } = await render(TableOfContents, { props: { headings } });
    const compact = body.querySelector('[data-toc="compact"]')!;
    const sidebar = body.querySelector('[data-toc="sidebar"]')!;
    const label = body.querySelector(`#${sidebar.getAttribute("aria-labelledby")}`);

    expect(compact.getAttribute("aria-label")).toBe("Sur cette page");
    expect(label?.textContent?.trim()).toBe("Sur cette page");
  });

  it("n'expose qu'une forme à la fois", async () => {
    // Les deux sont dans le document : sans ces bascules, un lecteur d'écran
    // rencontrerait deux sommaires et le mot « Sommaire » s'afficherait en
    // double.
    const { body } = await render(TableOfContents, { props: { headings } });

    expect(body.querySelector('[data-toc="compact"]')?.getAttribute("class")).toContain(
      "lg:hidden",
    );

    const sidebar = body.querySelector('[data-toc="sidebar"]')?.getAttribute("class") ?? "";
    expect(sidebar).toContain("hidden");
    expect(sidebar).toContain("lg:block");
  });

  it("arrive replié sur les petits écrans", async () => {
    // Huit entrées dépliées repousseraient le premier paragraphe sous la ligne
    // de flottaison — c'est tout l'objet de cette forme.
    const { body } = await render(TableOfContents, { props: { headings } });
    const details = body.querySelector("details")!;

    expect(details.hasAttribute("open")).toBe(false);
    expect(details.querySelector("summary")?.textContent?.trim()).toContain(
      "Sur cette page",
    );
  });

  it("ne s'affiche pas avec une seule entrée", async () => {
    // Un sommaire d'un seul lien n'offre aucun choix et répète le titre de la
    // fiche, affiché juste au-dessus.
    const { body } = await render(TableOfContents, {
      props: { headings: [headings[0], headings[1]] },
    });

    expect(body.querySelector("[data-toc]")).toBeNull();
  });

  it("ne s'affiche pas sur une fiche sans titre", async () => {
    const { body } = await render(TableOfContents, { props: { headings: [] } });
    expect(body.querySelector("[data-toc]")).toBeNull();
  });

  it("ajoute les classes reçues sans perdre les siennes", async () => {
    const { body } = await render(TableOfContents, {
      props: { headings, class: "lg:col-start-2" },
    });

    expect(body.firstElementChild?.getAttribute("class")).toContain("lg:col-start-2");
  });

  it("ne pose aucun filet permanent le long de la liste", async () => {
    // Un filet continu ferait un cadre là où la page n'en a pas. La bordure
    // n'est là que pour le survol ; l'entrée courante est marquée par la
    // couleur du texte et par le curseur.
    const { body } = await render(TableOfContents, { props: { headings } });
    const classes = body
      .querySelector('[data-toc="sidebar"] [data-toc-link]')!
      .getAttribute("class")!;

    expect(classes).toContain("border-transparent");
    expect(classes).toContain("aria-[current]:text-accent");
  });

  it("donne son curseur à chaque forme, invisible tant que rien ne le place", async () => {
    // Le curseur est posé par le script. S'il n'arrive jamais, une hauteur nulle
    // le laisse invisible plutôt que collé en haut de la liste.
    const { body } = await render(TableOfContents, { props: { headings } });
    const cursors = [...body.querySelectorAll("[data-toc-cursor]")];

    expect(cursors).toHaveLength(2);

    for (const cursor of cursors) {
      expect(cursor.getAttribute("style")).toContain("height: 0");
      expect(cursor.getAttribute("aria-hidden")).toBe("true");
      expect(cursor.closest("[data-toc-list]")).toBeTruthy();
    }
  });

  it("garde de quoi coller", async () => {
    // Assertion sur une classe, à contrecœur, parce que la panne est muette :
    // étiré sur la hauteur de sa cellule de grille — l'alignement par défaut —
    // le sommaire n'a aucune course et ne colle jamais, sans que rien ne bouge
    // à l'écran. C'est exactement le bug qu'a eu la première version.
    const { body } = await render(TableOfContents, { props: { headings } });
    const classes = body.firstElementChild?.getAttribute("class") ?? "";

    expect(classes).toContain("lg:sticky");
    expect(classes).toContain("lg:self-start");
  });
});
