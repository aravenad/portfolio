# Portfolio

Portfolio personnel de Damien Aravena Bravo, étudiant en BUT Informatique à Grenoble.

Construit avec [Astro](https://astro.build) et [Tailwind CSS](https://tailwindcss.com).
Site entièrement statique : vingt-quatre pages HTML (douze en français, douze
en anglais), une feuille de style et environ 28 Ko de JavaScript (9 Ko compressés).
Ce JavaScript se limite au routeur de transitions d'Astro et à une dizaine de
petits comportements (menu, navigation active, apparition au défilement, thème,
plan du site, texte replié sur téléphone).

Français par défaut, anglais sous `/en/`. Thème sombre par défaut, clair au
choix du visiteur, mémorisé d'une visite à l'autre.

Pensé aussi pour le téléphone, où un recruteur ouvre souvent le lien en premier :

- sous 1024 px, les textes longs de l'accueil (À propos, compétences) ne
  montrent que leur premier paragraphe, la suite derrière « Lire la suite » ;
- sous 640 px, les logos des compétences passent de tuiles carrées à des
  pastilles compactes, qui prennent la couleur de leur marque au toucher, et les
  cartes de projets passent en ligne, vignette à gauche, sans étiquettes ;
- les boutons d'action s'empilent en pleine largeur.

Sur grand écran, l'espace libre sous la fiche d'À propos propose de prendre
contact ou de télécharger le CV.

Les mentions légales (`/legal`, liées depuis le pied de page) nomment l'éditeur,
son contact, l'hébergeur (GitHub Pages) et le bureau d'enregistrement du domaine
(Infomaniak), et disent ce que le site garde des visiteurs : rien hors du
navigateur. Éditeur non professionnel, Damien n'y publie ni adresse
postale ni téléphone, comme le permet l'article 1-1 de la LCEN.

Architecture, fonctionnement, évolutions et workflow de publication :
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Démarrer

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère ./dist
npm run preview  # prévisualise le build
npm test         # 639 tests
npm run coverage # tests + rapport de couverture
npm run test:e2e # tests de bout en bout (Playwright)
```

Node >= 22.12. Chaque push sur `main` publie le site sur
<https://damien-aravena.fr/> via le workflow `.github/workflows/deploy.yml`.
Le workflow lance d'abord les tests et un `npm audit`, et ne construit rien si
l'un des deux échoue. Rien n'est publié non plus si les tests de bout en bout
échouent. Détail : §7 de l'architecture.

## Structure

```text
src/
├── assets/          images traitées par Vite (la matière du fond)
├── components/
│   ├── ui/          primitives réutilisables (Button, Card, Pagination…)
│   ├── layout/      Header et Footer
│   ├── sections/    blocs de page (hero, compétences, parcours…)
│   ├── pages/       contenu des pages, commun aux deux langues
│   └── ProjectCard.astro, ProjectCover.astro
├── content/projects/  une fiche Markdown par projet (en/ : en anglais)
├── content.config.ts  schéma des fiches, vérifié au build
├── data/            contenu éditable : site, compétences, parcours, textes (ui.ts)
├── icons/           logos absents de Simple Icons, chargés par astro-icon
├── layouts/         BaseLayout
├── lib/             langues, thème, projets, pagination, CV, données structurées, helpers
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
| Mentions légales : textes / hébergeur et domaine (`host`, `registrar`) | `legal` dans `src/data/ui.ts` / `src/data/site.ts` | `legal` (`en`) / commun |
| Navigation | `navLinks` dans `src/data/site.ts` | `navLinksEn` |
| Compétences techniques | `technicalSkills` dans `src/data/skills.ts` | commun |
| Compétences transversales | `softSkills` | `softSkillsEn` |
| Expérience et formation | `experiences`, `education` dans `src/data/career.ts` | `experiencesEn`, `educationEn` |
| Projets | `src/content/projects/*.md` | `src/content/projects/en/*.md` |

### Ajouter un projet

Créer un fichier dans `src/content/projects/`, et sa traduction **sous le même
nom** dans `src/content/projects/en/`. Le nom du fichier devient l'URL
(`/projects/mon-projet` et `/en/projects/mon-projet`), le corps est du Markdown
libre. `order`, `status`, `year`, `featured`, `cover` et `competences` doivent
être identiques dans les deux versions.

```md
---
title: "Titre du projet"
summary: "Une phrase affichée sur la carte."
tags: ["Java", "SQL"]
status: "termine" # termine | en-cours | a-venir
team: "En binôme"
year: 2026
order: 8 # ordre d'affichage
cover: uml # motif de la carte : uml | algo | web | erd | chart | network | terminal | calendar
featured: true # mis en avant sur l'accueil
role: # ce que j'ai fait moi-même dans l'équipe
  - "Conception du diagramme de classes"
competences: [realiser, collaborer] # compétences du BUT mobilisées
learned: # techniques et savoir-faire acquis
  - "Écrire les tests avant le code"
---

## Contexte

…
```

Le schéma est validé au build par `src/content.config.ts` : un champ manquant ou
mal typé arrête la compilation.

`role`, `competences` et `learned` sont les rubriques de la grille du PPP. Elles
s'affichent à la suite du corps, avec leur entrée dans le sommaire, et seulement
une fois renseignées : une fiche peut être publiée avant d'être complète. Les
compétences sont celles du Programme National, dans son ordre : `realiser`,
`optimiser`, `administrer`, `gerer`, `conduire`, `collaborer`.

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
est le négatif doux : fond gris perle, matière en plis gris, lettrage graphite.
Elle tient dans `src/styles/global.css` (palette, calques, utilitaires),
`src/assets/` (la matière et son masque de fondu) et `tools/og.html` (l'image
d'aperçu). Pour les modifier, voir §6 de l'architecture.

## Tests

```sh
npm test
npm run test:e2e
```

Les composants sont rendus sans navigateur, par l'API Container d'Astro, et les
assertions portent sur le DOM produit. La suite couvre les helpers, les données,
les composants et les quatre routes, dans les deux langues, à 100 % (la CI
exige 80 %) ; elle tourne en quelques secondes.

Elle sert surtout à vérifier ce qui ne se voit pas à la relecture : l'espace
insécable des périodes du parcours, le contraste des couleurs de marque sur les
tuiles dans les deux thèmes, les métadonnées d'aperçu LinkedIn, le marquage du
lien de navigation courant, et l'alignement des contenus anglais sur les
français. Un nouveau projet ou une nouvelle compétence est validé par les tests
avant même le build.

Les tests de bout en bout (`e2e/`, Playwright) prennent le relais là où Vitest
ne voit rien : les scripts des composants, sur le site construit, dans Chromium.
Ils cliquent, défilent et changent de langue ou de thème comme un visiteur, sur
bureau et sur téléphone. Les vérifications de mise en page mobile tournent à
360 px, la largeur des téléphones les plus étroits : le Pixel 7 de Playwright
(412 px) laissait passer deux défauts visibles à 360 px. Première fois :
`npx playwright install --only-shell chromium`. Voir §5 de l'architecture.

## Logos des compétences

Les logos des compétences viennent de [Simple Icons](https://simpleicons.org)
via `astro-icon` et sont inlinés au build. Ils s'affichent en tuiles
(`SkillTile`) sur grand écran et en pastilles (`SkillChip`) sur téléphone ; les
deux lisent leurs couleurs de marque par `brandStyle()`, dans `src/lib/skills.ts`. Pour un logo absent du jeu, déposer un
SVG dans `src/icons/` et le référencer par son nom de fichier, sans préfixe.
Pour un logo d'organisation du parcours, déposer plutôt le fichier dans
`public/logos/` et renseigner `logo:` dans `src/data/career.ts`.
