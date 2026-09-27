import { describe, expect, it, vi } from "vitest";

import {
  THEME_KEY,
  saveTheme,
  toggledTheme,
  wireThemeToggle,
  withViewTransition,
} from "../../src/lib/theme";

/** Un bouton qui retient ses attributs et son écouteur de clic. */
function fakeButton() {
  const attributes = new Map<string, string>();
  let onClick: (() => void) | undefined;

  return {
    attributes,
    click: () => onClick?.(),
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    addEventListener: (_type: string, listener: () => void) => {
      onClick = listener;
    },
  };
}

/** Un stockage en mémoire. */
function fakeStore() {
  const values = new Map<string, string>();
  return { values, setItem: (key: string, value: string) => values.set(key, value) };
}

function wire(initial?: string) {
  const button = fakeButton();
  const root = { dataset: initial ? { theme: initial } : {} } as { dataset: DOMStringMap };
  const store = fakeStore();

  wireThemeToggle(button as never, root, () => store, new AbortController().signal);

  return { button, root, store };
}

describe("toggledTheme", () => {
  it("passe d'un thème à l'autre", () => {
    expect(toggledTheme("dark")).toBe("light");
    expect(toggledTheme("light")).toBe("dark");
  });
});

describe("saveTheme", () => {
  it("mémorise le choix sous la clé que lit le script de BaseLayout", () => {
    const store = fakeStore();
    saveTheme(() => store, "light");

    expect(THEME_KEY).toBe("theme");
    expect(store.values.get("theme")).toBe("light");
  });

  it("ne casse rien quand le stockage est refusé", () => {
    // Navigation privée, cookies bloqués : le simple accès peut lever une erreur.
    const refused = () => {
      throw new Error("SecurityError");
    };

    expect(() => saveTheme(refused, "light")).not.toThrow();
  });
});

describe("wireThemeToggle", () => {
  it("part du sombre quand aucun thème n'est posé", () => {
    const { button, root } = wire();

    expect(root.dataset.theme).toBe("dark");
    expect(button.attributes.get("aria-pressed")).toBe("false");
  });

  it("reprend le clair posé avant le premier rendu", () => {
    const { button } = wire("light");
    expect(button.attributes.get("aria-pressed")).toBe("true");
  });

  it("bascule, applique et mémorise à chaque clic", () => {
    const { button, root, store } = wire();

    button.click();
    expect(root.dataset.theme).toBe("light");
    expect(button.attributes.get("aria-pressed")).toBe("true");
    expect(store.values.get("theme")).toBe("light");

    button.click();
    expect(root.dataset.theme).toBe("dark");
    expect(store.values.get("theme")).toBe("dark");
  });

  it("pose son écouteur avec le signal de la page", () => {
    // Sans le signal, l'écouteur survivrait à la navigation et s'accumulerait.
    const button = fakeButton();
    const spy = vi.spyOn(button, "addEventListener");
    const { signal } = new AbortController();

    wireThemeToggle(button as never, { dataset: {} } as never, () => fakeStore(), signal);

    expect(spy).toHaveBeenCalledWith("click", expect.any(Function), { signal });
  });
});

describe("wireThemeToggle, avec une transition", () => {
  it("applique le thème à l'intérieur de la transition", () => {
    const button = fakeButton();
    const root = { dataset: {} } as { dataset: DOMStringMap };
    const seen: (string | undefined)[] = [];

    wireThemeToggle(button as never, root, () => fakeStore(), new AbortController().signal, (update) => {
      seen.push(root.dataset.theme);
      update();
      seen.push(root.dataset.theme);
    });

    button.click();
    // Avant l'appel : encore sombre ; après : clair. La transition enrobe bien le changement.
    expect(seen).toEqual(["dark", "light"]);
  });
});

describe("withViewTransition", () => {
  /** Un document dont on suit les attributs de <html> et les fondus lancés. */
  function fakeDocument(supported = true) {
    const attributes = new Set<string>();
    let finish!: () => void;
    const calls: string[] = [];

    const doc = {
      documentElement: {
        setAttribute: (name: string) => attributes.add(name),
        removeAttribute: (name: string) => attributes.delete(name),
      },
      startViewTransition: supported
        ? (update: () => void) => {
            calls.push("start");
            update();
            return { finished: new Promise<void>((resolve) => (finish = resolve)) };
          }
        : undefined,
    };

    return { doc, attributes, calls, finish: () => finish() };
  }

  it("lance un fondu et marque <html> le temps du fondu", async () => {
    const { doc, attributes, calls, finish } = fakeDocument();
    const update = vi.fn();

    withViewTransition(doc, true, update);

    expect(calls).toEqual(["start"]);
    expect(update).toHaveBeenCalledOnce();
    expect(attributes.has("data-theme-switching")).toBe(true);

    finish();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(attributes.has("data-theme-switching")).toBe(false);
  });

  it("reste silencieux et nettoie <html> quand le fondu est interrompu", async () => {
    // Un second clic pendant le fondu l'abandonne : `finished` est alors rejeté.
    const attributes = new Set<string>();
    const doc = {
      documentElement: {
        setAttribute: (name: string) => attributes.add(name),
        removeAttribute: (name: string) => attributes.delete(name),
      },
      startViewTransition: (update: () => void) => {
        update();
        return { finished: Promise.reject(new Error("AbortError")) };
      },
    };

    expect(() => withViewTransition(doc, true, () => {})).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(attributes.has("data-theme-switching")).toBe(false);
  });

  it("applique directement quand le visiteur préfère réduire les animations", () => {
    const { doc, attributes, calls } = fakeDocument();
    const update = vi.fn();

    withViewTransition(doc, false, update);

    expect(calls).toEqual([]);
    expect(update).toHaveBeenCalledOnce();
    expect(attributes.size).toBe(0);
  });

  it("applique directement sur un navigateur sans View Transitions", () => {
    const { doc, calls } = fakeDocument(false);
    const update = vi.fn();

    withViewTransition(doc, true, update);

    expect(calls).toEqual([]);
    expect(update).toHaveBeenCalledOnce();
  });
});
