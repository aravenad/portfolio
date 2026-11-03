/**
 * La visionneuse des captures d'écran légendées (ImageViewer.astro) : un clic
 * sur une figure l'agrandit en plein écran, où l'on peut zoomer et se déplacer.
 *
 * Les calculs (taille d'ajustement, zoom autour d'un point, bornes du
 * déplacement, trajet de l'animation) sont des fonctions pures, testées seules.
 * `wireViewer` les relie au DOM.
 */

/** Un point, en pixels CSS de la fenêtre. */
export interface Point {
  x: number;
  y: number;
}

/** Une largeur et une hauteur, en pixels CSS. */
export interface Size {
  width: number;
  height: number;
}

/** Un rectangle de la fenêtre, comme le donne `getBoundingClientRect()`. */
export type Box = Point & Size;

/**
 * Le zoom courant : l'échelle par rapport à l'image ajustée à l'écran, et le
 * décalage de son centre par rapport au centre de la scène.
 */
export interface View {
  scale: number;
  x: number;
  y: number;
}

export const IDENTITY: View = { scale: 1, x: 0, y: 0 };

/** Facteur d'un cran des boutons et du clavier. */
export const ZOOM_STEP = 1.5;

/** On peut toujours zoomer au moins jusque-là, même sur une petite image. */
export const MIN_MAX_SCALE = 3;

/**
 * La taille de l'image ajustée à la scène : entière, proportions gardées,
 * jamais agrandie au-delà de sa taille réelle (elle y serait floue sans
 * qu'on l'ait demandé).
 */
export function fitSize(natural: Size, stage: Size): Size {
  const ratio = Math.min(stage.width / natural.width, stage.height / natural.height, 1);

  return { width: natural.width * ratio, height: natural.height * ratio };
}

/**
 * L'échelle maximale : deux fois la taille réelle de l'image, pour lire le
 * détail d'une capture même sur un téléphone, où l'image ajustée est petite.
 */
export function maxScale(natural: Size, fit: Size): number {
  return Math.max(MIN_MAX_SCALE, (2 * natural.width) / fit.width);
}

/**
 * L'échelle d'un clic sur l'image : sa taille réelle, où le texte des captures
 * est net, mais au moins le double de l'image ajustée, pour qu'un clic sur
 * grand écran se voie.
 */
export function clickScale(natural: Size, fit: Size): number {
  return Math.min(maxScale(natural, fit), Math.max(2, natural.width / fit.width));
}

/**
 * Le décalage borné : l'image agrandie ne quitte jamais un bord de la scène
 * pour laisser du vide, et reste centrée sur un axe où elle tient entière.
 */
export function clampView(view: View, fit: Size, stage: Size, max: number): View {
  const scale = Math.min(max, Math.max(1, view.scale));
  const limitX = Math.max(0, (fit.width * scale - stage.width) / 2);
  const limitY = Math.max(0, (fit.height * scale - stage.height) / 2);
  const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value)) || 0;

  return { scale, x: clamp(view.x, limitX), y: clamp(view.y, limitY) };
}

/**
 * Change d'échelle en gardant immobile le point de l'image sous `point` (le
 * curseur, le milieu des deux doigts) ; `center` est le centre de la scène.
 * Non borné : `clampView` s'en charge.
 */
export function zoomAt(view: View, scale: number, point: Point, center: Point): View {
  const ratio = scale / view.scale;

  return {
    scale,
    x: point.x - center.x - (point.x - center.x - view.x) * ratio,
    y: point.y - center.y - (point.y - center.y - view.y) * ratio,
  };
}

/**
 * Pincer à deux doigts : l'écart entre eux règle l'échelle, autour de leur
 * ancien milieu, et le déplacement de ce milieu fait glisser l'image.
 */
export function pinch(view: View, from: [Point, Point], to: [Point, Point], center: Point): View {
  const distance = ([a, b]: [Point, Point]) => Math.hypot(a.x - b.x, a.y - b.y);
  const middle = ([a, b]: [Point, Point]) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const before = middle(from);
  const after = middle(to);
  const zoomed = zoomAt(view, view.scale * (distance(to) / (distance(from) || 1)), before, center);

  return { ...zoomed, x: zoomed.x + after.x - before.x, y: zoomed.y + after.y - before.y };
}

/** Le facteur d'un pas de molette : un cran de souris (100 px) zoome d'environ 20 %. */
export function wheelFactor(deltaY: number, deltaMode: number): number {
  // `deltaMode` 1 compte en lignes (Firefox avec une souris), 2 en pages.
  const pixels = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1);

  return Math.exp(-pixels * 0.002);
}

/** La transformation CSS d'un zoom, autour du centre de l'image. */
export function viewTransform({ scale, x, y }: View): string {
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

/**
 * La transformation qui pose l'image de la visionneuse (`to`, sans zoom) sur
 * la miniature (`from`) : le point de départ de l'ouverture, et d'arrivée de la
 * fermeture. Les deux ont les mêmes proportions, une seule échelle suffit.
 */
export function flipView(from: Box, to: Box): View {
  return {
    scale: from.width / to.width,
    x: from.x + from.width / 2 - (to.x + to.width / 2),
    y: from.y + from.height / 2 - (to.y + to.height / 2),
  };
}

/** Ce que la visionneuse utilise de la page. */
export interface ViewerParts {
  dialog: HTMLDialogElement;
  /** Le voile derrière l'image, qui apparaît en fondu. */
  backdrop: HTMLElement;
  /** La zone où l'image est ajustée, et où se font les gestes. */
  stage: HTMLElement;
  image: HTMLImageElement;
  caption: HTMLElement;
  zoomIn: HTMLButtonElement;
  zoomOut: HTMLButtonElement;
  close: HTMLButtonElement;
  /** Le niveau de zoom affiché, en pourcentage de l'image ajustée. */
  level: HTMLElement;
  /** Ce qui entre en fondu après l'image : la légende, les boutons. */
  chrome: HTMLElement[];
}

export interface ViewerOptions {
  /** La langue du niveau de zoom affiché (« 150 % », "150%"). */
  lang: string;
}

/** Ce que la visionneuse utilise de la fenêtre. */
export type ViewerWindow = Pick<Window, "addEventListener" | "matchMedia">;

/** Durée de l'ouverture et de la fermeture, en millisecondes. */
export const OPEN_DURATION = 420;
export const CLOSE_DURATION = 320;

/**
 * Un assouplissement cubique : le mouvement s'étale sur toute la durée au lieu
 * d'être joué dans le premier quart (voir global.css, apparition au défilement).
 */
const EASE = "cubic-bezier(0.33, 1, 0.68, 1)";

/** Au-delà de ce déplacement, en pixels, un appui devient un glissement, plus un clic. */
const TAP_SLOP = 6;

/** Le rayon des miniatures, `.prose img` dans global.css. */
const THUMB_RADIUS = 12;

/**
 * Fait de chaque image de figure un bouton qui ouvre la visionneuse. Le bouton
 * est ajouté par le script : sans lui, il ne ferait rien. Son nom est le texte
 * alternatif de l'image, suivi de ce qu'il fait.
 */
export function enhanceFigures(images: Iterable<HTMLImageElement>, open: string): HTMLButtonElement[] {
  const buttons: HTMLButtonElement[] = [];

  for (const image of images) {
    const document = image.ownerDocument;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "figure-zoom";
    button.setAttribute("aria-haspopup", "dialog");

    const label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = ` ${open}`;

    image.replaceWith(button);
    button.append(image, label);
    buttons.push(button);
  }

  return buttons;
}

/**
 * Câble la visionneuse. L'image s'envole de sa miniature jusqu'au centre de
 * l'écran pendant que le voile apparaît, puis la légende et les boutons
 * suivent ; à la fermeture, elle y retourne, depuis son zoom du moment.
 *
 * Le zoom : molette ou pincement autour du curseur ou des doigts, clic sur
 * l'image pour passer à la taille réelle et revenir, boutons et touches
 * `+`, `-` et `0`. Agrandie, l'image se déplace au glisser ou aux flèches.
 * Un clic à côté de l'image, le bouton de fermeture ou Échap la referment.
 *
 * ⚠️ Tous les écouteurs portent le `signal` d'`onEachPage`.
 */
export function wireViewer(
  parts: ViewerParts,
  triggers: HTMLButtonElement[],
  win: ViewerWindow,
  signal: AbortSignal,
  options: ViewerOptions,
): void {
  const { dialog, backdrop, stage, image, caption, zoomIn, zoomOut, close, level, chrome } = parts;
  const percent = new Intl.NumberFormat(options.lang, { style: "percent" });

  let trigger: HTMLButtonElement | undefined;
  let natural: Size = { width: 1, height: 1 };
  let fit: Size = { width: 1, height: 1 };
  let max = MIN_MAX_SCALE;
  let view = IDENTITY;
  let opening = false;
  let closing = false;

  const reduced = () => win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const thumbnail = () => trigger?.querySelector("img");

  const stageSize = (): Size => ({ width: stage.clientWidth, height: stage.clientHeight });

  const stageCenter = (): Point => {
    const box = stage.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };

  /** Le rectangle de l'image ajustée, sans zoom : ce que vise l'animation. */
  const fitBox = (): Box => {
    const { x, y } = stageCenter();
    return { x: x - fit.width / 2, y: y - fit.height / 2, ...fit };
  };

  const setView = (next: View) => {
    view = clampView(next, fit, stageSize(), max);
    image.style.transform = viewTransform(view);
    dialog.toggleAttribute("data-zoomed", view.scale > 1.001);
    level.textContent = percent.format(view.scale);
    zoomOut.disabled = view.scale <= 1.001;
    zoomIn.disabled = view.scale >= max - 0.001;
    // Un bouton désactivé perd le focus, qui sortirait de la visionneuse : il
    // passe au bouton inverse, et le clavier garde la main.
    for (const [button, other] of [[zoomOut, zoomIn], [zoomIn, zoomOut]]) {
      if (button.disabled && button.ownerDocument.activeElement === button) other.focus();
    }
  };

  /** Ajuste l'image à la scène : à l'ouverture et quand la fenêtre change de taille. */
  const layout = () => {
    const previous = fit;
    fit = fitSize(natural, stageSize());
    max = maxScale(natural, fit);
    image.style.width = `${fit.width}px`;
    image.style.height = `${fit.height}px`;
    // Le décalage suit la nouvelle taille, pour garder le même endroit au centre.
    const ratio = fit.width / previous.width;
    setView({ ...view, x: view.x * ratio, y: view.y * ratio });
  };

  const zoomBy = (factor: number, point = stageCenter()) =>
    setView(zoomAt(view, Math.min(max, Math.max(1, view.scale * factor)), point, stageCenter()));

  const fade = (elements: HTMLElement[], from: number, to: number, duration: number, delay = 0) => {
    for (const element of elements) {
      element.animate([{ opacity: from }, { opacity: to }], {
        duration,
        delay,
        easing: "ease-out",
        fill: "backwards",
      });
    }
  };

  /**
   * Le trajet de l'image entre la miniature (`thumb`) et un zoom de la scène
   * (`view`). Les coins gardent à l'écran l'arrondi de la miniature tout du
   * long : l'échelle de l'image les agrandirait sinon avec elle.
   */
  const flight = (thumb: View, view: View) => [
    { transform: viewTransform(thumb), borderRadius: `${THUMB_RADIUS / thumb.scale}px` },
    { transform: viewTransform(view), borderRadius: `${THUMB_RADIUS}px` },
  ];

  const open = async (button: HTMLButtonElement) => {
    const thumb = button.querySelector("img");
    if (!thumb || opening || dialog.open) return;
    opening = true;
    trigger = button;

    natural = { width: thumb.naturalWidth || thumb.width, height: thumb.naturalHeight || thumb.height };
    image.src = thumb.currentSrc || thumb.src;
    image.alt = thumb.alt;
    caption.textContent = button.closest("figure")?.querySelector("figcaption")?.textContent ?? "";
    // L'image est déjà chargée par la miniature : la décoder avant d'ouvrir
    // évite une première image vide au départ de l'animation.
    await image.decode().catch(() => {});
    opening = false;

    view = IDENTITY;
    fit = { width: 1, height: 1 };
    dialog.showModal();
    layout();

    if (reduced()) {
      fade([dialog], 0, 1, 150);
      return;
    }

    const keyframes = flight(flipView(thumb.getBoundingClientRect(), fitBox()), IDENTITY);
    thumb.style.opacity = "0";
    image.animate(keyframes, { duration: OPEN_DURATION, easing: EASE });
    fade([backdrop], 0, 1, OPEN_DURATION * 0.8);
    fade(chrome, 0, 1, 250, OPEN_DURATION * 0.5);
  };

  /** Referme pour de bon, sans animation : aussi quand le navigateur ferme seul. */
  const reset = () => {
    for (const animation of [image, backdrop, dialog, ...chrome].flatMap((el) => el.getAnimations())) {
      animation.cancel();
    }
    for (const element of [backdrop, ...chrome]) element.style.opacity = "";
    const thumb = thumbnail();
    if (thumb) thumb.style.opacity = "";
    if (dialog.open) dialog.close();
    view = IDENTITY;
    closing = false;
  };

  const shut = () => {
    if (!dialog.open || closing) return;
    closing = true;
    const thumb = thumbnail();

    if (reduced() || !thumb) {
      dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).finished.then(reset, reset);
      return;
    }

    // Repart du zoom du moment, même si l'ouverture n'était pas finie.
    for (const animation of image.getAnimations()) animation.cancel();
    const keyframes = flight(flipView(thumb.getBoundingClientRect(), fitBox()), view).reverse();
    fade([backdrop], 1, 0, CLOSE_DURATION);
    fade(chrome, 1, 0, 150);
    for (const element of [backdrop, ...chrome]) element.style.opacity = "0";
    image
      .animate(keyframes, { duration: CLOSE_DURATION, easing: EASE, fill: "forwards" })
      .finished.then(reset, reset);
  };

  for (const button of triggers) {
    button.addEventListener("click", () => void open(button), { signal });
  }

  close.addEventListener("click", shut, { signal });
  zoomIn.addEventListener("click", () => zoomBy(ZOOM_STEP), { signal });
  zoomOut.addEventListener("click", () => zoomBy(1 / ZOOM_STEP), { signal });

  // Échap : le navigateur fermerait d'un coup, sans le retour vers la miniature.
  dialog.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      shut();
    },
    { signal },
  );

  dialog.addEventListener(
    "close",
    () => {
      reset();
      // Le focus revient au bouton qui a ouvert, sans faire défiler la page.
      trigger?.focus({ preventScroll: true });
    },
    { signal },
  );

  dialog.addEventListener(
    "keydown",
    (event) => {
      if (closing || event.ctrlKey || event.metaKey || event.altKey) return;
      const pan = 80;
      const moves: Record<string, () => void> = {
        "+": () => zoomBy(ZOOM_STEP),
        "=": () => zoomBy(ZOOM_STEP),
        "-": () => zoomBy(1 / ZOOM_STEP),
        "0": () => setView(IDENTITY),
        ArrowLeft: () => setView({ ...view, x: view.x + pan }),
        ArrowRight: () => setView({ ...view, x: view.x - pan }),
        ArrowUp: () => setView({ ...view, y: view.y + pan }),
        ArrowDown: () => setView({ ...view, y: view.y - pan }),
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      move();
    },
    { signal },
  );

  dialog.addEventListener(
    "wheel",
    (event) => {
      // Ni la page derrière, ni le zoom du navigateur (pincement au pavé tactile).
      event.preventDefault();
      if (closing) return;
      zoomBy(wheelFactor(event.deltaY, event.deltaMode), { x: event.clientX, y: event.clientY });
    },
    { passive: false, signal },
  );

  /*
   * Les gestes, à la souris comme au doigt. Un doigt (ou la souris) déplace
   * l'image agrandie ; deux doigts la pincent. Un appui relâché sans avoir
   * bougé est un clic : sur l'image, il zoome ou revient ; à côté, il ferme.
   */
  const pointers = new Map<number, Point>();
  let tap: (Point & { onImage: boolean }) | undefined;

  stage.addEventListener(
    "pointerdown",
    (event) => {
      if (closing || event.button !== 0) return;
      stage.setPointerCapture(event.pointerId);
      const point = { x: event.clientX, y: event.clientY };
      pointers.set(event.pointerId, point);
      tap = pointers.size === 1 ? { ...point, onImage: event.target === image } : undefined;
      dialog.setAttribute("data-gesture", "");
    },
    { signal },
  );

  stage.addEventListener(
    "pointermove",
    (event) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const point = { x: event.clientX, y: event.clientY };

      if (tap && Math.hypot(point.x - tap.x, point.y - tap.y) > TAP_SLOP) tap = undefined;

      if (pointers.size === 1 && !tap) {
        setView({ ...view, x: view.x + point.x - previous.x, y: view.y + point.y - previous.y });
      } else if (pointers.size === 2) {
        const other = [...pointers].find(([id]) => id !== event.pointerId)![1];
        setView(pinch(view, [previous, other], [point, other], stageCenter()));
      }

      pointers.set(event.pointerId, point);
    },
    { signal },
  );

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return;
    if (pointers.size === 0) dialog.removeAttribute("data-gesture");
    if (event.type !== "pointerup" || !tap) return;

    const { onImage, ...point } = tap;
    tap = undefined;
    if (!onImage) {
      shut();
    } else if (view.scale > 1.001) {
      setView(IDENTITY);
    } else {
      setView(zoomAt(view, clickScale(natural, fit), point, stageCenter()));
    }
  };

  stage.addEventListener("pointerup", release, { signal });
  stage.addEventListener("pointercancel", release, { signal });

  win.addEventListener(
    "resize",
    () => {
      if (dialog.open && !closing) layout();
    },
    { signal },
  );

  // Une navigation emporte la page et sa visionneuse : la miniature, elle, doit reparaître.
  signal.addEventListener("abort", () => {
    const thumb = thumbnail();
    if (thumb) thumb.style.opacity = "";
  });
}
