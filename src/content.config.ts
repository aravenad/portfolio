import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

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
