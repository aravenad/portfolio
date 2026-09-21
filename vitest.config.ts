/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

/**
 * `getViteConfig` réutilise la configuration Vite du projet : les tests voient
 * les mêmes alias, le même plugin Astro et le même Tailwind que le build. Sans
 * lui, un `import … from "*.astro"` échouerait dès le premier test de composant.
 */
export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Garde les modules transformés d'une exécution à l'autre : la compilation
    // des composants Astro représente les trois quarts du temps sinon.
    fsModuleCache: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Les composants .astro sont instrumentés comme le reste : le plugin
      // Astro les compile en JavaScript avant que v8 ne les mesure.
      include: ["src/**/*.{ts,astro}"],
      // `types` ne contient que des interfaces, `content.config` est un schéma
      // vérifié à part — dans tests/content.
      exclude: ["src/types/**", "src/content.config.ts", "src/env.d.ts"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
