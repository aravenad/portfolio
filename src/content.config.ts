import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

import { frenchSpacing } from "./lib/typography";
import { COMPETENCES, COVERS } from "./types";

/**
 * Les fiches projet : un fichier Markdown par projet, en français dans
 * src/content/projects/, en anglais dans src/content/projects/en/.
 *
 * Le nom du fichier devient l'identifiant de la fiche, donc son URL
 * (`/projects/<nom>` et `/en/projects/<nom>`) : le renommer casse les liens déjà
 * partagés. Une fiche anglaise porte le même nom que sa version française, ce
 * qui permet au sélecteur de langue de passer de l'une à l'autre.
 *
 * Le schéma est vérifié au build, qui s'arrête sur une fiche invalide. Un champ
 * ajouté ici doit l'être aussi au type `FixtureProject` des tests
 * (tests/helpers/content.ts), qui imite ces collections.
 */
/**
 * Un texte affiché tel quel : l'espace devant « ; : ? ! » y devient insécable,
 * comme dans le corps Markdown (voir src/lib/typography.ts). Sans effet sur
 * l'anglais, qui n'en met pas.
 */
const text = () => z.string().transform(frenchSpacing);

const schema = z.object({
  title: text(),
  /** Résumé affiché sur les cartes. */
  summary: text(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["termine", "en-cours", "a-venir"]),
  /** Contexte de réalisation : seul, en binôme, en équipe. */
  team: text().optional(),
  year: z.number().optional(),
  /** Ordre d'affichage (croissant). */
  order: z.number().default(99),
  featured: z.boolean().default(false),
  /** Motif de la couverture sur la carte, identique dans les deux langues. */
  cover: z.enum(COVERS).optional(),
  /*
   * Les rubriques attendues par la grille du PPP, en plus du corps Markdown.
   * Chacune n'apparaît sur la fiche, et dans son sommaire, qu'une fois
   * renseignée : une fiche peut donc être publiée avant d'être complète.
   */
  /** Ce que j'ai fait moi-même, dans un projet d'équipe. */
  role: z.array(text()).default([]),
  /** Compétences du BUT mobilisées, dans l'ordre de COMPETENCES. */
  competences: z.array(z.enum(COMPETENCES)).default([]),
  /** Techniques et savoir-faire acquis. */
  learned: z.array(text()).default([]),
});

// `*.md` et non `**/*.md` : le sous-dossier `en/` appartient à l'autre collection.
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema,
});

const projectsEn = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects/en" }),
  schema,
});

export const collections = { projects, projectsEn };
