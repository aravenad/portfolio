# Architecture

Ce document explique **comment le site est construit et comment le faire
évoluer**. Le détail d'un choix vit en commentaire, à côté du code qu'il
justifie : ce document n'en donne que la carte.

## 1. En bref

- **Site statique.** Astro génère 36 pages HTML au build, 18 par langue, plus la page 404.
  Aucun serveur, aucune base de données : GitHub Pages sert le dossier `dist/`.
- **Deux langues, deux thèmes.** Français par défaut, anglais sous `/en/` ;
  thème sombre par défaut, clair sur choix du visiteur (§3 et §4).
- **Le contenu est séparé du code.** Textes, compétences, parcours et projets
  vivent dans `src/data/` et `src/content/`. Les modifier ne demande pas de
  toucher aux composants.
- **Le moins de JavaScript possible.** Un routeur de transitions et quelques
  comportements (~28 Ko, 9 Ko compressé). Sans JavaScript, tout le contenu
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
| `src/components/layout/` | Header et footer ; le footer ouvre le plan du site par-dessus la page (`popover`) | Persistés entre les pages (`transition:persist`) |
| `src/data/` | Contenu éditable en TypeScript ; `ui.ts` : tous les textes de l'interface | Chaque contenu a sa version anglaise à côté (`…En`), vérifiée par `tests/data/` |
| `src/content/projects/` | Une fiche Markdown par projet ; `en/` : les mêmes en anglais | Schéma dans `src/content.config.ts`, vérifié au build |
| `src/lib/` | Logique pure : URL, langues, thème, projets, navigation, sommaire, pagination, CV public, données structurées | Sans DOM, couverte à 100 % |
| `src/styles/global.css` | Thème Tailwind, calques du fond, utilitaires, rendu Markdown | Seule feuille de style globale |
| `src/assets/` | Images traitées par Vite (URL empreintée) | Celles que le CSS, le code ou les fiches importent |
| `public/` | Fichiers servis tels quels (CV, favicon, images d'aperçu) ; `demos/` : les démos jouables, construites dans le dépôt de chaque projet | Nom stable : c'est lui qui fait l'URL. Ne jamais retoucher `demos/` à la main |
| `tests/` | Vitest, rangé comme `src/` | Voir §5 |
| `e2e/` | Playwright : le site construit, dans Chromium | Voir §5 |
| `tools/` | Sources des images générées | Jamais compilé ni servi |

## 3. Du contenu à la page

```text
src/data/*.ts ─────────────┐
src/content/projects/*.md ─┴─> src/lib/projects.ts ─> sections/ ─> components/pages/ ─> pages/ ─> dist/*.html
     (schéma : content.config.ts)    (tri, pagination)      (ui/)          (BaseLayout)
```

| URL (français) | Composant | Contenu |
| :--- | :--- | :--- |
| `/` | `Home.astro` | Hero, compétences ×2, parcours, projets mis en avant, contact |
| `/projects` | `ProjectsListPage.astro` | Première page de la liste (6 projets) |
| `/projects/page/N` | `ProjectsListPage.astro` | Pages suivantes, générées selon le nombre de projets |
| `/projects/<fichier>` | `ProjectDetail.astro` | Une fiche, son sommaire, les projets voisins |
| `/colophon` | `ColophonPage.astro` | « Comment ce site est fait » : trame, thème, performance, chiffres avant et après (`src/data/colophon.ts`) |

La version anglaise a les mêmes routes, préfixées par `/en` :
`/en/`, `/en/projects/<fichier>`…

- **L'ordre des projets** est donné par `order` (croissant), partout : liste,
  accueil, projets précédent et suivant.
- **L'accueil** montre les trois premiers projets `featured: true`, ou les trois
  premiers tout court s'il n'y en a aucun.
- **Chaque carte projet a une couverture** (`ProjectCover.astro`) : un cadrage
  de la matière du haut de page, sous un motif au trait choisi par `cover`.
  Pas de capture d'écran : les projets sont trop anciens pour en avoir, et une
  capture jurerait avec la direction artistique.
- **Une fiche suit la grille du PPP** : le corps Markdown (contexte, objectifs,
  réalisation, résultats), puis `role`, les compétences du PN et `learned`,
  rendus par `ProjectDetail.astro` seulement s'ils sont renseignés. La fiche
  n'écrit que ses codes de SAÉ et d'AC ; `src/data/pn.ts` en donne les
  intitulés, `src/lib/competences.ts` range les AC par compétence et niveau, et
  `ProjectCompetences.astro` les affiche.
- **Une fiche peut avoir une démo jouable** (`demo`, voir plus bas), montrée
  sous l'en-tête de la fiche par `ProjectDemo.astro`.
- **Le site vit à la racine de son domaine** (`damien-aravena.fr`, sans
  `base`). Tout lien interne passe quand même par `localizedUrl(chemin, langue)`
  (`src/lib/i18n.ts`), qui ajoute la base s'il y en a une et, en anglais, `/en`.
  Il termine aussi chaque page par `/` (pas les fichiers) : GitHub Pages
  redirige sinon chaque clic d'une 301.
  Un `href="/…"` écrit à la main ferait changer de langue, et casserait tout
  retour dans un sous-dossier : les tests unitaires rendent donc les pages sous
  une base `/portfolio` fictive, pour qu'un tel lien y échoue.

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
  (`<link rel="alternate" hreflang>`), le français servant de défaut. Le plan
  du site (`@astrojs/sitemap`, `/sitemap-index.xml`) fait de même pour chaque
  URL, et `/robots.txt` (`src/pages/robots.txt.ts`) l'annonce. Le titre de
  l'accueil porte le nom complet, celui qu'on tape pour trouver le site.
  L'accueil décrit aussi la personne en données structurées (`Person`,
  JSON-LD, `src/lib/structured-data.ts`) : nom, études, ville et profils
  GitHub et LinkedIn, tirés des données du site.
- **L'aperçu d'un lien** (LinkedIn, messageries) montre `public/og-v5.png`,
  sauf sur une fiche, qui a sa propre carte : sa couverture tramée, son titre
  chromé, l'auteur, l'équipe et l'année (`src/assets/og/<langue>/<fiche>.jpg`,
  trouvée par `src/lib/og.ts` et passée au gabarit par la prop `image`). Vite
  lui donne une empreinte dans son nom : refaite, elle change d'URL, et
  LinkedIn la retélécharge sans renommage manuel.
- **La page 404** (`NotFoundPage.astro`) existe dans les deux langues, mais
  GitHub Pages ne sert que `404.html`, à la racine. Celle-ci rejoint donc la
  version anglaise (`/en/404/`), avant d'être peinte, pour une adresse sous
  `/en/` ; l'anglaise remet l'adresse demandée dans la barre
  (`history.replaceState`). Les deux sont en `noindex` (prop du gabarit), sans
  canonique ni `hreflang`, et hors du sitemap.
- Le CV existe dans les deux langues : `publicCv(lang)` (`src/lib/cv.ts`) donne
  le fichier et le nom de téléchargement de chacune (« CV » / « Resume »). C'est
  la seule source des liens, et elle ne sert que la version publique, sans
  téléphone ni adresse mail.

## 4. Dans le navigateur

**Navigation.** `<ClientRouter />` remplace le DOM au lieu de recharger la page.
Conséquence : le `<script>` d'un composant ne s'exécute qu'une fois, au premier
chargement. Tout comportement doit donc passer par `onEachPage()`
(`src/lib/enhance.ts`), qui le rejoue à chaque page et fournit un `AbortSignal`
à poser sur chaque écouteur, pour qu'aucun ne survive à la page suivante.
Les liens d'icônes du `<head>` portent `transition:persist` : sans cela, le
routeur les remplace et le navigateur les retélécharge à chaque page.

Chaque comportement est aussi vérifié de bout en bout, dans `e2e/`.

| Comportement | Script | Règle testée |
| :--- | :--- | :--- |
| Menu mobile, barre qui se détend, lien actif au défilement | `layout/Header.astro` | `lib/nav.ts` |
| Bouton de retour en haut | `ui/BackToTop.astro` | `lib/back-to-top.ts` |
| Copie de l'adresse e-mail à côté du lien `mailto:`, adresse affichée si la copie est refusée | `ui/CopyButton.astro` | `lib/copy.ts`, `e2e/contact.spec.ts` |
| Glissement de la page active | `ui/Pagination.astro` | `lib/pagination.ts` |
| Filtres de la liste des projets (statut, compétence, technologie), gardés dans l'adresse | `sections/ProjectsList.astro` | `lib/project-filters.ts`, `e2e/pages.spec.ts` |
| Sommaire des fiches et curseur de lecture | `ui/TableOfContents.astro` | `lib/toc.ts` |
| Bouton de thème, front de glyphes qui descend puis remonte | `layout/Header.astro` | `lib/theme.ts`, `lib/theme-front.ts` |
| Lien de langue recalé après chaque navigation | `layout/Header.astro` | `lib/i18n.ts` |
| Position de lecture gardée en changeant de langue | `layout/Header.astro` | `lib/lang-switch.ts` |
| Apparition au défilement, ancres depuis une autre page | `layouts/BaseLayout.astro` | Tests de page |
| Plan du site (`popover` natif) refermé en suivant un de ses liens | `layout/Footer.astro` | Tests de composant, `e2e/footer.spec.ts` |
| Texte replié sous lg (« Lire la suite » / « Réduire »), ouverture et fermeture animées | `ui/ReadMore.astro` | `e2e/mobile.spec.ts`, `e2e/pages.spec.ts` |
| Couleur de marque des pastilles à l'appui (écouteur pour Safari iOS) | `sections/Skills.astro` | `e2e/mobile.spec.ts` |
| Démo jouable chargée au clic, arrêtable, hauteur et niveaux réussis suivis par messages | `ProjectDemo.astro` | `lib/demo.ts`, `e2e/demo.spec.ts` |
| Captures agrandies au clic, zoom (molette, pincement, clic, clavier) et retour animé vers la miniature | `ImageViewer.astro` | `lib/viewer.ts`, `e2e/viewer.spec.ts` |
| Trame de glyphes du fond, de ses échos, des couvertures, des logos et du survol des boutons | `ui/GlyphField.astro`, `ui/GlyphEchoes.astro`, `ui/GlyphLogo.astro`, `ui/Button.astro` | `lib/glyph.ts` |

**Filtres des projets.** Chaque page de la liste porte toutes les fiches,
celles des autres pages masquées (`data-off-page`) : sans script, rien ne
change. Le script montre trois listes déroulantes, cherche dans tous les
projets dès qu'un critère est choisi et masque alors la pagination. Les
critères vont dans l'adresse (`?competence=optimiser`) par `replaceState`, pour
qu'un lien filtré se partage. Les choix proposés sont ceux que les fiches
contiennent.

**Démo jouable.** Le champ `demo` d'une fiche (`src`, dossier sous
`/demos/`, et `caption`, but du jeu et commandes) affiche sous l'en-tête une
image d'attente (`poster.webp`) et un lien « Jouer à la démo ». Rien de la démo
n'est chargé avant le clic : il crée une iframe en bac à sable
(`sandbox="allow-scripts"`, sans `allow-same-origin`), qui reçoit la langue,
le thème et `sound=1` dans l'URL (sans lui, le menu Pause affiche 0 % alors que
le son joue). Un bouton « Arrêter la démo », à droite de la légende, retire
l'iframe (et son son) et remet l'image ; le lien « Jouer » reprend le focus.
Sans JavaScript, ou au clic du milieu, le lien ouvre la
démo seule. La démo ne parle à la page que par `postMessage`, version `v: 1` ;
la page ne lit que les messages de sa propre iframe :

| Message | Champs | Effet |
| :--- | :--- | :--- |
| `ab:ready` | `level` | La démo remplace l'image et reçoit le focus (au plus tard 8 s après le clic) |
| `ab:size` | `height` | Hauteur conseillée, bornée entre 360 et 800 px |
| `ab:solved` | `level`, `time`, `errors` | Annoncé aux lecteurs d'écran (`role="status"`) |

Une iframe sans `allow-same-origin` a l'origine `null` : ses polices ne se
chargent qu'avec `Access-Control-Allow-Origin`. GitHub Pages l'envoie
(`*`) sur toutes ses réponses ; `server.headers` dans `astro.config.mjs` fait
de même pour `astro dev` et `astro preview`, sinon les tests de bout en bout
échouent sur les erreurs de la console. En dev, le greffon
`publicDirectoryIndex` (même fichier) sert aussi l'`index.html` d'un dossier
de `public/` et laisse passer vers ses fichiers les requêtes de l'iframe,
qu'Astro refuse sinon (`Sec-Fetch-Site: cross-site`). Les fichiers de `public/demos/` viennent
du dépôt du projet : pour Arrow Block, `npm run embed -- <chemin du portfolio>`
dans le dépôt du jeu les reconstruit et les recopie.

**Apparition au défilement.** Un script bloquant dans le `<head>` pose
`data-reveal-armed` avant le premier affichage ; le CSS ne masque les blocs
`.reveal` que sous ce drapeau. Si le module qui les révèle n'arrive pas dans
les 3 secondes, le drapeau est retiré et tout redevient visible. Sous
`prefers-reduced-motion`, rien n'est masqué ni animé.

**Style.** Tailwind v4, sans fichier de configuration : le thème est dans le
bloc `@theme` de `global.css`. Le fond de page est fait de deux calques sur
`body` : la matière métallique (`::before`, photo `chrome-original-hq.webp`
fondue par le masque `chrome-fade.webp` étiré sur `--matiere-hauteur`, 96rem,
et effacée sous les liens de la barre de navigation) et un grain fin (`::after`). Le
titre de l'accueil entre mot par mot, du flou au net (`.blur-word`), en CSS
seul ; le reste du gabarit monte en fondu (`.page-enter`).

**Trame de glyphes.** `ui/GlyphField.astro` recompose la matière en glyphes
ASCII (rampe ` ·:+×xX#`, tramage de Bayer 4×4, IBM Plex Mono) sur un canvas
persistant d'une page à l'autre. Elle lit une copie réduite de la matière
(`chrome-glyph.webp`, 480 px, 51 Ko, préchargée) : la photo pleine taille de
`body::before` n'est dessinée, donc téléchargée, que sans script (`html` sans
`data-glyph`).
Le même moteur trame les couvertures de projet (animées au survol de la carte)
ainsi que ses échos plus bas dans la page (`ui/GlyphEchoes.astro`) : une tache
tous les 66rem, d'un bord puis de l'autre (sur un écran de plus de 64rem),
entière dans la fenêtre et éteinte avant le bord, et le halo du pied de page.
Il trame aussi des logos (`ui/GlyphLogo.astro`) : ceux des tuiles de
compétences et les profils LinkedIn et GitHub du contact. La source est leur
propre SVG, rendu à un pixel par cellule de 4 px (16 × 16 en tuile, 10 × 10 au
contact). Ils sont dans la palette au repos, et au survol de leur hôte
(`[data-glyph-hote]`) ils prennent les couleurs de marque `--skill-color*`
(`lib/skills.ts`). Le SVG reste dans la page, effacé ; les puces mobiles
gardent leurs icônes vectorielles.
Enfin, chaque `ui/Button.astro` cache un fragment de la matière (cellules de
5 px, niveaux `NIVEAUX_BOUTON` plus clairs, cadrage différent d'un bouton à
l'autre) qui apparaît au survol ou au focus, s'éclaircit sous le libellé et
est balayé d'un reflet en 1,5 s. Sur le bouton plein, il passe en `difference`
(blanc, thème sombre) ou en `multiply` (graphite, thème clair).
Une seule boucle à 12 images/s, qui ne repeint que les cellules changées et
s'arrête hors écran. Les teintes sont les variables `--glyph-*` de
`global.css`, en OKLCH comme le reste, une palette par thème. L'interrupteur « Animer le fond » du
panneau de réglages pose `<html data-glyph="off">` (clé `glyph`) : chaque
surface se fige. Comme « Animer les titres », il est coupé par défaut sous
`prefers-reduced-motion`.
Pour le coût : l'atlas de glyphes est partagé par toutes les surfaces de même
taille et de mêmes teintes (vidé au changement de thème) ; une surface loin de
la fenêtre n'est construite qu'au repos (`requestIdleCallback`), ou dès qu'elle
approche ; les effacements d'une ligne sont fusionnés en un seul `clearRect` ;
et l'observateur de `<html>` ignore la réécriture des attributs par le routeur
quand ni le thème ni `data-glyph` n'ont changé.

### Thèmes

- **Le sombre est le thème par défaut** : c'est la palette de Tailwind, sans
  attribut, à un gris près : `zinc-500` y est éclairci pour que le plus
  discret des textes tienne 4,5:1. Aucun texte n'est écrit en `zinc-600` ni
  plus sombre, nuances réservées aux puces, filets et bordures. Le clair s'active par le bouton du header, qui pose
  `<html data-theme="light">` et mémorise le choix (`localStorage`, clé `theme`).
- **Aucun flash** : un script en ligne du `<head>` applique le thème mémorisé
  avant le premier rendu, et le reporte sur la page suivante à chaque
  navigation.
- **Un front de glyphes au changement** : le bouton bascule le thème dans une
  View Transition, qui couvre aussi ce que CSS ne sait pas animer, comme la
  matière qui s'inverse. Le nouveau thème se découvre du haut vers le bas, puis
  du bas vers le haut au changement suivant (1 s), derrière un bord irrégulier
  (colonnes décalées par une houle tirée au hasard), par un masque fondu sur
  l'épaisseur d'une bande de glyphes peinte sur un canvas (même rampe, même
  Bayer, mêmes teintes que la trame du fond ; `lib/theme-front.ts`). Pour la
  fluidité, le bord du masque est une image SVG dessinée une fois puis glissée
  par une animation du navigateur, dont l'horloge règle aussi le canvas ; celui-ci
  ne parcourt que les lignes du front. La trame du fond se fige pendant la
  course et se repeint aux nouvelles couleurs par tranches de 3 ms, lignes
  visibles d'abord, avant que le front ne l'atteigne. Sous `prefers-reduced-motion`, un simple fondu de
  0,6 s ; sans View Transitions, le changement est immédiat.
- **Le clair retourne l'échelle `zinc`** au lieu d'ajouter des classes : sous
  `data-theme="light"`, `global.css` redonne à chaque nuance une valeur claire
  (`zinc-950`, le fond, devient un papier crème `#ECE5DA` ; `zinc-100`, les
  titres, un graphite chaud). Chaque composant garde ainsi la même hiérarchie
  dans les deux thèmes, sans une ligne de code en plus. Pas de blanc ni de noir
  purs, dans aucun des deux thèmes : `white` et `black` prennent la teinte des
  gris (froide en sombre, chaude en clair), et le contraste reste net sans
  fatiguer l'œil. Le papier (92,4 % de luminance) remplace un gris perle froid
  plus lumineux, qui éblouissait au changement de thème.
- **Ce qui change en plus** : la matière est inversée (plis gris sur fond
  clair), l'accent argent devient un bleu acier, les ombres des boutons
  deviennent brunes et leurs arêtes crème, et le fil d'Ariane, posé sur la
  matière, prend un contour net couleur papier pour rester lisible. La trame
  du fond, plus dense en clair, fonce ses teintes basses pour rester visible. Les logos des compétences
  gardent leurs couleurs vives ; seule une marque qui disparaîtrait sur la tuile
  claire en porte une autre (`colorLight` : le noir de GitHub, de Symfony et de
  Linux, le marine de Flutter, le jaune assombri de JavaScript, le cyan assombri
  de Tailwind CSS).
- **Un réglage propre au clair** s'écrit avec la variante `light:` (définie
  dans `global.css`), par exemple `light:hover:bg-zinc-900`.

## 5. Tests

```sh
npm test          # 892 tests, quelques secondes
npm run coverage  # idem, avec le seuil de couverture (80 %) exigé par la CI
npm run test:e2e  # 94 tests de bout en bout, une quarantaine de secondes
```

Deux niveaux, qui se complètent :

- **Vitest (`tests/`)** vérifie les règles et le HTML produit, couverts à
  100 %. Il ne voit pas les `<script>` des composants : Vite les compile à part,
  pour le navigateur.
- **Playwright (`e2e/`)** vérifie ce câblage sur le site construit, servi à la
  racine, dans Chromium : barre de navigation, menu mobile, thème,
  langue et position de lecture, apparition au défilement, sommaire, retour en
  haut, pagination, plan du site, texte replié. Bureau pour tout, gabarit de
  téléphone pour `mobile.spec.ts`, dont les contrôles de mise en page tournent
  à 360 px : le Pixel 7 (412 px) ne voyait pas les défauts des écrans étroits. Chaque test échoue aussi sur une erreur de console, sauf celles qu'un fichier
  déclare attendues (`test.use({ expectedErrors })`), comme le statut 404 de la
  page introuvable. Les clics dans la barre passent par `clickInPlace`
  (`e2e/helpers.ts`), qui attend la cible immobile, ses transitions finies.
  Première fois : `npx playwright install --only-shell chromium`.

Côté Vitest :

- **Composants et pages** sont rendus sans navigateur par l'API Container
  d'Astro, puis interrogés comme un DOM (`linkedom`). Les aides sont dans
  `tests/helpers/render.ts`.
- **`astro:content`** n'existe pas hors d'un build : les tests le remplacent par
  sept projets factices (`tests/helpers/content.ts`).
- **Les données** sont vérifiées sur ce qui ne se voit pas à la relecture :
  format des périodes du parcours, contraste des couleurs de marque et des
  gris de texte (dans les deux thèmes, `tests/styles/contrast.test.ts`), icônes existantes, schéma et cohérence des fiches.
- **Les deux langues** sont vérifiées ensemble : dictionnaires de même forme,
  contenus anglais alignés sur les français, et pages anglaises dont aucun lien
  ne ramène vers le français.

## 6. Faire évoluer

| Je veux… | Je fais… |
| :--- | :--- |
| **Ajouter un projet** | Deux fichiers de même nom : `src/content/projects/mon-projet.md` et sa traduction dans `src/content/projects/en/`, avec l'en-tête décrit dans le README. Le nom devient l'URL. Puis `npm run og` pour sa carte d'aperçu : les tests la réclament. |
| **Ajouter une compétence** | Une entrée dans `src/data/skills.ts` (technique : une seule liste ; transversale : `softSkills` et `softSkillsEn`, au même rang). Les tuiles techniques vont par quatre, une rangée de la grille : les tests refusent une rangée incomplète. Une couleur de marque trop sombre fait échouer les tests : l'éclaircir, comme indiqué en tête du fichier. Une couleur quasi blanche, ou trop pâle pour la tuile claire comme le jaune de JavaScript, demande en plus `colorLight` pour le thème clair. |
| **Ajouter une expérience** | Une entrée dans `experiences` (ou `education`) et sa traduction au même rang dans `experiencesEn` (ou `educationEn`), dans `src/data/career.ts`. Les formats de période sont décrits en tête du fichier et vérifiés par les tests. |
| **Modifier un texte de l'interface** | `src/data/ui.ts`, dans les deux langues. |
| **Ajouter une section à l'accueil** | Un composant dans `sections/` basé sur `ui/Section.astro` avec un `id`, ses textes dans `ui.ts`, placé dans `components/pages/Home.astro`. Pour un lien dans la barre : l'ajouter dans `navLinks` et `navLinksEn` (`src/data/site.ts`), dans l'ordre des sections, avec l'`id` dans `sections`. |
| **Ajouter une page** | Son contenu dans `components/pages/`, enveloppé dans `BaseLayout`, liens via `localizedUrl()` ; puis un fichier qui le rend dans `src/pages/` et un dans `src/pages/en/`. Ajouter un test dans `tests/pages/`. |
| **Ajouter une langue** | L'ajouter à `languages` (`src/lib/i18n.ts`), lui donner un dictionnaire dans `ui.ts`, ses contenus (`…De`…), une collection dans `content.config.ts`, et ses fichiers dans `src/pages/<code>/`. Le sélecteur du header, prévu pour deux langues, devient alors une liste. |
| **Ajouter un comportement JS** | La règle dans `src/lib/` avec son test, le câblage dans le `<script>` du composant via `onEachPage((signal) => …)`, et un test de ce que voit le visiteur dans `e2e/`. |
| **Changer une couleur** | `--color-accent` dans `@theme` (`global.css`) pour le sombre, et dans le bloc `:root[data-theme="light"]` pour le clair, qui redéfinit aussi l'échelle `zinc`. Les autres teintes du sombre sont les gris `zinc` de Tailwind, sauf `zinc-500`, redéfini dans `@theme` ; un gris de texte sous 4,5:1 fait échouer les tests. |
| **Refaire l'image d'aperçu** | Modifier `tools/og.html`, la rendre (commande ci-dessous) sous un **nouveau nom** (`og-v6.png`), puis pointer `ogImageURL` dessus dans `BaseLayout`. LinkedIn garde en cache l'ancienne URL ; ne pas supprimer l'ancien fichier, les partages existants y pointent. Les cartes des fiches, elles, se refont par `npm run og` (titre, équipe, année ou couverture changés, ou retouche de `tools/og-projects/Card.astro`). |
| **Retoucher le fondu du fond** | Modifier `tools/chrome-fade/chrome-fade.svg`, puis `node tools/chrome-fade/render.mjs` (détails dans son README). |
| **Changer de domaine** | Mettre à jour `site` dans `astro.config.mjs` et `SITE_ORIGIN` dans `tests/helpers/render.ts`, le domaine personnalisé dans les réglages Pages du dépôt, puis les DNS chez le registraire (Infomaniak). Pour revenir sur `aravenad.github.io/portfolio`, remettre aussi `base: '/portfolio'` et le préfixe `/portfolio/` dans `e2e/` et `playwright.config.ts`. |

Rendu de l'image d'aperçu, depuis la racine du projet. Sous Windows, remplacer
`chrome` par le chemin complet de `chrome.exe` et l'URL par
`file:///C:/…/tools/og.html` :

```sh
chrome --headless=new --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1200,630 --screenshot=public/og-v6.png "file://$PWD/tools/og.html"
```

La police est Noto Sans, celle du site : elle doit être installée sur la
machine qui fait la capture (fonts.google.com), sinon Chrome en substitue une
autre. Vérifier le rendu avant de le publier.

Les cartes des fiches ne sont pas rendues par `astro build` : la trame de la
couverture se peint dans un `<canvas>`, que seul un navigateur sait dessiner,
et la CI n'en a pas. `npm run og` (`tools/og-projects/render.mjs`) lance son
propre `astro dev`, le seul à servir la page des cartes (`/__og/<langue>/<fiche>/`,
intégration `ogCards` d'`astro.config.mjs`), et la capture à 2× en JPEG dans le
Chromium de Playwright. Les cartes sont versionnées comme `og-v5.png`.

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
| `build` | `withastro/action` : installe, construit, dépose `dist/` comme artefact Pages ; puis le budget de performance (`tools/budget/`) | Erreur de build, dont une fiche projet invalide ; site construit au-dessus d'un plafond de taille |
| `e2e` | `npm ci`, installe Chromium, `npm run test:e2e` (construit et sert le site lui-même) | Test de bout en bout rouge ; une relance est tentée avant d'échouer. Les traces des essais ratés, même rattrapés, sont publiées (`playwright-traces`, 7 jours) |
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
- **Domaine** : `damien-aravena.fr`, acheté chez Infomaniak, qui en garde les
  DNS. Il est déclaré dans Settings → Pages (pas de fichier `CNAME` : avec un
  déploiement par Actions, GitHub l'ignore) et vérifié au niveau du compte, ce
  qui empêche un autre dépôt de le revendiquer. L'ancienne adresse
  `aravenad.github.io/portfolio/` redirige vers lui.

## 8. `tools/`

| Fichier | Sert à |
| :--- | :--- |
| `og.html` | Source de l'image d'aperçu `public/og-v5.png` (§6) |
| `og-projects/` | La page des cartes d'aperçu des fiches et leur rendu, `npm run og` (§6) |
| `chrome-fade/` | Source et script de rendu du masque de fondu du fond |
| `budget/` | Le budget de performance, `npm run budget` après un build, et en CI |

**Budget de performance.** `budget/budget.mjs` mesure `dist/` : JavaScript
total (brut et gzip), CSS gzip, page HTML la plus lourde et plus grosse image
servie (les JPEG, cartes d'aperçu, sont exclus). Chaque poste a un plafond,
15 à 20 % au-dessus de sa taille de novembre 2026 ; un dépassement fait
échouer le job `build`, donc le déploiement. Relever un plafond se fait dans
un commit qui dit pourquoi.

La page `/colophon` affiche ces plafonds et les mesures du jour
(`src/data/colophon.ts`) : un test vérifie qu'elle suit `LIMITS`, mais une
nouvelle mesure s'y reporte à la main, dans les deux langues.

Le dossier `tools/` ne contient dans le dépôt que ces sources. L'ancien fond
(`background-archive/`, commit `7b8785d`) et l'étude du fond (`metal-study/`)
ne vivent qu'en local.

Le CV n'est pas fabriqué ici. Ses sources, ses variantes et les candidatures
vivent dans `candidatures/`, exclu du dépôt parce qu'il porte le téléphone et
l'adresse mail. Le site n'en reçoit que les exports publics, copiés à la main
dans `public/cv-damien-aravena-bravo-public.pdf` et
`public/cv-damien-aravena-bravo-public-en.pdf` : un nouveau CV public, c'est ce
fichier à remplacer, sous le même nom. Les tests vérifient que les deux existent.
