import type { ImageMetadata } from "astro";
import type { Lang } from "./i18n";

/**
 * Les cartes d'aperçu des projets, une par fiche et par langue, rendues par
 * `npm run og` (tools/og-projects/) dans src/assets/og/<langue>/<fiche>.jpg.
 *
 * Importées plutôt que posées dans public/ : Vite leur donne une empreinte
 * dans leur nom, si bien qu'une carte refaite change d'URL et que LinkedIn,
 * qui garde ses aperçus par URL, la retélécharge. og-v5.png doit être
 * renommée à la main pour le même effet.
 */
const cards = import.meta.glob<ImageMetadata>("../assets/og/*/*.jpg", {
  eager: true,
  import: "default",
});

/** La carte d'une fiche, ou rien si elle n'a pas encore été rendue. */
export function projectCard(lang: Lang, id: string): ImageMetadata | undefined {
  return cards[`../assets/og/${lang}/${id}.jpg`];
}
