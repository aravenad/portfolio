import { beforeEach, describe, expect, it, vi } from "vitest";

import { getLang, localized, localizedUrl, switchLangPath } from "../../src/lib/i18n";

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

describe("getLang", () => {
  it("lit le français à la racine du site", () => {
    expect(getLang("/portfolio/")).toBe("fr");
    expect(getLang("/portfolio/projects/mon-projet")).toBe("fr");
  });

  it("lit l'anglais sous /en, barre finale ou non", () => {
    expect(getLang("/portfolio/en")).toBe("en");
    expect(getLang("/portfolio/en/")).toBe("en");
    expect(getLang("/portfolio/en/projects/page/2")).toBe("en");
  });

  it("ne confond pas un chemin qui commence seulement par « en »", () => {
    // Une fiche nommée « entreprise » ne doit pas basculer la page en anglais.
    expect(getLang("/portfolio/projects/entreprise")).toBe("fr");
    expect(getLang("/portfolio/entreprise")).toBe("fr");
  });

  it("fonctionne aussi sur un site publié à la racine", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getLang("/en/projects")).toBe("en");
    expect(getLang("/projects")).toBe("fr");
  });
});

describe("localizedUrl", () => {
  it("laisse le français sans préfixe", () => {
    expect(localizedUrl("/projects", "fr")).toBe("/portfolio/projects");
    expect(localizedUrl("/", "fr")).toBe("/portfolio/");
  });

  it("préfixe l'anglais, ancres de l'accueil comprises", () => {
    expect(localizedUrl("/projects", "en")).toBe("/portfolio/en/projects");
    expect(localizedUrl("/", "en")).toBe("/portfolio/en/");
    expect(localizedUrl("/#contact", "en")).toBe("/portfolio/en/#contact");
  });

  it("accepte un chemin sans barre initiale", () => {
    expect(localizedUrl("projects", "en")).toBe("/portfolio/en/projects");
  });
});

describe("switchLangPath", () => {
  it("mène à la même page dans l'autre langue", () => {
    expect(switchLangPath("/portfolio/projects/page/2", "en")).toBe("/portfolio/en/projects/page/2");
    expect(switchLangPath("/portfolio/en/projects/page/2", "fr")).toBe("/portfolio/projects/page/2");
  });

  it("relie les deux accueils", () => {
    expect(switchLangPath("/portfolio/", "en")).toBe("/portfolio/en/");
    expect(switchLangPath("/portfolio/en/", "fr")).toBe("/portfolio/");
    expect(switchLangPath("/portfolio/en", "fr")).toBe("/portfolio/");
  });

  it("rend la page elle-même quand la langue ne change pas", () => {
    expect(switchLangPath("/portfolio/en/projects", "en")).toBe("/portfolio/en/projects");
    expect(switchLangPath("/portfolio/projects", "fr")).toBe("/portfolio/projects");
  });
});

describe("localized", () => {
  it("choisit la valeur de la langue demandée", () => {
    const values = { fr: "Bonjour", en: "Hello" };

    expect(localized("fr", values)).toBe("Bonjour");
    expect(localized("en", values)).toBe("Hello");
  });
});
