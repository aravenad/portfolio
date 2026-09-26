# Architecture

Ce document explique **comment le site est construit et comment le faire
évoluer**. Le détail d'un choix vit en commentaire, à côté du code qu'il
justifie : ce document n'en donne que la carte.

## 1. En bref

- **Site statique.** Astro génère 10 pages HTML au build. Aucun serveur, aucune
  base de données : GitHub Pages sert le dossier `dist/`.
- **Le contenu est séparé du code.** Textes, compétences, parcours et projets
  vivent dans `src/data/` et `src/content/`. Les modifier ne demande pas de
  toucher aux composants.
- **Le moins de JavaScript possible.** Un routeur de transitions et quelques
  comportements (~25 Ko, 8 Ko compressé). Sans JavaScript, tout le contenu
  reste lisible et tous les liens fonctionnent.
- **Toute décision est testable hors navigateur.** Les scripts des composants
  mesurent le DOM et appliquent un résultat ; la règle qui décide est dans
  `src/lib/`, en TypeScript pur, et testée.

## 2. Où est quoi

| Dossier | Rôle | Règle |
| :--- | :--- | :--- |
| `src/pages/` | Routes (une page = un fichier) | Assemble des sections, ne contient pas de logique |
| `src/layouts/BaseLayout.astro` | Le document HTML commun : `<head>`, header, footer, scripts globaux | Toute page passe par lui |
| `src/components/sections/` | Blocs de page (hero, compétences, parcours…) | Lisent les données, composent des `ui/` |
| `src/components/ui/` | Primitives réutilisables | Ne lisent aucune donnée : tout arrive par les props |
| `src/components/layout/` | Header et footer | Persistés entre les pages (`transition:persist`) |
| `src/data/` | Contenu éditable en TypeScript | Typé par `src/types/`, vérifié par `tests/data/` |
| `src/content/projects/` | Une fiche Markdown par projet | Schéma dans `src/content.config.ts`, vérifié au build |
| `src/lib/` | Logique pure : URL, projets, navigation, sommaire, pagination | Sans DOM, couverte à 100 % |
| `src/styles/global.css` | Thème Tailwind, calques du fond, utilitaires, rendu Markdown | Seule feuille de style globale |
| `src/assets/` | Images traitées par Vite (URL empreintée) | Celles que le CSS ou le code importent |
| `public/` | Fichiers servis tels quels (CV, favicon, images d'aperçu) | Nom stable : c'est lui qui fait l'URL |
| `tests/` | Vitest, rangé comme `src/` | Voir §5 |
| `tools/` | Sources des images générées, archives | Jamais compilé ni servi |

## 3. Du contenu à la page

```text
src/data/*.ts ─────────────┐
src/content/projects/*.md ─┴─> src/lib/projects.ts ─> sections/ ─> pages/ ─> dist/*.html
     (schéma : content.config.ts)    (tri, pagination)      (ui/)     (BaseLayout)
```

| URL | Fichier | Contenu |
| :--- | :--- | :--- |
| `/portfolio/` | `pages/index.astro` | Hero, compétences ×2, parcours, projets mis en avant, contact |
| `/portfolio/projects` | `pages/projects/index.astro` | Première page de la liste (6 projets) |
| `/portfolio/projects/page/N` | `pages/projects/page/[page].astro` | Pages suivantes, générées selon le nombre de projets |
| `/portfolio/projects/<fichier>` | `pages/projects/[slug].astro` | Une fiche, son sommaire, les projets voisins |

- **L'ordre des projets** est donné par `order` (croissant), partout : liste,
  accueil, projets précédent et suivant.
- **L'accueil** montre les trois premiers projets `featured: true`, ou les trois
  premiers tout court s'il n'y en a aucun.
- **Le site vit dans un sous-dossier** (`base: '/portfolio'`). Tout lien interne
  passe par `url()` (`src/lib/url.ts`), qui ajoute ce préfixe. Un `href="/…"`
  écrit à la main pointerait à la racine du domaine, donc vers une 404.

## 4. Dans le navigateur

**Navigation.** `<ClientRouter />` remplace le DOM au lieu de recharger la page.
Conséquence : le `<script>` d'un composant ne s'exécute qu'une fois, au premier
chargement. Tout comportement doit donc passer par `onEachPage()`
(`src/lib/enhance.ts`), qui le rejoue à chaque page et fournit un `AbortSignal`
à poser sur chaque écouteur, pour qu'aucun ne survive à la page suivante.

| Comportement | Script | Règle testée |
| :--- | :--- | :--- |
| Menu mobile, barre qui se détend, lien actif au défilement | `layout/Header.astro` | `lib/nav.ts` |
| Bouton de retour en haut | `ui/BackToTop.astro` | `lib/back-to-top.ts` |
| Glissement de la page active | `ui/Pagination.astro` | `lib/pagination.ts` |
| Sommaire des fiches et curseur de lecture | `ui/TableOfContents.astro` | `lib/toc.ts` |
| Apparition au défilement, ancres depuis une autre page | `layouts/BaseLayout.astro` | Tests de page |

**Apparition au défilement.** Un script bloquant dans le `<head>` pose
`data-reveal-armed` avant le premier affichage ; le CSS ne masque les blocs
`.reveal` que sous ce drapeau. Si le module qui les révèle n'arrive pas dans
les 3 secondes, le drapeau est retiré et tout redevient visible. Sous
`prefers-reduced-motion`, rien n'est masqué ni animé.

**Style.** Tailwind v4, sans fichier de configuration : le thème est dans le
bloc `@theme` de `global.css`. Le fond de page est fait de deux calques sur
`body` : la matière métallique (`::before`, photo `chrome-original-hq.webp`
fondue par le masque `chrome-fade.webp`) et un grain fin (`::after`).

## 5. Tests

```sh
npm test          # 482 tests, quelques secondes
npm run coverage  # idem, avec le seuil de couverture (80 %) exigé par la CI
```

- **Composants et pages** sont rendus sans navigateur par l'API Container
  d'Astro, puis interrogés comme un DOM (`linkedom`). Les aides sont dans
  `tests/helpers/render.ts`.
- **`astro:content`** n'existe pas hors d'un build : les tests le remplacent par
  sept projets factices (`tests/helpers/content.ts`).
- **Les données** sont vérifiées sur ce qui ne se voit pas à la relecture :
  format des périodes du parcours, contraste des couleurs de marque, icônes
  existantes, schéma et cohérence des fiches.
- ⚠️ Sous Windows, `tests/content/projects.test.ts` échoue sur un chemin
  (`C:\C:\…`). Ce n'est pas une régression : la CI tourne sous Linux.

## 6. Faire évoluer

| Je veux… | Je fais… |
| :--- | :--- |
| **Ajouter un projet** | Un fichier `src/content/projects/mon-projet.md` avec l'en-tête décrit dans le README. Son nom devient l'URL. |
| **Ajouter une compétence** | Une entrée dans `src/data/skills.ts`. Une couleur de marque trop sombre fait échouer les tests : l'éclaircir, comme indiqué en tête du fichier. |
| **Ajouter une expérience** | Une entrée dans `src/data/career.ts`, en respectant le format de période décrit en tête du fichier (vérifié par les tests). |
| **Ajouter une section à l'accueil** | Un composant dans `sections/` basé sur `ui/Section.astro` avec un `id`, placé dans `pages/index.astro`. Pour un lien dans la barre : l'ajouter dans `navLinks` (`src/data/site.ts`), dans l'ordre des sections, avec l'`id` dans `sections`. |
| **Ajouter une page** | Un fichier dans `src/pages/`, enveloppé dans `BaseLayout`, liens via `url()`. Ajouter un test dans `tests/pages/`. |
| **Ajouter un comportement JS** | La règle dans `src/lib/` avec son test, le câblage dans le `<script>` du composant via `onEachPage((signal) => …)`. |
| **Changer une couleur** | `--color-accent` dans `@theme` (`global.css`). Les autres teintes sont les gris `zinc` de Tailwind. |
| **Refaire l'image d'aperçu** | Modifier `tools/og.html`, la rendre (commande ci-dessous) sous un **nouveau nom** (`og-v6.png`), puis pointer `ogImageURL` dessus dans `BaseLayout`. LinkedIn garde en cache l'ancienne URL ; ne pas supprimer l'ancien fichier, les partages existants y pointent. |
| **Retoucher le fondu du fond** | Modifier `tools/chrome-fade/chrome-fade.svg`, puis `node tools/chrome-fade/render.mjs` (détails dans son README). |
| **Changer le nom du dépôt** | Le dossier de publication change : mettre à jour `base` dans `astro.config.mjs`, puis remplacer `/portfolio` dans `tests/` (`helpers/render.ts` et les tests qui vérifient des URL). |

Rendu de l'image d'aperçu, depuis la racine du projet. Sous Windows, remplacer
`chrome` par le chemin complet de `chrome.exe` et l'URL par
`file:///C:/…/tools/og.html` :

```sh
chrome --headless=new --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1200,630 --screenshot=public/og-v6.png "file://$PWD/tools/og.html"
```

La police vient de la machine (Inter, sinon Roboto) : vérifier le rendu avant
de le publier.

## 7. Workflow de publication

`.github/workflows/deploy.yml`, déclenché par un push sur `main`, une pull
request vers `main`, ou à la main (onglet Actions, « Run workflow »).

```text
test ──> build ──> deploy
```

| Job | Fait | Échoue si |
| :--- | :--- | :--- |
| `test` | `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run coverage` | Faille haute ou critique dans une dépendance de production, test rouge, couverture sous 80 % |
| `build` | `withastro/action` : installe, construit, dépose `dist/` comme artefact Pages | Erreur de build, dont une fiche projet invalide |
| `deploy` | `actions/deploy-pages` publie l'artefact | Jamais lancé sur une pull request |

- **Un échec n'abîme rien** : tant que `deploy` ne s'est pas exécuté, le site en
  ligne reste la version précédente.
- **Permissions minimales** : aucune par défaut ; seul `deploy` peut écrire sur
  Pages.
- **Actions épinglées par empreinte de commit**, pas par tag (un tag peut être
  déplacé). Dependabot (`.github/dependabot.yml`) propose chaque semaine les
  montées de version des actions et des dépendances npm.
- **Un déploiement à la fois** (`concurrency: pages`), sans annuler celui en
  cours.
- **Côté GitHub** : Pages a pour source « GitHub Actions », et l'environnement
  `github-pages` n'accepte que la branche `main`. Déployer depuis une autre
  branche demande de l'y autoriser (Settings → Environments).

## 8. `tools/`

| Fichier | Sert à |
| :--- | :--- |
| `og.html` | Source de l'image d'aperçu `public/og-v5.png` (§6) |
| `chrome-fade/` | Source et script de rendu du masque de fondu du fond |
| `chrome.svg` | Ancienne matière procédurale, gardée comme source des bandeaux du CV |
| `cv-kit/` | Valeurs de la direction artistique pour le CV, et son export public |
| `background-archive/` | Instantané du fond précédent, pour pouvoir y revenir |
