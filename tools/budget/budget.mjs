/**
 * Le budget de performance du site construit : des plafonds sur ce que le
 * visiteur télécharge, vérifiés en CI après le build (voir check.mjs). Les
 * gains de performance ne s'érodent ainsi pas sans qu'on le voie : un script
 * qui grossit, une feuille de style qui enfle ou une image réexportée sans
 * compression font échouer le déploiement.
 *
 * Les tailles compressées sont mesurées en gzip niveau 9, une estimation
 * proche de ce que sert GitHub Pages.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * Les plafonds, en octets, avec une marge de 15 à 20 % sur les tailles du
 * jour (novembre 2026, entre parenthèses). Les relever est permis, mais dans
 * un commit qui dit pourquoi.
 */
export const LIMITS = {
  // Tout le JavaScript du site, toutes pages confondues (57,5 Ko, 25,2 Ko gzip).
  js: 70 * 1024,
  jsGzip: 30 * 1024,
  // La feuille de style, la même pour toutes les pages (13,8 Ko gzip).
  cssGzip: 17 * 1024,
  // La page HTML la plus lourde, l'accueil (27,8 Ko gzip).
  htmlGzip: 34 * 1024,
  // La plus grosse image servie aux visiteurs : la matière du fond (417 Ko,
  // 5,2 Mo avant son passage en WebP q80).
  image: 500 * 1024,
};

/** Les images que les pages affichent ; les JPEG sont les cartes d'aperçu, lues par LinkedIn. */
const VISITOR_IMAGE = /\.(webp|avif|png|svg|gif)$/i;

/** Les fichiers d'un dossier, sous-dossiers compris. */
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const gzip = (path) => gzipSync(readFileSync(path), { level: 9 }).length;

/** Le plus gros fichier d'une liste selon `size`, avec sa taille. */
function largest(paths, size, root) {
  let best = { file: "", bytes: 0 };
  for (const path of paths) {
    const bytes = size(path);
    if (bytes > best.bytes) best = { file: relative(root, path), bytes };
  }
  return best;
}

/** Mesure un site construit (`dist/`). */
export function measure(dist) {
  const all = files(dist);
  const assets = all.filter((path) => relative(dist, path).startsWith("_astro"));
  const js = assets.filter((path) => path.endsWith(".js"));
  const css = assets.filter((path) => path.endsWith(".css"));
  const sum = (paths, size) => paths.reduce((total, path) => total + size(path), 0);
  const raw = (path) => statSync(path).size;

  return {
    js: sum(js, raw),
    jsGzip: sum(js, gzip),
    cssGzip: sum(css, gzip),
    htmlGzip: largest(all.filter((path) => path.endsWith(".html")), gzip, dist),
    image: largest(assets.filter((path) => VISITOR_IMAGE.test(path)), raw, dist),
  };
}

/** Compare les mesures aux plafonds, une ligne par poste. */
export function check(measures, limits = LIMITS) {
  return Object.entries(limits).map(([key, limit]) => {
    const value = measures[key];
    const bytes = typeof value === "number" ? value : value.bytes;
    const file = typeof value === "number" ? undefined : value.file;
    return { key, bytes, limit, file, ok: bytes <= limit };
  });
}

const LABELS = {
  js: "JavaScript",
  jsGzip: "JavaScript (gzip)",
  cssGzip: "CSS (gzip)",
  htmlGzip: "Page HTML la plus lourde (gzip)",
  image: "Plus grosse image",
};

const kb = (bytes) => `${(bytes / 1024).toFixed(1).replace(".", ",")} Ko`;

/** Le rapport lisible, une ligne par poste. */
export function report(results) {
  return results
    .map(({ key, bytes, limit, file, ok }) => {
      const where = file ? ` (${file.replaceAll("\\", "/")})` : "";
      return `${ok ? "ok  " : "KO  "}${LABELS[key] ?? key} : ${kb(bytes)} / ${kb(limit)}${where}`;
    })
    .join("\n");
}
