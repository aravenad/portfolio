/**
 * Préfixe un chemin interne par la base du site.
 *
 * Le site est publié dans un sous-dossier (`/portfolio/` sur GitHub Pages) :
 * sans ce préfixe, tous les liens absolus pointeraient vers la racine du
 * domaine. Les ancres seules (`#contact`) n'ont pas besoin d'être préfixées.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
