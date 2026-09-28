/**
 * Préfixe un chemin interne par la base du site.
 *
 * Le site est aujourd'hui publié à la racine de son domaine, et la base vaut
 * « / » : le préfixe est vide. `url()` reste le seul chemin pour écrire un lien
 * interne, pour que le site puisse retourner dans un sous-dossier sans qu'on
 * cherche les liens un à un. Les ancres seules (`#contact`) n'ont pas besoin
 * d'être préfixées.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
