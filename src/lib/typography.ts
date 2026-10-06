import type { MdastPluginDefinition } from "satteri";

/**
 * Espace insécable (U+00A0). La même que celle des dates du parcours
 * (src/data/career.ts), pour que la police n'ait qu'une seule espace fixe à
 * dessiner.
 */
const NBSP = " ";

/**
 * La typographie française met une espace avant « ; : ? ! » et après « « »,
 * avant « » ». Une espace ordinaire laisse la ligne se couper là : sur un
 * écran étroit, le signe part seul en début de ligne (« respectifs / ; ils »).
 * Elle devient ici insécable, et le signe reste collé au mot qui le précède.
 *
 * Le texte s'écrit donc avec des espaces normales, dans les données comme dans
 * les fiches : c'est le build qui les fixe. Sans effet sur l'anglais, qui ne
 * met jamais d'espace devant ces signes.
 */
export function frenchSpacing(text: string): string {
  return text.replace(/ (?=[;:?!»])/g, NBSP).replace(/« /g, `«${NBSP}`);
}

/**
 * Applique `frenchSpacing` à toutes les chaînes d'une structure de données :
 * objets, tableaux, et textes à trous (fonctions), dont le résultat est corrigé
 * à chaque appel. Le reste (nombres, booléens) passe tel quel.
 */
export function withFrenchSpacing<T>(value: T): T {
  if (typeof value === "string") return frenchSpacing(value) as T;
  if (typeof value === "function") {
    const fn = value as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => withFrenchSpacing(fn(...args))) as T;
  }
  if (Array.isArray(value)) return value.map(withFrenchSpacing) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, withFrenchSpacing(child)]),
    ) as T;
  }
  return value;
}

/**
 * La même règle pour le corps Markdown des fiches, branchée dans
 * astro.config.mjs sur Sätteri, le moteur Markdown d'Astro 7. Seuls les nœuds
 * de texte sont touchés : le code (`inline` comme en bloc) et les URL des liens
 * restent intacts.
 */
export const satteriFrenchSpacing: MdastPluginDefinition = {
  name: "french-spacing",
  text(node, ctx) {
    const value = frenchSpacing(node.value);
    if (value !== node.value) ctx.setProperty(node, "value", value);
  },
};
