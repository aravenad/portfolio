import { afterEach, describe, expect, it, vi } from "vitest";

import { url } from "../../src/lib/url";

/**
 * `url()` lit `BASE_URL` à chaque appel. Les tests la forcent à « /portfolio/ »,
 * la valeur de production : c'est le seul cas où la fonction fait quelque chose,
 * et c'est celui qu'un déploiement casserait sans qu'on le voie en local.
 */
function withBase(base: string) {
  vi.stubEnv("BASE_URL", base);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("url", () => {
  it("préfixe un chemin absolu par la base", () => {
    withBase("/portfolio/");
    expect(url("/projects")).toBe("/portfolio/projects");
  });

  it("préfixe aussi un chemin sans barre initiale", () => {
    withBase("/portfolio/");
    expect(url("projects")).toBe("/portfolio/projects");
  });

  it("ne double jamais la barre entre la base et le chemin", () => {
    withBase("/portfolio/");
    expect(url("/")).toBe("/portfolio/");
    expect(url("/projects")).not.toContain("//");
  });

  it("reste transparent quand le site est publié à la racine", () => {
    withBase("/");
    expect(url("/projects")).toBe("/projects");
    expect(url("/")).toBe("/");
  });

  it("conserve l'ancre et la requête", () => {
    withBase("/portfolio/");
    expect(url("/#contact")).toBe("/portfolio/#contact");
    expect(url("/projects/page/2")).toBe("/portfolio/projects/page/2");
  });
});
