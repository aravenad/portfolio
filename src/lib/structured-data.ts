/**
 * Données structurées (schema.org, en JSON-LD) : ce que les moteurs de recherche
 * ne devinent pas en lisant la page. Ici, qui est la personne derrière le site,
 * pour qu'une recherche sur son nom relie le site à ses profils.
 *
 * Tout vient des données déjà affichées : rien n'est écrit deux fois.
 */
import { education } from "../data/career";
import { site } from "../data/site";
import { url } from "./url";

/**
 * La personne, décrite pour Google. Même `@id` et même `url` dans les deux
 * langues : c'est une seule personne, seul son intitulé est traduit.
 *
 * `siteURL` est `Astro.site` : l'origine du site publié.
 */
export function personSchema(siteURL: URL, jobTitle: string) {
  const home = new URL(url("/"), siteURL).href;
  // Les études en cours, en tête de la liste.
  const [studies] = education;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${home}#person`,
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

/**
 * Le JSON à placer dans la balise, sans rien qui puisse la refermer : un « < »
 * dans une valeur deviendrait sinon du HTML.
 */
export function toJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
