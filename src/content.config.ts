import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

/**
 * Les fiches projet : un fichier Markdown par projet dans src/content/projects/.
 *
 * Le nom du fichier devient l'identifiant de la fiche, donc son URL
 * (`/projects/<nom>`) : le renommer casse les liens déjà partagés.
 *
 * Le schéma est vérifié au build, qui s'arrête sur une fiche invalide. Un champ
 * ajouté ici doit l'être aussi au type `FixtureProject` des tests
 * (tests/helpers/content.ts), qui imite cette collection.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
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
  }),
});

export const collections = { projects };
