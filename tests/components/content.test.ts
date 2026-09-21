import { beforeEach, describe, expect, it, vi } from "vitest";

import CareerItem from "../../src/components/ui/CareerItem.astro";
import ProjectCard from "../../src/components/ProjectCard.astro";
import SkillList from "../../src/components/ui/SkillList.astro";
import SkillTile from "../../src/components/ui/SkillTile.astro";
import { technicalSkills } from "../../src/data/skills";
import { render } from "../helpers/render";

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("SkillTile", () => {
  it("rend le logo demandé", async () => {
    const { body } = await render(SkillTile, {
      props: { skill: { label: "Java", icon: "java" } },
    });

    expect(body.querySelector("svg")?.getAttribute("data-icon")).toBe("java");
  });

  it("se rabat sur l'abréviation sans icône", async () => {
    const { body } = await render(SkillTile, {
      props: { skill: { label: "PostgreSQL", short: "PSQL" } },
    });

    expect(body.querySelector("svg")).toBeNull();
    expect(body.textContent).toContain("PSQL");
  });

  it("se rabat sur le libellé sans icône ni abréviation", async () => {
    const { body } = await render(SkillTile, { props: { skill: { label: "SQL" } } });
    expect(body.textContent?.trim()).toContain("SQL");
  });

  it("ne répète pas le libellé quand la tuile n'affiche que lui", async () => {
    const { body } = await render(SkillTile, { props: { skill: { label: "SQL" } } });
    expect(body.textContent?.match(/SQL/g)).toHaveLength(1);
  });

  it("transporte les couleurs de marque en variables CSS", async () => {
    const { body } = await render(SkillTile, {
      props: { skill: { label: "Java", icon: "java", color: "#007396", color2: "#ED8B00" } },
    });
    const style = body.firstElementChild?.getAttribute("style") ?? "";

    expect(style).toContain("--skill-color: #007396");
    expect(style).toContain("--skill-color-2: #ED8B00");
  });

  it("n'écrit aucun style sur une tuile sans couleur", async () => {
    // Un `style=""` vide sur chaque tuile sans marque serait du bruit dans le
    // HTML livré.
    const { body } = await render(SkillTile, {
      props: { skill: { label: "SQL", icon: "database" } },
    });

    expect(body.firstElementChild?.hasAttribute("style")).toBe(false);
  });

  it("ne teinte rien au repos : la couleur est réservée au survol", async () => {
    // Le logo doit rester zinc-100 tant que la souris n'est pas dessus, sinon la
    // grille devient un patchwork.
    const { body } = await render(SkillTile, {
      props: { skill: { label: "Java", icon: "java", color: "#007396" } },
    });
    const icon = body.querySelector(".skill-icon");

    expect(icon?.getAttribute("class")).toContain("text-zinc-100");
    expect(icon?.getAttribute("style") ?? "").not.toContain("#007396");
  });

  it("marque les logos au trait pour la correction de poids optique", async () => {
    const line = await render(SkillTile, {
      props: { skill: { label: "Java", icon: "java", lineArt: true } },
    });
    const solid = await render(SkillTile, {
      props: { skill: { label: "Git", icon: "simple-icons:git" } },
    });

    expect(line.body.querySelector(".skill-icon-line")).toBeTruthy();
    expect(solid.body.querySelector(".skill-icon-line")).toBeNull();
  });

  it("donne une infobulle à chaque tuile", async () => {
    const { body } = await render(SkillTile, {
      props: { skill: { label: "Java", icon: "java" } },
    });

    expect(body.firstElementChild?.getAttribute("title")).toBe("Java");
  });

  it("rend toutes les compétences réelles sans lever d'erreur", async () => {
    // Fait échouer les tests plutôt que le build si une icône disparaît du jeu.
    for (const skill of technicalSkills) {
      const { body } = await render(SkillTile, { props: { skill } });
      expect(body.textContent, skill.label).toContain(skill.label);
    }
  });
});

describe("SkillList", () => {
  it("liste chaque compétence avec sa précision", async () => {
    const { body } = await render(SkillList, {
      props: { skills: [{ label: "Anglais", detail: "Niveau B2" }] },
    });

    expect(body.querySelectorAll("li")).toHaveLength(1);
    expect(body.textContent).toContain("Anglais");
    expect(body.textContent).toContain("Niveau B2");
  });

  it("se passe de précision quand il n'y en a pas", async () => {
    const { body } = await render(SkillList, { props: { skills: [{ label: "Autonomie" }] } });
    expect(body.querySelector("li")?.querySelectorAll("span")).toHaveLength(2);
  });

  it("cache la puce décorative aux lecteurs d'écran", async () => {
    const { body } = await render(SkillList, { props: { skills: [{ label: "Autonomie" }] } });
    expect(body.querySelector("[aria-hidden='true']")).toBeTruthy();
  });

  it("rend une liste vide sans casser", async () => {
    const { body } = await render(SkillList, { props: { skills: [] } });
    expect(body.querySelectorAll("li")).toHaveLength(0);
  });
});

describe("CareerItem", () => {
  const base = { organization: "Horizon Groupe", period: "Juillet 2025 – juin 2026" };

  it("titre l'entrée par son intitulé et fait de l'organisation un sous-titre", async () => {
    const { body } = await render(CareerItem, {
      props: { entry: { ...base, title: "Technicien informatique" } },
    });

    expect(body.querySelector("h3")?.textContent?.trim()).toBe("Technicien informatique");
    expect(body.textContent).toContain("Horizon Groupe");
  });

  it("promeut l'organisation en titre quand l'entrée n'a pas d'intitulé", async () => {
    const { body } = await render(CareerItem, { props: { entry: base } });
    expect(body.querySelector("h3")?.textContent?.trim()).toBe("Horizon Groupe");
  });

  it("préfère le logo à l'icône et l'icône aux initiales", async () => {
    const logo = await render(CareerItem, {
      props: { entry: { ...base, logo: "/logos/a.svg", icon: "simple-icons:git", initials: "HG" } },
    });
    const icon = await render(CareerItem, {
      props: { entry: { ...base, icon: "simple-icons:git", initials: "HG" } },
    });
    const initials = await render(CareerItem, { props: { entry: { ...base, initials: "HG" } } });

    expect(logo.body.querySelector("img")?.getAttribute("src")).toBe("/logos/a.svg");
    expect(icon.body.querySelector("svg")).toBeTruthy();
    expect(icon.body.querySelector("img")).toBeNull();
    expect(initials.body.textContent).toContain("HG");
  });

  it("laisse le logo hors de l'arbre d'accessibilité", async () => {
    // Le nom de l'organisation est déjà dans le titre : le répéter sur l'image
    // le ferait annoncer deux fois.
    const { body } = await render(CareerItem, {
      props: { entry: { ...base, logo: "/logos/a.svg" } },
    });

    expect(body.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("affiche la période telle qu'elle est écrite dans les données", async () => {
    const { body } = await render(CareerItem, { props: { entry: base } });
    expect(body.textContent).toContain(base.period);
  });

  it("déroule les postes successifs dans l'ordre reçu", async () => {
    const { body } = await render(CareerItem, {
      props: {
        entry: {
          ...base,
          roles: [
            { title: "Technicien informatique", contract: "CDI", period: "Mai – juin 2026" },
            { title: "Technicien diagnostic", period: "Janvier – mai 2026" },
          ],
        },
      },
    });
    const roles = [...body.querySelectorAll("ol li")].map((li) =>
      li.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim(),
    );

    // Le contrat est collé au titre dans le texte : c'est `ml-2` qui les sépare
    // à l'écran, pas une espace.
    expect(roles).toEqual(["Technicien informatiqueCDI", "Technicien diagnostic"]);
  });

  it("n'ouvre pas de liste quand il n'y a qu'un poste implicite", async () => {
    const { body } = await render(CareerItem, { props: { entry: base } });
    expect(body.querySelector("ol")).toBeNull();
  });

  it("omet ce qui n'est pas renseigné", async () => {
    const { body } = await render(CareerItem, { props: { entry: base } });
    const text = body.textContent?.replace(/\s+/g, " ") ?? "";

    expect(text).not.toContain("undefined");
    expect(text).not.toContain("·");
  });

  it("sépare l'organisation du lieu par un point médian", async () => {
    const { body } = await render(CareerItem, {
      props: { entry: { ...base, title: "Technicien", location: "Villard-Bonnot" } },
    });

    expect(body.textContent?.replace(/\s+/g, " ")).toContain("Horizon Groupe · Villard-Bonnot");
  });
});

describe("ProjectCard", () => {
  /** Une entrée de collection réduite à ce que la carte lit. */
  const project = (data: Record<string, unknown> = {}) => ({
    id: "mon-projet",
    data: {
      title: "Mon projet",
      summary: "Une phrase de résumé.",
      tags: ["Java", "SQL"],
      status: "termine",
      order: 1,
      featured: false,
      ...data,
    },
  });

  it("mène à la fiche du projet, base comprise", async () => {
    const { body } = await render(ProjectCard, { props: { project: project() } });
    expect(body.querySelector("a")?.getAttribute("href")).toBe("/portfolio/projects/mon-projet");
  });

  it("affiche le titre et le résumé", async () => {
    const { body } = await render(ProjectCard, { props: { project: project() } });

    expect(body.querySelector("h3")?.textContent?.trim()).toBe("Mon projet");
    expect(body.textContent).toContain("Une phrase de résumé.");
  });

  it("montre les étiquettes par défaut et les masque sur l'aperçu de l'accueil", async () => {
    const avec = await render(ProjectCard, { props: { project: project() } });
    const sans = await render(ProjectCard, {
      props: { project: project(), showTags: false },
    });

    expect(avec.body.textContent).toContain("Java");
    expect(sans.body.textContent).not.toContain("Java");
  });

  it("n'ouvre pas de rangée d'étiquettes quand il n'y en a aucune", async () => {
    const { body } = await render(ProjectCard, { props: { project: project({ tags: [] }) } });
    expect(body.querySelector(".flex-wrap")).toBeNull();
  });

  it("traduit le statut", async () => {
    for (const [status, label] of [
      ["termine", "Terminé"],
      ["en-cours", "En cours"],
      ["a-venir", "À venir"],
    ]) {
      const { body } = await render(ProjectCard, { props: { project: project({ status }) } });
      expect(body.textContent, status).toContain(label);
    }
  });

  it("distingue visuellement un projet en cours", async () => {
    const encours = await render(ProjectCard, { props: { project: project({ status: "en-cours" }) } });
    const termine = await render(ProjectCard, { props: { project: project() } });

    expect(encours.html).toContain("text-accent/80");
    expect(termine.html).not.toContain("text-accent/80");
  });
});
