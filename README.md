# Portfolio

Portfolio personnel de Damien Aravena Bravo — étudiant en BUT Informatique à Grenoble.

Construit avec [Astro](https://astro.build) et [Tailwind CSS](https://tailwindcss.com).
Site entièrement statique : vingt pages HTML (dix en français, dix en anglais),
une feuille de style, et ~26 Ko de JavaScript (9 Ko compressé) — le routeur de
transitions d'Astro et une dizaine de petits comportements (menu, navigation
active, apparition au défilement, thème).

Français par défaut, anglais sous `/en/`. Thème sombre par défaut, clair au
choix du visiteur, mémorisé d'une visite à l'autre.

Architecture, fonctionnement, évolutions et workflow de publication :
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Démarrer

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère ./dist
npm run preview  # prévisualise le build
npm test         # 576 tests
npm run coverage # tests + rapport de couverture
npm run test:e2e # tests de bout en bout (Playwright)
```

Node >= 22.12. Le site est publié sur <https://damien-aravena.fr/> à
chaque push sur `main`, via le workflow `.github/workflows/deploy.yml` — qui
lance d'abord les tests et un `npm audit`, et ne construit rien si l'un des deux
échoue ; rien n'est publié si les tests de bout en bout échouent. Détail : §7 de l'architecture.

## Structure

```text
src/
├── assets/          images traitées par Vite (la matière du fond)
├── components/
│   ├── ui/          primitives réutilisables (Button, Card, Pagination…)
│   ├── layout/      Header et Footer
│   ├── sections/    blocs de page (hero, compétences, parcours…)
│   ├── pages/       contenu des pages, commun aux deux langues
│   └── ProjectCard.astro
├── content/projects/  une fiche Markdown par projet (en/ : en anglais)
├── content.config.ts  schéma des fiches, vérifié au build
├── data/            contenu éditable : site, compétences, parcours, textes (ui.ts)
├── icons/           logos absents de Simple Icons, chargés par astro-icon
├── layouts/         BaseLayout
├── lib/             langues, thème, projets, pagination, helpers
├── pages/           routes (en/ : les mêmes en anglais)
├── styles/          global.css (thème et rendu Markdown)
└── types/           interfaces partagées

public/              servi tel quel : CV, favicon, images d'aperçu
tools/               sources des images générées, non compilées
tests/               Vitest : données, composants, pages
e2e/                 Playwright : le site construit, dans un navigateur
docs/                architecture du projet
.github/             workflow de publication et Dependabot
```

## Modifier le contenu

Chaque contenu existe en français et en anglais : modifier l'un, c'est modifier
l'autre. Les tests signalent une version anglaise qui ne suit plus la française.

| Quoi | Français | Anglais |
| :--- | :--- | :--- |
| Textes de l'interface (titres, boutons, accueil, contact…) | `src/data/ui.ts` (`fr`) | `src/data/ui.ts` (`en`) |
| Coordonnées, nom affiché dans la barre (`brand`) | `src/data/site.ts` | commun |
| Navigation | `navLinks` dans `src/data/site.ts` | `navLinksEn` |
| Compétences techniques | `technicalSkills` dans `src/data/skills.ts` | commun |
| Compétences transversales | `softSkills` | `softSkillsEn` |
| Expérience et formation | `experiences`, `education` dans `src/data/career.ts` | `experiencesEn`, `educationEn` |
| Projets | `src/content/projects/*.md` | `src/content/projects/en/*.md` |

### Ajouter un projet

Créer un fichier dans `src/content/projects/`, et sa traduction **sous le même
nom** dans `src/content/projects/en/`. Le nom du fichier devient l'URL
(`/projects/mon-projet` et `/en/projects/mon-projet`), le corps est du Markdown
libre. `order`, `status`, `year` et `featured` doivent être identiques dans les
deux versions.

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

Les couleurs sont définies dans `src/styles/global.css` : l'accent du thème
sombre dans `@theme`, et toute la palette du thème clair dans le bloc
`:root[data-theme="light"]`.

```css
@theme {
  --color-accent: oklch(90% 0.032 250);
}
```

La direction artistique est monochrome, calquée sur la bannière LinkedIn : fond
noir, matière métallique en haut de page, lettrage chromé. Le thème clair en
est le négatif doux : fond gris perle, matière en plis gris, lettrage graphite. Elle tient dans
`src/styles/global.css` (palette, calques, utilitaires), `src/assets/` (la
matière et son masque de fondu) et `tools/og.html` (l'image d'aperçu). Pour
les modifier, voir §6 de l'architecture.

## Tests

```sh
npm test
npm run test:e2e
```

Les composants sont rendus sans navigateur, par l'API Container d'Astro, et les
assertions portent sur le DOM produit. La suite couvre les helpers, les données,
les composants et les quatre routes, dans les deux langues ; elle tourne en
quelques secondes.

Elle sert surtout à vérifier ce qui ne se voit pas à la relecture : l'espace
insécable des périodes du parcours, le contraste des couleurs de marque sur les
tuiles dans les deux thèmes, les métadonnées d'aperçu LinkedIn, le marquage du
lien de navigation courant, et l'alignement des contenus anglais sur les
français. Un nouveau projet ou une nouvelle compétence est validé par les tests
avant même le build.

Les tests de bout en bout (`e2e/`, Playwright) prennent le relais là où Vitest
ne voit rien : les scripts des composants, sur le site construit, dans Chromium.
Ils cliquent, défilent et changent de langue ou de thème comme un visiteur, sur
bureau et sur téléphone. Première fois : `npx playwright install --only-shell
chromium`. Voir §5 de l'architecture.

## Logos des compétences

Les logos des compétences viennent de [Simple Icons](https://simpleicons.org)
via `astro-icon` et sont inlinés au build. Pour un logo absent du jeu, déposer un
SVG dans `src/icons/` et le référencer par son nom de fichier, sans préfixe — ou,
pour un logo d'organisation du parcours, déposer le fichier dans `public/logos/`
et renseigner `logo:` dans `src/data/career.ts`.
