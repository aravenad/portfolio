/**
 * Données structurées (schema.org, en JSON-LD) : ce que les moteurs de recherche
 * ne devinent pas en lisant la page. Qui est la personne derrière le site, pour
 * qu'une recherche sur son nom relie le site à ses profils ; où se situe une
 * page dans le site (fil d'Ariane) ; ce qu'est un projet, et qui l'a fait.
 *
 * Tout vient des données déjà affichées : rien n'est écrit deux fois.
 */
import { education } from "../data/career";
import { site } from "../data/site";
import { url } from "./url";

/** L'accueil du site publié, base comprise. */
const homeURL = (siteURL: URL) => new URL(url("/"), siteURL).href;

/** L'identifiant de la personne, par lequel les autres schémas la désignent. */
const personId = (siteURL: URL) => `${homeURL(siteURL)}#person`;

/**
 * La personne, décrite pour Google. Même `@id` et même `url` dans les deux
 * langues : c'est une seule personne, seul son intitulé est traduit.
 *
 * `siteURL` est `Astro.site` : l'origine du site publié.
 */
export function personSchema(siteURL: URL, jobTitle: string) {
  const home = homeURL(siteURL);
  // Les études en cours, en tête de la liste.
  const [studies] = education;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId(siteURL),
    name: site.author,
    givenName: site.name,
    familyName: site.author.slice(site.name.length).trim(),
    url: home,
    jobTitle,
    affiliation: { "@type": "CollegeOrUniversity", name: studies.organization },
    address: { "@type": "PostalAddress", addressLocality: studies.location, addressCountry: "FR" },
    sameAs: [site.github, site.linkedin],
  };
}

/** Un niveau du fil d'Ariane : son intitulé et son adresse complète. */
export interface Crumb {
  name: string;
  url: string;
}

/**
 * Le fil d'Ariane, tel que la page l'affiche (Breadcrumb.astro), de l'accueil
 * à la page elle-même. Google le montre à la place de l'adresse brute dans ses
 * résultats.
 */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/** Ce qu'une fiche dit de son projet, et l'adresse de la fiche. */
export interface ProjectFacts {
  /** L'adresse complète de la fiche. */
  url: string;
  title: string;
  summary: string;
  tags: string[];
  year?: number;
  /** Le dépôt du code, s'il est public. */
  repo?: string;
  /** L'adresse complète de la carte d'aperçu. */
  image?: string;
}

/**
 * Un projet, décrit depuis sa fiche. Avec un dépôt public, c'est du code
 * (`SoftwareSourceCode`, qui pointe vers le dépôt) ; sans, une réalisation
 * (`CreativeWork`). L'auteur est la personne de l'accueil, désignée par son
 * `@id` : les moteurs relient ainsi chaque projet à la même personne.
 */
export function projectSchema(siteURL: URL, lang: string, project: ProjectFacts) {
  return {
    "@context": "https://schema.org",
    "@type": project.repo ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${project.url}#project`,
    url: project.url,
    name: project.title,
    description: project.summary,
    inLanguage: lang,
    ...(project.year && { dateCreated: String(project.year) }),
    ...(project.tags.length > 0 && { keywords: project.tags.join(", ") }),
    ...(project.repo && { codeRepository: project.repo }),
    ...(project.image && { image: project.image }),
    author: {
      "@type": "Person",
      "@id": personId(siteURL),
      name: site.author,
      url: homeURL(siteURL),
    },
  };
}

/**
 * Le JSON à placer dans la balise, sans rien qui puisse la refermer : un « < »
 * dans une valeur deviendrait sinon du HTML.
 */
export function toJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
