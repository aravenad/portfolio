import { parseHTML } from "linkedom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEMO_MAX_HEIGHT,
  DEMO_MIN_HEIGHT,
  DEMO_READY_TIMEOUT,
  type DemoOptions,
  demoHeight,
  demoUrl,
  readDemoMessage,
  solvedText,
  wireDemo,
} from "../../src/lib/demo";

describe("demoUrl", () => {
  it("passe la langue, et le thème quand il est connu", () => {
    expect(demoUrl("/demos/jeu/", "fr")).toBe("/demos/jeu/?lang=fr");
    expect(demoUrl("/demos/jeu/", "en", "light")).toBe("/demos/jeu/?lang=en&theme=light");
  });
});

describe("readDemoMessage", () => {
  it("lit les trois messages du contrat", () => {
    expect(readDemoMessage({ v: 1, type: "ab:ready", level: "vitrine" })).toEqual({ type: "ready" });
    expect(readDemoMessage({ v: 1, type: "ab:size", height: 540.4 })).toEqual({
      type: "size",
      height: 540,
    });
    expect(readDemoMessage({ v: 1, type: "ab:solved", level: 3, time: 12.3, errors: 0 })).toEqual({
      type: "solved",
      time: 12.3,
    });
  });

  it("ignore ce qui n'est pas un message de la démo", () => {
    expect(readDemoMessage(null)).toBeNull();
    expect(readDemoMessage("ab:ready")).toBeNull();
    expect(readDemoMessage({ type: "ab:ready" })).toBeNull();
    expect(readDemoMessage({ v: 2, type: "ab:ready" })).toBeNull();
    expect(readDemoMessage({ v: 1, type: "autre" })).toBeNull();
  });

  it("refuse une hauteur ou une durée qui n'est pas un nombre valable", () => {
    expect(readDemoMessage({ v: 1, type: "ab:size", height: "500" })).toBeNull();
    expect(readDemoMessage({ v: 1, type: "ab:size", height: Number.NaN })).toBeNull();
    expect(readDemoMessage({ v: 1, type: "ab:solved", time: -1 })).toBeNull();
    expect(readDemoMessage({ v: 1, type: "ab:solved", time: Infinity })).toBeNull();
  });
});

describe("demoHeight", () => {
  it("borne une hauteur aberrante", () => {
    expect(demoHeight(10)).toBe(DEMO_MIN_HEIGHT);
    expect(demoHeight(1e6)).toBe(DEMO_MAX_HEIGHT);
    expect(demoHeight(600.6)).toBe(601);
  });
});

describe("solvedText", () => {
  it("écrit la durée au dixième, à la manière de la langue", () => {
    expect(solvedText("Niveau réussi en {time} s.", 12.34, "fr")).toBe("Niveau réussi en 12,3 s.");
    expect(solvedText("Level cleared in {time} s.", 8, "en")).toBe("Level cleared in 8 s.");
  });
});

describe("wireDemo", () => {
  const options: DemoOptions = {
    src: "/portfolio/demos/jeu/",
    lang: "fr",
    theme: "light",
    title: "Jeu : démo jouable",
    loading: "Chargement…",
    solved: "Réussi en {time} s.",
  };

  /** Le bloc du composant, dans un document linkedom ; un `EventTarget` joue la fenêtre. */
  function setup() {
    const { document, Event: DomEvent } = parseHTML(`<!doctype html><html><body>
      <figure data-demo><div data-demo-stage><a data-demo-play href="/demos/jeu/?lang=fr">Jouer</a></div>
      <p data-demo-status></p></figure></body></html>`);
    const root = document.querySelector("[data-demo]") as HTMLElement;
    const parts = {
      root,
      play: root.querySelector("[data-demo-play]") as HTMLElement,
      stage: root.querySelector("[data-demo-stage]") as HTMLElement,
      status: root.querySelector("[data-demo-status]") as HTMLElement,
    };
    const win = new EventTarget();
    const controller = new AbortController();
    wireDemo(parts, win as Window, controller.signal, options);

    // linkedom n'a pas de `MouseEvent` : son `Event` porte les champs que le câblage lit.
    const click = (init: MouseEventInit = {}) => {
      const event = Object.assign(new DomEvent("click", { cancelable: true }), { button: 0, ...init });
      parts.play.dispatchEvent(event);
      return event;
    };
    const frame = () => parts.stage.querySelector("iframe") as HTMLIFrameElement | null;
    // linkedom ne crée pas de fenêtre pour une iframe : on lui en donne une.
    const source = {};
    const post = (data: unknown, from: unknown = source) => {
      const event = Object.assign(new Event("message"), { data, source: from });
      win.dispatchEvent(event);
    };
    const open = () => {
      click();
      const iframe = frame() as HTMLIFrameElement;
      Object.defineProperty(iframe, "contentWindow", { value: source });
      iframe.focus = vi.fn();
      return iframe;
    };

    return { ...parts, controller, click, frame, post, open };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("charge la démo au clic, dans un bac à sable", () => {
    const demo = setup();
    const event = demo.click();
    const iframe = demo.frame();

    expect(event.defaultPrevented).toBe(true);
    expect(iframe?.getAttribute("src")).toBe("/portfolio/demos/jeu/?lang=fr&theme=light");
    expect(iframe?.getAttribute("sandbox")).toBe("allow-scripts");
    expect(iframe?.getAttribute("title")).toBe(options.title);
    expect(demo.root.dataset.state).toBe("loading");
    expect(demo.status.textContent).toBe(options.loading);
  });

  it("laisse le lien faire son travail avec une touche ou un autre bouton", () => {
    const demo = setup();

    const clicks = [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }];
    for (const init of clicks) {
      expect(demo.click(init).defaultPrevented).toBe(false);
    }
    expect(demo.frame()).toBeNull();
  });

  it("ne charge la démo qu'une fois", () => {
    const demo = setup();
    demo.click();
    demo.click();

    expect(demo.stage.querySelectorAll("iframe")).toHaveLength(1);
  });

  it("montre la démo à son premier message et lui donne le clavier", () => {
    const demo = setup();
    const iframe = demo.open();
    demo.post({ v: 1, type: "ab:ready" });

    expect(demo.root.dataset.state).toBe("ready");
    expect(demo.status.textContent).toBe("");
    expect(iframe.focus).toHaveBeenCalledWith({ preventScroll: true });

    // Un second `ab:ready` (la démo recommencée) ne reprend pas le clavier.
    demo.post({ v: 1, type: "ab:ready" });
    expect(iframe.focus).toHaveBeenCalledTimes(1);
  });

  it("montre la démo au bout du délai si elle ne dit rien", () => {
    const demo = setup();
    demo.open();
    vi.advanceTimersByTime(DEMO_READY_TIMEOUT);

    expect(demo.root.dataset.state).toBe("ready");
  });

  it("suit la hauteur conseillée et annonce les niveaux réussis", () => {
    const demo = setup();
    demo.open();
    demo.post({ v: 1, type: "ab:size", height: 612 });
    demo.post({ v: 1, type: "ab:solved", level: 3, time: 9.5, errors: 1 });

    expect(demo.stage.style.height).toBe("612px");
    expect(demo.status.textContent).toBe("Réussi en 9,5 s.");
  });

  it("n'écoute que sa propre iframe, et des messages valables", () => {
    const demo = setup();
    demo.post({ v: 1, type: "ab:ready" });
    expect(demo.root.dataset.state).toBeUndefined();

    demo.open();
    demo.post({ v: 1, type: "ab:ready" }, {});
    demo.post({ v: 1, type: "inconnu" });
    expect(demo.root.dataset.state).toBe("loading");
  });

  it("oublie le délai et les messages quand on quitte la page", () => {
    const demo = setup();
    demo.open();
    demo.controller.abort();
    vi.advanceTimersByTime(DEMO_READY_TIMEOUT);
    demo.post({ v: 1, type: "ab:ready" });

    expect(demo.root.dataset.state).toBe("loading");
  });
});
