import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:content", async () => (await import("../helpers/content")).contentModule);

import Career from "../../src/components/sections/Career.astro";
import Contact from "../../src/components/sections/Contact.astro";
import Hero from "../../src/components/sections/Hero.astro";
import ProjectsList from "../../src/components/sections/ProjectsList.astro";
import ProjectsPreview from "../../src/components/sections/ProjectsPreview.astro";
import Skills from "../../src/components/sections/Skills.astro";
import { education, experiences } from "../../src/data/career";
import { site } from "../../src/data/site";
import { softSkills, technicalSkills } from "../../src/data/skills";
import { fixtureProjects } from "../helpers/content";
import { render } from "../helpers/render";

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("Hero", () => {
  const props = { intro: "Bonjour, moi c'est", name: "Damien", description: "Une phrase." };

  it("porte l'unique h1 de l'accueil", async () => {
    const { body } = await render(Hero, { props });
    expect(body.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim())
      .toBe("Bonjour, moi c'est Damien.");
  });

  it("met le prénom en lettrage chromé", async () => {
    const { body } = await render(Hero, { props });
    expect(body.querySelector(".text-chrome")?.textContent?.trim()).toBe("Damien");
  });

  it("propose les deux appels à l'action de l'accueil", async () => {
    const { body } = await render(Hero, { props });
    const hrefs = [...body.querySelectorAll("a")].map((a) => a.getAttribute("href"));

    expect(hrefs).toEqual(["#projects", "#contact"]);
  });

  it("laisse les ancres locales sans préfixe de base", async () => {
    // Une ancre est résolue par le navigateur sur la page courante : la
    // préfixer la transformerait en lien vers l'accueil.
    const { body } = await render(Hero, { props });

    for (const link of body.querySelectorAll("a")) {
      expect(link.getAttribute("href")).toMatch(/^#/);
    }
  });
});

describe("Skills", () => {
  const base = { id: "skills", title: "Compétences techniques", skills: technicalSkills };

  it("rattache son titre à la section pour les lecteurs d'écran", async () => {
    const { body } = await render(Skills, { props: base, slots: { default: "<p>texte</p>" } });
    const section = body.querySelector("section")!;

    expect(section.getAttribute("id")).toBe("skills");
    expect(section.getAttribute("aria-labelledby")).toBe("skills-title");
    expect(body.querySelector("#skills-title")).toBeTruthy();
  });

  it("dessine une tuile par compétence en variante grille", async () => {
    const { body } = await render(Skills, { props: base, slots: { default: "<p>x</p>" } });
    expect(body.querySelectorAll(".skill-tile")).toHaveLength(technicalSkills.length);
  });

  it("passe en liste pour les compétences transversales", async () => {
    const { body } = await render(Skills, {
      props: { id: "soft-skills", title: "Compétences transversales", skills: softSkills, variant: "list" },
      slots: { default: "<p>x</p>" },
    });

    expect(body.querySelector(".skill-tile")).toBeNull();
    expect(body.querySelectorAll("li")).toHaveLength(softSkills.length);
  });

  it("inverse les colonnes sur demande", async () => {
    const normal = await render(Skills, { props: base, slots: { default: "<p>x</p>" } });
    const inverse = await render(Skills, {
      props: { ...base, reverse: true },
      slots: { default: "<p>x</p>" },
    });

    expect(normal.html).not.toContain("lg:order-1");
    expect(inverse.html).toContain("lg:order-1");
    expect(inverse.html).toContain("lg:order-2");
  });

  it("rend le texte d'introduction reçu", async () => {
    const { body } = await render(Skills, {
      props: base,
      slots: { default: "<p>Au fil de mes projets…</p>" },
    });

    expect(body.textContent).toContain("Au fil de mes projets…");
  });
});

describe("Career", () => {
  it("sépare expérience et formation", async () => {
    const { body } = await render(Career);
    const columns = [...body.querySelectorAll("h3")]
      .filter((node) => node.className.includes("uppercase"))
      .map((node) => node.textContent?.trim());

    expect(columns).toEqual(["Expérience", "Formation"]);
  });

  it("liste toutes les entrées des deux colonnes", async () => {
    const { body } = await render(Career);
    const lists = body.querySelectorAll("ul");

    expect(lists[0].children).toHaveLength(experiences.length);
    expect(lists[1].children).toHaveLength(education.length);
  });

  it("rattache son titre à la section", async () => {
    const { body } = await render(Career);
    const section = body.querySelector("section")!;

    expect(section.getAttribute("id")).toBe("career");
    expect(body.querySelector(`#${section.getAttribute("aria-labelledby")}`)).toBeTruthy();
  });
});

describe("Contact", () => {
  it("ouvre le client mail sur l'adresse du site", async () => {
    const { body } = await render(Contact);
    expect(body.querySelector('a[href^="mailto:"]')?.getAttribute("href"))
      .toBe(`mailto:${site.email}`);
  });

  it("coupe le référent vers GitHub", async () => {
    const { body } = await render(Contact);
    const github = body.querySelector(`a[href="${site.github}"]`);

    expect(github?.getAttribute("rel")).toBe("noreferrer");
  });

  it("rattache son titre à la section", async () => {
    const { body } = await render(Contact);
    expect(body.querySelector("section")?.getAttribute("id")).toBe("contact");
    expect(body.querySelector("#contact-title")).toBeTruthy();
  });

  it("propose le CV au téléchargement, préfixé par la base du site", async () => {
    // Sans `url()`, le lien viserait la racine du domaine et non /portfolio/.
    const { body } = await render(Contact);
    const cv = body.querySelector('a[href$=".pdf"]');

    expect(cv?.textContent?.trim()).toBe("Télécharger mon CV");
    expect(cv?.getAttribute("href")).toBe(
      "/portfolio/cv-damien-aravena-bravo-public.pdf",
    );
    expect(cv?.getAttribute("download")).toBe("CV-Damien-Aravena-Bravo.pdf");
  });

  it("ne sert que la version publique du CV", async () => {
    /*
     * Le kit produit aussi un CV complet, qui porte le téléphone et l'adresse
     * mail. Le dépôt est public et ce fichier est indexable : déposer l'autre à
     * sa place publierait des coordonnées que le site n'affiche nulle part.
     * Ce test ne peut pas lire le PDF, mais il verrouille le nom — et le nom
     * est ce qui distingue les deux.
     */
    const { body } = await render(Contact);
    const href = body.querySelector('a[href$=".pdf"]')?.getAttribute("href") ?? "";

    expect(href).toContain("-public.pdf");
  });
});

describe("ProjectsPreview", () => {
  it("n'affiche que les projets mis en avant, dans la limite de trois", async () => {
    const { body } = await render(ProjectsPreview);
    expect(body.querySelectorAll("h3")).toHaveLength(3);
  });

  it("renvoie vers la liste complète quand il reste des projets à voir", async () => {
    const { body } = await render(ProjectsPreview);
    expect(body.querySelector('a[href="/portfolio/projects"]')?.textContent)
      .toContain("Voir tous les projets");
  });
});

describe("ProjectsList", () => {
  const page = { projects: fixtureProjects.slice(0, 6), currentPage: 1, totalPages: 2 };

  it("porte le h1 de la page projets", async () => {
    const { body } = await render(ProjectsList, { props: page });
    expect(body.querySelectorAll("h1")).toHaveLength(1);
  });

  it("affiche une carte par projet de la page", async () => {
    const { body } = await render(ProjectsList, { props: page });
    expect(body.querySelectorAll("h3")).toHaveLength(6);
  });

  it("annonce la position dans la série", async () => {
    const { body } = await render(ProjectsList, { props: page });
    expect(body.textContent?.replace(/\s+/g, " ")).toContain("Page 1 sur 2");
  });

  it("cache la pagination quand tout tient sur une page", async () => {
    const { body } = await render(ProjectsList, {
      props: { projects: fixtureProjects.slice(0, 3), currentPage: 1, totalPages: 1 },
    });

    expect(body.querySelector("[data-pagination]")).toBeNull();
    expect(body.textContent).not.toContain("Page 1 sur 1");
  });
});
