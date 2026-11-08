/**
 * Vérifie le budget de performance du site construit : `npm run budget`, après
 * `npm run build`. Échoue si un poste dépasse son plafond (voir budget.mjs).
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { check, measure, report } from "./budget.mjs";

const dist = fileURLToPath(new URL("../../dist", import.meta.url));

if (!existsSync(dist)) {
  console.error("Pas de dist/ : lancer npm run build d'abord.");
  process.exit(1);
}

const results = check(measure(dist));
console.log(report(results));

if (results.some((result) => !result.ok)) {
  console.error("\nBudget de performance dépassé.");
  process.exit(1);
}
