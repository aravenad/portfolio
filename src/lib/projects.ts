import { getCollection, type CollectionEntry } from "astro:content";

import { url } from "./url";

export type Project = CollectionEntry<"projects">;
export type ProjectStatus = Project["data"]["status"];

export const statusLabels: Record<ProjectStatus, string> = {
  termine: "Terminé",
  "en-cours": "En cours",
  "a-venir": "À venir",
};

/** Nombre de projets affichés par page sur la liste. */
export const PROJECTS_PER_PAGE = 6;

export interface ProjectsPage {
  projects: Project[];
  currentPage: number;
  totalPages: number;
}

/** URL d'une page de la liste : la première reste `/projects`. */
export function getProjectsPageHref(page: number): string {
  return url(page <= 1 ? "/projects" : `/projects/page/${page}`);
}

/** Découpe les projets en pages de `PROJECTS_PER_PAGE`. */
export async function getProjectsPage(page: number): Promise<ProjectsPage> {
  const projects = await getProjects();
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const start = (page - 1) * PROJECTS_PER_PAGE;

  return {
    projects: projects.slice(start, start + PROJECTS_PER_PAGE),
    currentPage: page,
    totalPages,
  };
}

/** Tous les projets, triés par `order` croissant. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");

  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** Les projets mis en avant sur la page d'accueil. */
export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.data.featured);

  return (featured.length > 0 ? featured : projects).slice(0, limit);
}
