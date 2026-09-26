import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

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
const schema = z.object({
  title: z.string(),
  /** Résumé affiché sur les cartes. */
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["termine", "en-cours", "a-venir"]),
  /** Contexte de réalisation : seul, en binôme, en équipe. */
  team: z.string().optional(),
  year: z.number().optional(),
  /** Ordre d'affichage (croissant). */
  order: z.number().default(99),
  featured: z.boolean().default(false),
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
