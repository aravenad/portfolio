import { existsSync } from "node:fs";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { publicCv } from "../../src/lib/cv";
import type { Lang } from "../../src/lib/i18n";

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/portfolio/");
});

const langs: Lang[] = ["fr", "en"];

describe("publicCv", () => {
  it.each(langs)("pointe vers un fichier présent dans public/ (%s)", (lang) => {
    // Un PDF renommé ou oublié donnerait un lien mort que le build ne signale pas.
    const file = publicCv(lang).href.replace(/^\/portfolio\//, "");
    expect(existsSync(join("public", file)), file).toBe(true);
  });

  it.each(langs)("ne sert que la version publique (%s)", (lang) => {
    expect(publicCv(lang).href).toMatch(/-public(-en)?\.pdf$/);
  });

  it("nomme le téléchargement dans la langue du site", () => {
    expect(publicCv("fr").filename).toBe("CV-Damien-Aravena-Bravo.pdf");
    expect(publicCv("en").filename).toBe("Resume-Damien-Aravena-Bravo.pdf");
  });
});
