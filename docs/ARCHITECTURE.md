# Architecture

Ce document explique **comment le site est construit et comment le faire
évoluer**. Le détail d'un choix vit en commentaire, à côté du code qu'il
justifie : ce document n'en donne que la carte.

## 1. En bref

- **Site statique.** Astro génère 20 pages HTML au build, 10 par langue.
  Aucun serveur, aucune base de données : GitHub Pages sert le dossier `dist/`.
- **Deux langues, deux thèmes.** Français par défaut, anglais sous `/en/` ;
  thème sombre par défaut, clair sur choix du visiteur (§3 et §4).
- **Le contenu est séparé du code.** Textes, compétences, parcours et projets
  vivent dans `src/data/` et `src/content/`. Les modifier ne demande pas de
  toucher aux composants.
- **Le moins de JavaScript possible.** Un routeur de transitions et quelques
  comportements (~26 Ko, 9 Ko compressé). Sans JavaScript, tout le contenu
  reste lisible et tous les liens fonctionnent.
- **Toute décision est testable hors navigateur.** Les scripts des composants
  mesurent le DOM et appliquent un résultat ; la règle qui décide est dans
  `src/lib/`, en TypeScript pur, et testée.

## 2. Où est quoi

| Dossier | Rôle | Règle |
| :--- | :--- | :--- |
| `src/pages/` | Routes : un fichier par page et par langue (`en/` pour l'anglais) | Simple point d'entrée : rend un composant de `components/pages/` |
| `src/components/pages/` | Le contenu de chaque page, commun aux deux langues | Lit la langue dans l'URL |
| `src/layouts/BaseLayout.astro` | Le document HTML commun : `<head>`, header, footer, scripts globaux | Toute page passe par lui |
| `src/components/sections/` | Blocs de page (hero, compétences, parcours…) | Lisent les données, composent des `ui/` |
| `src/components/ui/` | Primitives réutilisables ; `button-styles.ts` : les surfaces cliquables partagées (boutons, pagination) | Ne lisent aucune donnée : tout arrive par les props |
| `src/components/layout/` | Header et footer | Persistés entre les pages (`transition:persist`) |
| `src/data/` | Contenu éditable en TypeScript ; `ui.ts` : tous les textes de l'interface | Chaque contenu a sa version anglaise à côté (`…En`), vérifiée par `tests/data/` |
| `src/content/projects/` | Une fiche Markdown par projet ; `en/` : les mêmes en anglais | Schéma dans `src/content.config.ts`, vérifié au build |
| `src/lib/` | Logique pure : URL, langues, thème, projets, navigation, sommaire, pagination | Sans DOM, couverte à 100 % |
| `src/styles/global.css` | Thème Tailwind, calques du fond, utilitaires, rendu Markdown | Seule feuille de style globale |
| `src/assets/` | Images traitées par Vite (URL empreintée) | Celles que le CSS ou le code importent |
| `public/` | Fichiers servis tels quels (CV, favicon, images d'aperçu) | Nom stable : c'est lui qui fait l'URL |
| `tests/` | Vitest, rangé comme `src/` | Voir §5 |
| `e2e/` | Playwright : le site construit, dans Chromium | Voir §5 |
| `tools/` | Sources des images générées, archives | Jamais compilé ni servi |

## 3. Du contenu à la page

```text
src/data/*.ts ─────────────┐
src/content/projects/*.md ─┴─> src/lib/projects.ts ─> sections/ ─> components/pages/ ─> pages/ ─> dist/*.html
     (schéma : content.config.ts)    (tri, pagination)      (ui/)          (BaseLayout)
```

| URL (français) | Composant | Contenu |
| :--- | :--- | :--- |
| `/portfolio/` | `Home.astro` | Hero, compétences ×2, parcours, projets mis en avant, contact |
| `/portfolio/projects` | `ProjectsListPage.astro` | Première page de la liste (6 projets) |
| `/portfolio/projects/page/N` | `ProjectsListPage.astro` | Pages suivantes, générées selon le nombre de projets |
| `/portfolio/projects/<fichier>` | `ProjectDetail.astro` | Une fiche, son sommaire, les projets voisins |

La version anglaise a les mêmes routes, préfixées par `/en` :
`/portfolio/en/`, `/portfolio/en/projects/<fichier>`…

- **L'ordre des projets** est donné par `order` (croissant), partout : liste,
  accueil, projets précédent et suivant.
- **L'accueil** montre les trois premiers projets `featured: true`, ou les trois
  premiers tout court s'il n'y en a aucun.
- **Le site vit dans un sous-dossier** (`base: '/portfolio'`). Tout lien interne
  passe par `localizedUrl(chemin, langue)` (`src/lib/i18n.ts`), qui ajoute la
  base et, en anglais, `/en`. Un `href="/…"` écrit à la main pointerait à la
  racine du domaine, donc vers une 404, ou ferait changer de langue.

### Langues

- **La langue se lit dans l'URL** (`getLang`) : aucun composant ne la reçoit en
  prop. Chaque fichier de `src/pages/` et de `src/pages/en/` rend le même
  composant de `components/pages/`, qui s'adapte.
- **Les textes de l'interface** sont dans `src/data/ui.ts`, un dictionnaire par
  langue de forme identique : un texte oublié dans une langue arrête le build.
- **Les contenus longs** ont leur version anglaise à côté de la française :
  `navLinksEn`, `softSkillsEn`, `experiencesEn`, `educationEn`, et les fiches de
  `src/content/projects/en/`, sous le même nom de fichier. Les tests vérifient
  que les deux versions restent alignées (même nombre, même ordre, mêmes dates).
- **Le sélecteur de langue** (header) mène à la même page dans l'autre langue
  (`switchLangPath`), **au même endroit** : la section en cours est replacée au
  même pixel, ou, sur une fiche projet dont les ancres sont traduites, la même
  proportion de la page (`lib/lang-switch.ts`). La position est rétablie avant
  l'affichage, pendant le fondu du routeur, et le gabarit ne rejoue ni son
  entrée ni l'apparition des blocs déjà visibles. Le header et le footer sont
  persistés par langue (`transition:persist="header-fr"`…) : changer de langue
  les remplace.
- **Pour les moteurs de recherche**, chaque page déclare ses deux versions
  (`<link rel="alternate" hreflang>`), le français servant de défaut.
- Le CV n'existe qu'en français : la version anglaise le signale sur son bouton.

## 4. Dans le navigateur

**Navigation.** `<ClientRouter />` remplace le DOM au lieu de recharger la page.
Conséquence : le `<script>` d'un composant ne s'exécute qu'une fois, au premier
chargement. Tout comportement doit donc passer par `onEachPage()`
(`src/lib/enhance.ts`), qui le rejoue à chaque page et fournit un `AbortSignal`
à poser sur chaque écouteur, pour qu'aucun ne survive à la page suivante.

Chaque comportement est aussi vérifié de bout en bout, dans `e2e/`.

| Comportement | Script | Règle testée |
| :--- | :--- | :--- |
| Menu mobile, barre qui se détend, lien actif au défilement | `layout/Header.astro` | `lib/nav.ts` |
| Bouton de retour en haut | `ui/BackToTop.astro` | `lib/back-to-top.ts` |
| Glissement de la page active | `ui/Pagination.astro` | `lib/pagination.ts` |
| Sommaire des fiches et curseur de lecture | `ui/TableOfContents.astro` | `lib/toc.ts` |
| Bouton de thème, en fondu enchaîné | `layout/Header.astro` | `lib/theme.ts` |
| Lien de langue recalé après chaque navigation | `layout/Header.astro` | `lib/i18n.ts` |
| Position de lecture gardée en changeant de langue | `layout/Header.astro` | `lib/lang-switch.ts` |
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

### Thèmes

- **Le sombre est le thème par défaut** : c'est la palette de Tailwind, sans
  attribut. Le clair s'active par le bouton du header, qui pose
  `<html data-theme="light">` et mémorise le choix (`localStorage`, clé `theme`).
- **Aucun flash** : un script en ligne du `<head>` applique le thème mémorisé
  avant le premier rendu, et le reporte sur la page suivante à chaque
  navigation.
- **Un fondu au changement** : le bouton bascule le thème dans une View
  Transition (fondu enchaîné de toute la page, 0,4 s), qui couvre aussi ce que
  CSS ne sait pas animer, comme la matière qui s'inverse. Sans ce support, ou
  sous `prefers-reduced-motion`, le changement est immédiat.
- **Le clair retourne l'échelle `zinc`** au lieu d'ajouter des classes : sous
  `data-theme="light"`, `global.css` redonne à chaque nuance une valeur claire
  (`zinc-950`, le fond, devient un gris perle ; `zinc-100`, les titres, un
  graphite). Chaque composant garde ainsi la même hiérarchie dans les deux
  thèmes, sans une ligne de code en plus. Pas de blanc ni de noir purs : le
  contraste reste net sans fatiguer l'œil.
- **Ce qui change en plus** : la matière est inversée (plis gris sur fond
  clair) et l'accent argent devient un bleu acier. Les logos des compétences
  gardent leurs couleurs vives ; seule une marque qui disparaîtrait sur la tuile
  claire en porte une autre (`colorLight` : le noir de GitHub, le jaune assombri
  de JavaScript).
- **Un réglage propre au clair** s'écrit avec la variante `light:` (définie
  dans `global.css`), par exemple `light:hover:bg-zinc-900`.

## 5. Tests

```sh
npm test          # 576 tests, quelques secondes
npm run coverage  # idem, avec le seuil de couverture (80 %) exigé par la CI
npm run test:e2e  # 31 tests de bout en bout, une quinzaine de secondes
```

Deux niveaux, qui se complètent :

- **Vitest (`tests/`)** vérifie les règles et le HTML produit, couverts à
  100 %. Il ne voit pas les `<script>` des composants : Vite les compile à part,
  pour le navigateur.
- **Playwright (`e2e/`)** vérifie ce câblage sur le site construit, servi sous
  `/portfolio`, dans Chromium : barre de navigation, menu mobile, thème,
  langue et position de lecture, apparition au défilement, sommaire, retour en
  haut, pagination. Bureau pour tout, gabarit de téléphone pour
  `mobile.spec.ts`. Chaque test échoue aussi sur une erreur de console.
  Première fois : `npx playwright install --only-shell chromium`.

Côté Vitest :

- **Composants et pages** sont rendus sans navigateur par l'API Container
  d'Astro, puis interrogés comme un DOM (`linkedom`). Les aides sont dans
  `tests/helpers/render.ts`.
- **`astro:content`** n'existe pas hors d'un build : les tests le remplacent par
  sept projets factices (`tests/helpers/content.ts`).
- **Les données** sont vérifiées sur ce qui ne se voit pas à la relecture :
  format des périodes du parcours, contraste des couleurs de marque (dans les
  deux thèmes), icônes existantes, schéma et cohérence des fiches.
- **Les deux langues** sont vérifiées ensemble : dictionnaires de même forme,
  contenus anglais alignés sur les français, et pages anglaises dont aucun lien
  ne ramène vers le français.

## 6. Faire évoluer

| Je veux… | Je fais… |
| :--- | :--- |
| **Ajouter un projet** | Deux fichiers de même nom : `src/content/projects/mon-projet.md` et sa traduction dans `src/content/projects/en/`, avec l'en-tête décrit dans le README. Le nom devient l'URL. |
| **Ajouter une compétence** | Une entrée dans `src/data/skills.ts` (technique : une seule liste ; transversale : `softSkills` et `softSkillsEn`, au même rang). Une couleur de marque trop sombre fait échouer les tests : l'éclaircir, comme indiqué en tête du fichier. Une couleur quasi blanche, ou trop pâle pour la tuile claire comme le jaune de JavaScript, demande en plus `colorLight` pour le thème clair. |
| **Ajouter une expérience** | Une entrée dans `experiences` (ou `education`) et sa traduction au même rang dans `experiencesEn` (ou `educationEn`), dans `src/data/career.ts`. Les formats de période sont décrits en tête du fichier et vérifiés par les tests. |
| **Modifier un texte de l'interface** | `src/data/ui.ts`, dans les deux langues. |
| **Ajouter une section à l'accueil** | Un composant dans `sections/` basé sur `ui/Section.astro` avec un `id`, ses textes dans `ui.ts`, placé dans `components/pages/Home.astro`. Pour un lien dans la barre : l'ajouter dans `navLinks` et `navLinksEn` (`src/data/site.ts`), dans l'ordre des sections, avec l'`id` dans `sections`. |
| **Ajouter une page** | Son contenu dans `components/pages/`, enveloppé dans `BaseLayout`, liens via `localizedUrl()` ; puis un fichier qui le rend dans `src/pages/` et un dans `src/pages/en/`. Ajouter un test dans `tests/pages/`. |
| **Ajouter une langue** | L'ajouter à `languages` (`src/lib/i18n.ts`), lui donner un dictionnaire dans `ui.ts`, ses contenus (`…De`…), une collection dans `content.config.ts`, et ses fichiers dans `src/pages/<code>/`. Le sélecteur du header, prévu pour deux langues, devient alors une liste. |
| **Ajouter un comportement JS** | La règle dans `src/lib/` avec son test, le câblage dans le `<script>` du composant via `onEachPage((signal) => …)`, et un test de ce que voit le visiteur dans `e2e/`. |
| **Changer une couleur** | `--color-accent` dans `@theme` (`global.css`) pour le sombre, et dans le bloc `:root[data-theme="light"]` pour le clair, qui redéfinit aussi l'échelle `zinc`. Les autres teintes du sombre sont les gris `zinc` de Tailwind. |
| **Refaire l'image d'aperçu** | Modifier `tools/og.html`, la rendre (commande ci-dessous) sous un **nouveau nom** (`og-v6.png`), puis pointer `ogImageURL` dessus dans `BaseLayout`. LinkedIn garde en cache l'ancienne URL ; ne pas supprimer l'ancien fichier, les partages existants y pointent. |
| **Retoucher le fondu du fond** | Modifier `tools/chrome-fade/chrome-fade.svg`, puis `node tools/chrome-fade/render.mjs` (détails dans son README). |
| **Changer le nom du dépôt** | Le dossier de publication change : mettre à jour `base` dans `astro.config.mjs`, puis remplacer `/portfolio` dans `tests/` (`helpers/render.ts` et les tests qui vérifient des URL), dans `e2e/` et dans `playwright.config.ts`. |

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
        ┌──> build ──┐
test ───┤            ├──> deploy
        └──> e2e ────┘
```

| Job | Fait | Échoue si |
| :--- | :--- | :--- |
| `test` | `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run coverage` | Faille haute ou critique dans une dépendance de production, test rouge, couverture sous 80 % |
| `build` | `withastro/action` : installe, construit, dépose `dist/` comme artefact Pages | Erreur de build, dont une fiche projet invalide |
| `e2e` | `npm ci`, installe Chromium, `npm run test:e2e` (construit et sert le site lui-même) | Test de bout en bout rouge ; une relance est tentée avant d'échouer |
| `deploy` | `actions/deploy-pages` publie l'artefact de `build`, une fois `e2e` passé | Jamais lancé sur une pull request |

- **Un échec n'abîme rien** : tant que `deploy` ne s'est pas exécuté, le site en
  ligne reste la version précédente.
- **Permissions minimales** : aucune par défaut ; seul `deploy` peut écrire sur
  Pages.
- **Actions épinglées par empreinte de commit**, pas par tag (un tag peut être
  déplacé). Dependabot (`.github/dependabot.yml`) propose chaque semaine les
  montées de version des actions et des dépendances npm.
- **Un déploiement à la fois** (`concurrency: pages`), sans annuler celui en
  cours.
- **Ubuntu nommé** (`ubuntu-26.04`), pas `ubuntu-latest` : changer de version
  est un commit, pas une bascule imposée par GitHub. Pour monter, remplacer le
  label dans les quatre jobs, puis vérifier que le job `e2e` installe toujours
  Chromium (Playwright doit connaître la version).
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
