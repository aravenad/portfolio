/**
 * Les filtres de la liste des projets : par statut, par type de projet, par
 * compétence du PN et par étiquette (technologie).
 *
 * Chaque page de la liste porte toutes les fiches, celles des autres pages
 * masquées (`data-off-page`). Sans filtre, la page montre donc ses six cartes
 * et sa pagination, comme sans script ; dès qu'un filtre est choisi, elle
 * cherche dans tous les projets et la pagination s'efface. Les filtres vivent
 * dans l'adresse (`?competence=optimiser`), pour qu'un lien filtré se partage.
 *
 * Le script de ProjectsList.astro trouve les éléments ; le reste est ici, pour
 * être testé.
 */

/** Les filtres d'une liste. Une valeur vide : pas de filtre sur ce critère. */
export interface ProjectFilters {
  status: string;
  kind: string;
  competence: string;
  tag: string;
}

export const FILTER_KEYS = ["status", "kind", "competence", "tag"] as const satisfies readonly (keyof ProjectFilters)[];

/** Séparateur des étiquettes dans `data-tags` : aucune n'en contient. */
export const TAG_SEPARATOR = "|";

/**
 * Ce que le filtrage lit et écrit d'une carte de la liste : son `li`, qui
 * porte `data-status`, `data-kind`, `data-competences` (séparées par des espaces),
 * `data-tags` (par `TAG_SEPARATOR`) et `data-off-page` hors de la page.
 */
export type FilterItem = Pick<HTMLElement, "dataset"> & { hidden: boolean };

/** Les filtres d'une adresse ; un paramètre inconnu est ignoré. */
export function parseFilters(search: string): ProjectFilters {
  const params = new URLSearchParams(search);
  return {
    status: params.get("status") ?? "",
    kind: params.get("kind") ?? "",
    competence: params.get("competence") ?? "",
    tag: params.get("tag") ?? "",
  };
}

/** La partie `?…` d'une adresse filtrée, vide sans filtre. */
export function filtersQuery(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) if (filters[key]) params.set(key, filters[key]);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Vrai dès qu'un critère est choisi. */
export function isActive(filters: ProjectFilters): boolean {
  return FILTER_KEYS.some((key) => filters[key] !== "");
}

/** Une carte répond-elle à tous les critères choisis ? */
export function matches(item: FilterItem, filters: ProjectFilters): boolean {
  const { status = "", kind = "", competences = "", tags = "" } = item.dataset;

  return (
    (!filters.status || status === filters.status) &&
    (!filters.kind || kind === filters.kind) &&
    (!filters.competence || competences.split(" ").includes(filters.competence)) &&
    (!filters.tag || tags.split(TAG_SEPARATOR).includes(filters.tag))
  );
}

/**
 * Montre les cartes qui répondent aux filtres, et seulement elles ; sans
 * filtre, celles de la page. Renvoie le nombre de cartes montrées.
 */
export function applyFilters(items: readonly FilterItem[], filters: ProjectFilters): number {
  const active = isActive(filters);
  let shown = 0;

  for (const item of items) {
    item.hidden = active ? !matches(item, filters) : "offPage" in item.dataset;
    if (!item.hidden) shown++;
  }

  return shown;
}

/**
 * Le décompte annoncé sous les filtres : `{count}` et `{total}` remplacés, au
 * singulier ou au pluriel selon la langue (en français, 0 projet ; en
 * anglais, 0 projects).
 */
export function countLabel(
  count: number,
  total: number,
  templates: { one: string; other: string },
  lang: string,
): string {
  const form = new Intl.PluralRules(lang).select(count) === "one" ? "one" : "other";

  return templates[form].replace("{count}", String(count)).replace("{total}", String(total));
}
