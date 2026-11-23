import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { education } from "../../src/data/career";
import { site } from "../../src/data/site";
import {
  breadcrumbSchema,
  personSchema,
  projectSchema,
  toJsonLd,
} from "../../src/lib/structured-data";

const siteURL = new URL("https://damien-aravena.fr");

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("personSchema", () => {
  it("sépare le prénom du nom de famille", () => {
    const data = personSchema(siteURL, "Étudiant");

    expect(data.givenName).toBe("Damien");
    expect(data.familyName).toBe("Aravena Bravo");
    expect(`${data.givenName} ${data.familyName}`).toBe(site.author);
  });

  it("rattache la personne à ses études en cours", () => {
    const data = personSchema(siteURL, "Étudiant");

    expect(data.affiliation.name).toBe(education[0].organization);
    expect(data.address.addressLocality).toBe("Grenoble");
  });

  it("pointe vers l'accueil, base comprise", () => {
    const data = personSchema(siteURL, "Étudiant");

    expect(data.url).toBe("https://damien-aravena.fr/portfolio/");
    expect(data["@id"]).toBe("https://damien-aravena.fr/portfolio/#person");
  });
});

describe("breadcrumbSchema", () => {
  it("numérote les niveaux à partir de 1, de l'accueil à la page", () => {
    const data = breadcrumbSchema([
      { name: "Accueil", url: "https://damien-aravena.fr/" },
      { name: "Projets", url: "https://damien-aravena.fr/projects/" },
    ]);

    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement.map((item) => [item.position, item.name, item.item])).toEqual([
      [1, "Accueil", "https://damien-aravena.fr/"],
      [2, "Projets", "https://damien-aravena.fr/projects/"],
    ]);
  });
});

describe("projectSchema", () => {
  const facts = {
    url: "https://damien-aravena.fr/portfolio/projects/musigma/",
    title: "Musigma",
    summary: "Une application de gestion musicale.",
    tags: ["Java", "SQL"],
    year: 2025,
  };

  it("décrit le projet depuis sa fiche", () => {
    expect(projectSchema(siteURL, "fr", facts)).toMatchObject({
      "@type": "CreativeWork",
      "@id": `${facts.url}#project`,
      url: facts.url,
      name: "Musigma",
      description: facts.summary,
      inLanguage: "fr",
      dateCreated: "2025",
      keywords: "Java, SQL",
    });
  });

  it("en fait du code, lié à son dépôt, quand le dépôt est public", () => {
    const data = projectSchema(siteURL, "fr", { ...facts, repo: "https://github.com/aravenad/musigma" });

    expect(data["@type"]).toBe("SoftwareSourceCode");
    expect(data.codeRepository).toBe("https://github.com/aravenad/musigma");
  });

  it("l'attribue à la personne de l'accueil, par son identifiant", () => {
    const data = projectSchema(siteURL, "en", facts);

    expect(data.author["@id"]).toBe(personSchema(siteURL, "Student")["@id"]);
    expect(data.author.name).toBe(site.author);
  });

  it("tait ce que la fiche ne dit pas", () => {
    const data = projectSchema(siteURL, "fr", { ...facts, tags: [], year: undefined });

    expect(data).not.toHaveProperty("keywords");
    expect(data).not.toHaveProperty("dateCreated");
    expect(data).not.toHaveProperty("codeRepository");
    expect(data).not.toHaveProperty("image");
  });
});

describe("toJsonLd", () => {
  it("ne laisse aucun « < » qui refermerait la balise", () => {
    const json = toJsonLd({ name: "</script><b>" });

    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><b>");
  });
});
