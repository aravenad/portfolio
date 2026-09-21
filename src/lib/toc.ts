import type { MarkdownHeading } from "astro";

/**
 * Règles du sommaire des fiches projet, isolées du composant qui les affiche.
 *
 * Elles vivent ici pour être vérifiables : la moitié d'entre elles ne s'exécute
 * que dans le navigateur, au défilement, où rien ne signale une erreur — le
 * mauvais titre est simplement surligné. Le surlignage de la navigation
 * principale, resté dans le `<script>` du header, a déjà coûté deux bugs pour
 * cette raison, et celui-ci en a coûté deux de plus, mesurés seulement une fois
 * le défilement rejoué de bout en bout (voir tests/lib/toc.test.ts).
 */

/** Hauteur du header collant, en pixels (`h-16`). */
export const HEADER_HEIGHT = 64;

/** Position de la ligne de lecture dans l'espace laissé sous le header. */
const READING_LINE = 0.3;

/**
 * Les titres que le sommaire reprend.
 *
 * Le `h1` est le titre de la fiche, affiché juste au-dessus : le reprendre
 * n'ajouterait qu'un lien vers l'écran courant. Au-delà du `h3`, les entrées
 * deviennent trop nombreuses et trop longues pour une colonne de 15 rem — un
 * sommaire qui déborde ne se lit plus d'un coup d'œil, et c'est tout ce qu'on
 * lui demande.
 */
export function getTocEntries(headings: MarkdownHeading[]): MarkdownHeading[] {
  return headings.filter(({ depth }) => depth === 2 || depth === 3);
}

/**
 * Hauteur à laquelle un titre est considéré comme atteint, comptée depuis le
 * haut de la fenêtre. Elle part du bas du header : les pixels qu'il recouvre ne
 * sont pas lus, et les compter décalerait la ligne vers le haut sur les petits
 * écrans, là où il occupe déjà une part notable de la fenêtre.
 *
 * ⚠️ ELLE DESCEND EN FIN DE PAGE, et ce n'est pas un raffinement.
 *
 * Les dernières sections d'une fiche ne peuvent plus remonter jusqu'à une ligne
 * fixe : le défilement s'arrête avant. La version précédente forçait donc la
 * dernière section une fois le bas atteint — elle apparaissait d'un coup, en
 * sautant celles d'avant, qui ne s'allumaient jamais.
 *
 * La ligne glisse plutôt vers le bas de la fenêtre à mesure qu'il reste moins à
 * défiler : chaque section restante la franchit à son tour, et la dernière est
 * atteinte exactement en fin de course. Aucun cas particulier, aucun saut.
 */
export function readingLine(viewportHeight: number, remainingScroll: number): number {
  const line = HEADER_HEIGHT + (viewportHeight - HEADER_HEIGHT) * READING_LINE;

  // Ce qui sépare la ligne du bas de la fenêtre : la course qu'il lui reste.
  const slack = viewportHeight - line;

  // `max(…, 0)` : un défilement élastique peut dépasser le bas du document.
  return remainingScroll >= slack ? line : viewportHeight - Math.max(remainingScroll, 0);
}

/**
 * Index du titre à surligner, parmi les hauts de titres donnés dans l'ordre du
 * document, ou -1 quand aucun ne l'est.
 *
 * « Le dernier titre dont le haut a franchi la ligne » plutôt que « celui qui la
 * croise » : entre deux titres, l'entrée précédente reste allumée au lieu de
 * s'éteindre.
 *
 * ⚠️ La PREMIÈRE section n'attend pas la ligne. Le chapeau d'une fiche — titre,
 * résumé, étiquettes — fait à lui seul plus de 600 px : le premier titre est
 * déjà entré par le bas de l'écran, et sa section occupe le tiers inférieur,
 * bien avant d'atteindre la ligne de lecture. Mesuré, le sommaire restait éteint
 * pendant le cinquième du défilement. Il s'allume donc dès que le premier titre
 * est visible.
 *
 * Ce n'est pas la règle « la section la plus visible », essayée puis écartée :
 * elle privilégie les sections longues, et sur une fiche réelle trois entrées
 * sur huit ne s'allumaient jamais — une section courte prise entre deux longues
 * n'est jamais la plus grande. Le franchissement, lui, garantit à chacune son
 * tour.
 */
export function activeHeadingIndex(
  tops: number[],
  line: number,
  viewportHeight: number,
): number {
  let active = -1;

  for (const [index, top] of tops.entries()) {
    if (top <= line) active = index;
  }

  if (active === -1 && tops.length > 0 && tops[0] <= viewportHeight) return 0;

  return active;
}

/**
 * Fraction déjà parcourue d'une section, entre 0 et 1.
 *
 * C'est ce qui rend le curseur continu : le surlignage, lui, ne peut que sauter
 * d'une entrée à l'autre — un état par entrée, qui ne change qu'une fois tous
 * les deux cents pixels sur une fiche réelle. Entre deux changements, rien ne
 * bougeait. La fraction, elle, avance à chaque pixel de défilement.
 *
 * Le point de lecture est la ligne de lecture elle-même, si bien que le curseur
 * et le surlignage ne peuvent pas se contredire : la fraction retombe à zéro
 * exactement quand la ligne franchit le titre suivant.
 */
export function sectionRatio(start: number, end: number, point: number): number {
  // Une section vide — deux titres qui se suivent — n'a pas de milieu.
  if (end <= start) return 0;

  return Math.min(Math.max((point - start) / (end - start), 0), 1);
}

/** Interpolation linéaire, pour glisser d'une entrée du sommaire à la suivante. */
export function lerp(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio;
}

/**
 * Regroupe des liens par ancre visée, dans l'ordre de leur première apparition.
 *
 * Le sommaire est rendu deux fois — une forme repliée sous `lg`, une colonne
 * au-delà — donc chaque titre est visé par deux liens. Le surlignage, lui,
 * raisonne par section : il lui faut un titre par entrée, dans l'ordre du
 * document, et la liste des liens à allumer ensemble.
 *
 * L'ordre d'insertion d'une `Map` suffit à retrouver celui du document : les
 * deux formes rendent les mêmes entrées dans le même ordre, donc la première
 * apparition de chaque ancre suit le corps de la fiche.
 */
export function groupByAnchor<T>(
  links: T[],
  anchorOf: (link: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const link of links) {
    const anchor = anchorOf(link);
    const group = groups.get(anchor);

    if (group) group.push(link);
    else groups.set(anchor, [link]);
  }

  return groups;
}
