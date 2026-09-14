# Portfolio

Portfolio personnel de Damien Aravena Bravo — étudiant en BUT Informatique à Grenoble.

Construit avec [Astro](https://astro.build) et [Tailwind CSS](https://tailwindcss.com).
Site entièrement statique, sans JavaScript côté client hormis deux scripts de quelques
centaines d'octets (navigation active au défilement, retour en haut de page).

## Démarrer

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère ./dist
npm run preview  # prévisualise le build
```

## Structure

```text
src/
├── components/
│   ├── ui/          primitives réutilisables (Button, Card, Pagination…)
│   ├── layout/      Header et Footer
│   ├── sections/    blocs de la page d'accueil
│   └── ProjectCard.astro
├── content/projects/  une fiche Markdown par projet
├── data/            contenu éditable : site, compétences, parcours
├── lib/             accès aux projets et pagination
├── layouts/         BaseLayout
├── pages/           routes
└── styles/          global.css (thème et rendu Markdown)
```

## Modifier le contenu

| Quoi | Où |
| :--- | :--- |
| Coordonnées, navigation | `src/data/site.ts` |
| Compétences techniques et transversales | `src/data/skills.ts` |
| Expérience et formation | `src/data/career.ts` |
| Projets | `src/content/projects/*.md` |

### Ajouter un projet

Créer un fichier dans `src/content/projects/`. Le nom du fichier devient l'URL
(`/projects/mon-projet`), le corps est du Markdown libre.

```md
---
title: "Titre du projet"
summary: "Une phrase affichée sur la carte."
tags: ["Java", "SQL"]
status: "termine" # termine | en-cours | a-venir
team: "En binôme"
year: 2026
order: 8 # ordre d'affichage
featured: true # mis en avant sur l'accueil
---

## Contexte

…
```

Le schéma est validé au build par `src/content.config.ts` : un champ manquant ou
mal typé arrête la compilation.

## Personnaliser

La couleur d'accent est définie une seule fois dans `src/styles/global.css` :

```css
@theme {
  --color-accent: oklch(82.8% 0.189 84.429);
}
```

Les logos des compétences viennent de [Simple Icons](https://simpleicons.org)
via `astro-icon` et sont inlinés au build. Pour un logo absent du jeu, déposer le
fichier dans `public/logos/` et renseigner `logo:` dans `src/data/career.ts`.
