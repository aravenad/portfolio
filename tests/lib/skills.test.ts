import { describe, expect, it } from "vitest";

import { brandStyle } from "../../src/lib/skills";

describe("brandStyle", () => {
  it("transporte chaque couleur fournie dans sa variable", () => {
    expect(brandStyle({ label: "Java", color: "#007396", color2: "#ED8B00" }))
      .toBe("--skill-color: #007396; --skill-color-2: #ED8B00");
    expect(brandStyle({ label: "GitHub", color: "#FFFFFF", colorLight: "#181717" }))
      .toBe("--skill-color: #FFFFFF; --skill-color-light: #181717");
  });

  it("ne pose rien sans couleur de marque", () => {
    // Un `style=""` vide resterait dans le HTML pour rien.
    expect(brandStyle({ label: "SQL", icon: "database" })).toBeUndefined();
  });
});
