/**
 * La démo jouable d'une fiche projet (ProjectDemo.astro) : l'adresse de son
 * iframe et la lecture des messages qu'elle envoie.
 *
 * Le contrat vient du dépôt du jeu (Arrow Block) : la page passe la langue et
 * le thème dans l'URL, la démo répond par `postMessage`. Chaque message porte
 * `v: 1`, pour que le format puisse évoluer sans casser une page déjà publiée :
 * un message d'une autre version est ignoré.
 */
import type { Theme } from "./theme";

export type DemoMessage =
  /** La démo a dessiné sa première image : l'image d'attente peut partir. */
  | { type: "ready" }
  /** Hauteur conseillée pour la largeur de l'iframe, en pixels CSS. */
  | { type: "size"; height: number }
  /** Un niveau réussi, en `time` secondes. */
  | { type: "solved"; time: number };

/** Bornes de la hauteur de l'iframe : une valeur aberrante ne doit pas casser la page. */
export const DEMO_MIN_HEIGHT = 360;
export const DEMO_MAX_HEIGHT = 800;

/** Adresse de la démo, dans la langue et le thème de la page. */
export function demoUrl(src: string, lang: string, theme?: Theme): string {
  const params = new URLSearchParams({ lang });
  if (theme) params.set("theme", theme);

  return `${src}?${params}`;
}

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Le message reçu, s'il respecte le contrat ; `null` sinon. L'expéditeur, lui,
 * est vérifié par l'appelant (`event.source`) : dans un bac à sable, l'origine
 * de l'iframe vaut `"null"` et ne prouve rien.
 */
export function readDemoMessage(data: unknown): DemoMessage | null {
  if (!data || typeof data !== "object") return null;
  const message = data as Record<string, unknown>;
  if (message.v !== 1) return null;

  switch (message.type) {
    case "ab:ready":
      return { type: "ready" };
    case "ab:size":
      return isNumber(message.height) ? { type: "size", height: demoHeight(message.height) } : null;
    case "ab:solved":
      return isNumber(message.time) && message.time >= 0 ? { type: "solved", time: message.time } : null;
    default:
      return null;
  }
}

/** La hauteur conseillée, arrondie et bornée. */
export function demoHeight(height: number): number {
  return Math.min(DEMO_MAX_HEIGHT, Math.max(DEMO_MIN_HEIGHT, Math.round(height)));
}

/** Le texte annoncé après un niveau réussi : `{time}` y devient la durée, au dixième. */
export function solvedText(template: string, time: number, lang: string): string {
  const seconds = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(time);

  return template.replace("{time}", seconds);
}

/** Ce que la démo utilise de la page : le bloc, le lien « Jouer », la scène et la zone annoncée. */
export interface DemoParts {
  /** Porte l'état dans `data-state` : absent, puis `loading`, puis `ready`. */
  root: HTMLElement;
  play: HTMLElement;
  stage: HTMLElement;
  status: HTMLElement;
}

export interface DemoOptions {
  /** Le dossier de la démo, base du site comprise. */
  src: string;
  lang: string;
  theme: Theme;
  /** Titre de l'iframe, pour les lecteurs d'écran. */
  title: string;
  loading: string;
  /** Modèle de l'annonce d'un niveau réussi, voir `solvedText`. */
  solved: string;
}

/** Ce que la démo utilise de la fenêtre. */
export type DemoWindow = Pick<Window, "addEventListener">;

/**
 * Délai au-delà duquel la démo s'affiche même sans `ab:ready` : un message
 * perdu ne doit pas laisser le visiteur devant l'image d'attente.
 */
export const DEMO_READY_TIMEOUT = 8000;

/**
 * Câble la démo. Sans script, le lien « Jouer » ouvre la démo en pleine page ;
 * ici, un clic simple la charge à la place de l'image d'attente, dans une
 * iframe en bac à sable (scripts seulement : ni stockage, ni formulaire, ni
 * navigation de la page). Un clic avec Ctrl, Maj ou la molette garde le
 * comportement du lien.
 *
 * ⚠️ Tous les écouteurs portent le `signal` d'`onEachPage`, et le délai
 * d'attente est annulé avec lui.
 */
export function wireDemo(
  parts: DemoParts,
  win: DemoWindow,
  signal: AbortSignal,
  options: DemoOptions,
): void {
  const { root, play, stage, status } = parts;
  let frame: HTMLIFrameElement | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const reveal = () => {
    clearTimeout(timer);
    if (!frame || root.dataset.state === "ready") return;
    root.dataset.state = "ready";
    status.textContent = "";
    // Le clavier passe dans le jeu : les flèches tournent la forme, sans faire défiler la page.
    frame.focus({ preventScroll: true });
  };

  const start = () => {
    if (frame) return;
    frame = root.ownerDocument.createElement("iframe");
    frame.src = demoUrl(options.src, options.lang, options.theme);
    frame.title = options.title;
    frame.setAttribute("sandbox", "allow-scripts");
    root.dataset.state = "loading";
    status.textContent = options.loading;
    stage.append(frame);
    timer = setTimeout(reveal, DEMO_READY_TIMEOUT);
  };

  play.addEventListener(
    "click",
    (event) => {
      const click = event as MouseEvent;
      const modified = click.ctrlKey || click.metaKey || click.shiftKey || click.altKey;
      if (click.button !== 0 || modified) return;
      event.preventDefault();
      start();
    },
    { signal },
  );

  win.addEventListener(
    "message",
    (event) => {
      // L'origine d'une iframe en bac à sable vaut "null" : seule sa fenêtre prouve qui écrit.
      if (!frame || event.source !== frame.contentWindow) return;
      const message = readDemoMessage(event.data);

      if (message?.type === "ready") {
        reveal();
      } else if (message?.type === "size") {
        stage.style.height = `${message.height}px`;
      } else if (message?.type === "solved") {
        status.textContent = solvedText(options.solved, message.time, options.lang);
      }
    },
    { signal },
  );

  signal.addEventListener("abort", () => clearTimeout(timer));
}
