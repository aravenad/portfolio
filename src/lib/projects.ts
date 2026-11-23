/**
 * Accès aux fiches projet pour les pages et les sections.
 *
 * Tout passe par `getProjects()`, qui fixe l'ordre une fois pour toutes : la
 * liste, l'accueil et les liens « précédent / suivant » d'une fiche suivent
 * ainsi le même `order`. Les fiches « à venir » ont leur page, mais restent
 * hors de la liste, de l'accueil et du « précédent / suivant » (`isListed`).
 *
 * Chaque fonction prend la langue en dernier paramètre, français par défaut :
 * elle choisit la collection lue et le préfixe des URL.
 */
import { getCollection, type CollectionEntry } from "astro:content";

import { defaultLang, localizedUrl, type Lang } from "./i18n";

/** Une fiche, quelle que soit sa langue : les deux collections ont le même schéma. */
export type Project = CollectionEntry<"projects"> | CollectionEntry<"projectsEn">;

/** Nombre de projets affichés par page sur la liste. */
export const PROJECTS_PER_PAGE = 6;

export interface ProjectsPage {
  /** Les projets de la page. */
  projects: Project[];
  /** Tous les projets, dans l'ordre : les filtres de la liste cherchent dedans. */
  all: Project[];
  currentPage: number;
  totalPages: number;
}

/** URL d'une page de la liste : la première reste `/projects`. */
export function getProjectsPageHref(page: number, lang: Lang = defaultLang): string {
  return localizedUrl(page <= 1 ? "/projects" : `/projects/page/${page}`, lang);
}

/** URL d'une fiche. */
export function getProjectHref(project: Project, lang: Lang = defaultLang): string {
  return localizedUrl(`/projects/${project.id}`, lang);
}

/** Découpe les projets en pages de `PROJECTS_PER_PAGE`. */
export async function getProjectsPage(
  page: number,
  lang: Lang = defaultLang,
): Promise<ProjectsPage> {
  const projects = await getListedProjects(lang);
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const start = (page - 1) * PROJECTS_PER_PAGE;

  return {
    projects: projects.slice(start, start + PROJECTS_PER_PAGE),
    all: projects,
    currentPage: page,
    totalPages,
  };
}

/** Tous les projets, triés par `order` croissant, fiches à venir comprises. */
export async function getProjects(lang: Lang = defaultLang): Promise<Project[]> {
  const projects: Project[] = await getCollection(lang === "en" ? "projectsEn" : "projects");

  return projects.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Une fiche « à venir » n'a pas encore de contenu (le stage, avant qu'il
 * commence) : en tête de liste, elle passait avant les vrais projets. Elle
 * garde sa page, liée depuis le parcours, et entre dans la liste dès que son
 * statut change.
 */
export function isListed(project: Project): boolean {
  return project.data.status !== "a-venir";
}

/** Les projets de la liste et de l'accueil, dans l'ordre. */
export async function getListedProjects(lang: Lang = defaultLang): Promise<Project[]> {
  return (await getProjects(lang)).filter(isListed);
}

/**
 * Les projets mis en avant sur la page d'accueil. Sans aucun `featured`, les
 * premiers projets prennent leur place : la section n'est jamais vide.
 */
export async function getFeaturedProjects(
  limit = 4,
  lang: Lang = defaultLang,
): Promise<Project[]> {
  const projects = await getListedProjects(lang);
  const featured = projects.filter((project) => project.data.featured);

  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

/**
 * Les routes des fiches d'une langue, pour `getStaticPaths`. Les voisins
 * viennent de la liste déjà triée : « précédent » et « suivant » suivent
 * l'ordre de la page des projets. Une fiche hors liste a sa page, sans voisins.
 */
export async function getProjectPaths(lang: Lang = defaultLang) {
  const projects = await getProjects(lang);
  const listed = projects.filter(isListed);

  return projects.map((project) => {
    const index = listed.indexOf(project);

    return {
      params: { slug: project.id },
      props: {
        project,
        previous: index > 0 ? listed[index - 1] : undefined,
        next: index >= 0 ? listed[index + 1] : undefined,
      },
    };
  });
}

/** Les pages 2 et suivantes de la liste : la première vit sur `/projects`. */
export async function getProjectsPagePaths(lang: Lang = defaultLang) {
  const projects = await getListedProjects(lang);
  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    params: { page: String(index + 2) },
  }));
}
