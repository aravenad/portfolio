import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { education } from "../../src/data/career";
import { site } from "../../src/data/site";
import { personSchema, toJsonLd } from "../../src/lib/structured-data";

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

describe("toJsonLd", () => {
  it("ne laisse aucun « < » qui refermerait la balise", () => {
    const json = toJsonLd({ name: "</script><b>" });

    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><b>");
  });
});
