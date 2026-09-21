# Portfolio

Portfolio personnel de Damien Aravena Bravo — étudiant en BUT Informatique à Grenoble.

Construit avec [Astro](https://astro.build) et [Tailwind CSS](https://tailwindcss.com).
Site entièrement statique : dix pages HTML, une feuille de style, et ~21 Ko de
JavaScript — le routeur de transitions d'Astro et une dizaine de petits
comportements (menu, navigation active, apparition au défilement).

## Démarrer

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère ./dist
npm run preview  # prévisualise le build
npm test         # 356 tests
npm run coverage # tests + rapport de couverture
```

Node >= 22.12. Le site est publié sur <https://aravenad.github.io/portfolio/> à
chaque push sur `main`, via le workflow `.github/workflows/deploy.yml` — qui
lance d'abord les tests et un `npm audit`, et ne construit rien si l'un des deux
échoue.

## Structure

```text
src/
├── assets/          images traitées par Vite (la matière du fond)
├── components/
│   ├── ui/          primitives réutilisables (Button, Card, Pagination…)
│   ├── layout/      Header et Footer
│   ├── sections/    blocs de la page d'accueil
│   └── ProjectCard.astro
├── content/projects/  une fiche Markdown par projet
├── data/            contenu éditable : site, compétences, parcours
├── icons/           logos absents de Simple Icons, chargés par astro-icon
├── layouts/         BaseLayout
├── lib/             accès aux projets, pagination, helpers
├── pages/           routes
├── styles/          global.css (thème et rendu Markdown)
└── types/           interfaces partagées

tools/               sources des images générées, non compilées
tests/               Vitest : données, composants, pages
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
  --color-accent: oklch(90% 0.032 250);
}
```

La direction artistique est monochrome, calquée sur la bannière LinkedIn : fond
noir, matière métallique en haut de page, lettrage chromé. Elle tient dans
`src/styles/global.css` (palette, calques, utilitaires), `src/assets/` (la
matière et son masque de fondu) et `tools/og.html` (l'image d'aperçu). Voir §5
et §10 de la documentation technique.

## Tests

```sh
npm test
```

Les composants sont rendus sans navigateur, par l'API Container d'Astro, et les
assertions portent sur le DOM produit. La suite couvre les helpers, les données,
les composants et les quatre routes ; elle tourne en moins de trois secondes.

Elle sert surtout à vérifier ce qui ne se voit pas à la relecture : l'espace
insécable des périodes du parcours, le contraste des couleurs de marque sur les
tuiles, les métadonnées d'aperçu LinkedIn, et le marquage du lien de navigation
courant. Un nouveau projet ou une nouvelle compétence est validé par les tests
avant même le build. Voir §14 de la documentation technique.

## Logos des compétences

Les logos des compétences viennent de [Simple Icons](https://simpleicons.org)
via `astro-icon` et sont inlinés au build. Pour un logo absent du jeu, déposer un
SVG dans `src/icons/` et le référencer par son nom de fichier, sans préfixe — ou,
pour un logo d'organisation du parcours, déposer le fichier dans `public/logos/`
et renseigner `logo:` dans `src/data/career.ts`.
