/**
 * Accès aux fiches projet pour les pages et les sections.
 *
 * Tout passe par `getProjects()`, qui fixe l'ordre une fois pour toutes : la
 * liste, l'accueil et les liens « précédent / suivant » d'une fiche suivent
 * ainsi le même `order`.
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
  projects: Project[];
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
  const projects = await getProjects(lang);
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const start = (page - 1) * PROJECTS_PER_PAGE;

  return {
    projects: projects.slice(start, start + PROJECTS_PER_PAGE),
    currentPage: page,
    totalPages,
  };
}

/** Tous les projets, triés par `order` croissant. */
export async function getProjects(lang: Lang = defaultLang): Promise<Project[]> {
  const projects: Project[] = await getCollection(lang === "en" ? "projectsEn" : "projects");

  return projects.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Les projets mis en avant sur la page d'accueil. Sans aucun `featured`, les
 * premiers projets prennent leur place : la section n'est jamais vide.
 */
export async function getFeaturedProjects(
  limit = 4,
  lang: Lang = defaultLang,
): Promise<Project[]> {
  const projects = await getProjects(lang);
  const featured = projects.filter((project) => project.data.featured);

  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

/**
 * Les routes des fiches d'une langue, pour `getStaticPaths`. Les voisins
 * viennent de la liste déjà triée : « précédent » et « suivant » suivent
 * l'ordre de la page des projets.
 */
export async function getProjectPaths(lang: Lang = defaultLang) {
  const projects = await getProjects(lang);

  return projects.map((project, index) => ({
    params: { slug: project.id },
    props: {
      project,
      previous: projects[index - 1],
      next: projects[index + 1],
    },
  }));
}

/** Les pages 2 et suivantes de la liste : la première vit sur `/projects`. */
export async function getProjectsPagePaths(lang: Lang = defaultLang) {
  const projects = await getProjects(lang);
  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    params: { page: String(index + 2) },
  }));
}
