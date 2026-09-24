/**
 * Le glissement du calque actif de la pagination, sans DOM.
 *
 * La pagination navigue vers de vraies URL : la page est rechargée et le calque
 * de la page quittée n'existe plus. La page quittée est donc retenue en
 * `sessionStorage`, et au chargement suivant le calque part de son ancien
 * bouton pour revenir à sa place (technique FLIP). Le script du composant
 * mesure et anime ; ce qui décide est ici, et testé.
 */

/** Clé de la page quittée dans le stockage de session. */
export const PAGINATION_KEY = "pagination-from";

type PageStore = Pick<Storage, "getItem" | "setItem">;

/**
 * Lit la page quittée, puis retient la page courante pour la prochaine fois.
 *
 * Le stockage est passé par une fonction : en navigation privée, ou quand les
 * cookies sont bloqués, le simple accès à `sessionStorage` lève une erreur.
 * Tout échec ramène `null` — le glissement est un agrément, jamais une panne.
 */
export function rememberPage(
  getStore: () => PageStore,
  page: string | undefined,
): string | null {
  try {
    const store = getStore();
    const from = store.getItem(PAGINATION_KEY);

    if (page) store.setItem(PAGINATION_KEY, page);
    return from;
  } catch {
    return null;
  }
}

/**
 * Page d'où le calque doit glisser, ou `null` s'il est déjà à sa place : pas de
 * page quittée, ou retour sur la même page (rechargement).
 */
export function slideOrigin(from: string | null, page: string | undefined): string | null {
  return from && from !== page ? from : null;
}

/**
 * Décalage de départ du calque, en pixels, ou `null` s'il n'y a rien à animer :
 * mouvement réduit demandé, bouton de la page quittée absent (l'ellipsis a
 * bougé), ou même position.
 */
export function slideOffset(options: {
  motionOk: boolean;
  originLeft: number | undefined;
  currentLeft: number;
}): number | null {
  const { motionOk, originLeft, currentLeft } = options;

  if (!motionOk || originLeft === undefined) return null;

  const dx = originLeft - currentLeft;
  return dx === 0 ? null : dx;
}
