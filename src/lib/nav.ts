/**
 * Les décisions de la barre de navigation, sans DOM.
 *
 * Elles vivaient dans les `<script>` de Header.astro, où ni les tests ni la
 * couverture ne les voyaient — alors que chacune a déjà produit un bug ou un
 * réglage délicat. Les scripts mesurent la page et appliquent le résultat ;
 * tout ce qui décide est ici, et testé.
 */

/** Comparaison insensible au slash final ("/projects" et "/projects/"). */
export function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/**
 * Valeur d'`aria-current` d'un lien de navigation, ou `undefined`.
 *
 * « page » pour la page elle-même. « true » — « l'élément courant d'un
 * ensemble », sans en préciser la nature — pour la rubrique dont on consulte
 * une sous-page : la fiche d'un projet, ou la deuxième page de la liste. Sans
 * cela, « Projets » s'éteignait dès qu'on ouvrait un projet.
 *
 * Les liens à ancre ne peuvent jamais être des parents : « /portfolio/#skills »
 * suivi d'une barre ne préfixe aucun chemin.
 *
 * Le rendu serveur l'appelle pour le premier écran, le script du header après
 * chaque navigation client — le header persiste, son `aria-current` resterait
 * sinon figé sur la page d'arrivée.
 */
export function ariaCurrentFor(
  href: string,
  currentPath: string,
): "page" | "true" | undefined {
  const path = normalizePath(href);
  const current = normalizePath(currentPath);

  if (path === current) return "page";
  if (current.startsWith(`${path}/`)) return "true";
  return undefined;
}

/**
 * Les deux états de la barre : nue et élargie en haut de page, avec son fond
 * dès qu'on descend.
 *
 * - en descendant, le fond apparaît dès `down` pixels, ce qui absorbe aussi le
 *   rebond élastique des navigateurs mobiles ;
 * - en remontant, la barre se détend plus tôt, pour que sa transition se joue
 *   pendant la remontée et non une fois arrivé en haut.
 */
export const BAR = {
  /** Seuil de défilement au-delà duquel la barre prend son fond. */
  down: 8,
  /** Détente anticipée au plus tôt, en pixels avant le haut de page. */
  returnMax: 200,
  /** Bas du texte de la barre : il se tient du 16e au 48e pixel. */
  textBottom: 48,
} as const;

/**
 * Hauteur sous laquelle la barre se détend en remontant.
 *
 * Au plus `returnMax`, et jamais au-delà du premier texte de la page : nue, la
 * barre ne doit se poser sur aucun mot. Sur l'accueil, le hero laisse toute la
 * marge ; sur les pages projets, le fil d'Ariane la réduit à ~58 px.
 */
export function barReturnThreshold(firstTextTop: number): number {
  return Math.max(BAR.down, Math.min(BAR.returnMax, firstTextTop - BAR.textBottom));
}

/** État de la barre après un défilement de `lastY` à `y`. */
export function nextBarScrolled(state: {
  scrolled: boolean;
  y: number;
  lastY: number;
  returnAt: number;
}): boolean {
  const { scrolled, y, lastY, returnAt } = state;

  if (y <= BAR.down) return false;
  if (y > lastY) return true;
  if (y < lastY && y < returnAt) return false;
  return scrolled;
}

/** État de la barre sans sens de défilement connu : chargement, navigation. */
export function initialBarScrolled(y: number): boolean {
  return y > BAR.down;
}

/**
 * Ligne de lecture du surlignage au défilement : au premier tiers de la
 * fenêtre, sous le header collant.
 */
export function readingLine(viewportHeight: number, headerHeight = 64): number {
  return headerHeight + (viewportHeight - headerHeight) * 0.3;
}

/**
 * Index de la section à surligner, ou -1.
 *
 * La dernière dont le haut a franchi la ligne de lecture, plutôt que celle qui
 * la croise : entre deux sections, le lien précédent reste allumé au lieu de
 * s'éteindre. En bas de page, la dernière section est forcée — sur un grand
 * écran, elle peut occuper la moitié de la fenêtre sans que son haut ait
 * franchi la ligne, et on ne peut plus défiler pour l'y amener.
 *
 * `tops` : haut de chaque section dans la fenêtre, dans l'ordre du document.
 */
export function activeSectionIndex(tops: number[], line: number, atBottom: boolean): number {
  if (tops.length === 0) return -1;
  if (atBottom) return tops.length - 1;

  let index = -1;
  let closest = -Infinity;

  tops.forEach((top, i) => {
    if (top <= line && top > closest) {
      closest = top;
      index = i;
    }
  });

  return index;
}
