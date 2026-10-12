import { describe, expect, it } from "vitest";

import { SHINE_KEY, initialShine, saveShine, wireShineToggle } from "../../src/lib/shine";

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
  const root = { dataset: initial ? { shine: initial } : {} } as { dataset: DOMStringMap };
  const store = fakeStore();

  wireShineToggle([button] as never, root, () => store, new AbortController().signal);

  return { button, root, store };
}

describe("initialShine", () => {
  it("reprend le choix mémorisé, quel que soit le système", () => {
    expect(initialShine("off", false)).toBe("off");
    expect(initialShine("on", true)).toBe("on");
  });

  it("suit le système sans choix mémorisé", () => {
    expect(initialShine(null, false)).toBe("on");
    expect(initialShine(null, true)).toBe("off");
  });

  it("ignore une valeur inconnue", () => {
    expect(initialShine("peut-être", false)).toBe("on");
    expect(initialShine("peut-être", true)).toBe("off");
  });
});

describe("saveShine", () => {
  it("mémorise le choix sous la clé que lit le script de BaseLayout", () => {
    const store = fakeStore();
    saveShine(() => store, "off");

    expect(SHINE_KEY).toBe("shine");
    expect(store.values.get("shine")).toBe("off");
  });

  it("ne casse rien quand le stockage est refusé", () => {
    const refused = () => {
      throw new Error("SecurityError");
    };

    expect(() => saveShine(refused, "off")).not.toThrow();
  });
});

describe("wireShineToggle", () => {
  it("part pressé quand le reflet est actif", () => {
    const { button } = wire("on");
    expect(button.attributes.get("aria-pressed")).toBe("true");
  });

  it("part relâché quand le reflet est coupé", () => {
    const { button } = wire("off");
    expect(button.attributes.get("aria-pressed")).toBe("false");
  });

  it("coupe, mémorise, puis relance au clic suivant (RGAA 13.8)", () => {
    const { button, root, store } = wire("on");

    button.click();
    expect(root.dataset.shine).toBe("off");
    expect(button.attributes.get("aria-pressed")).toBe("false");
    expect(store.values.get("shine")).toBe("off");

    button.click();
    expect(root.dataset.shine).toBe("on");
    expect(button.attributes.get("aria-pressed")).toBe("true");
    expect(store.values.get("shine")).toBe("on");
  });

  it("garde le panneau et le menu replié d'accord", () => {
    const panel = fakeButton();
    const menu = fakeButton();
    const root = { dataset: { shine: "on" } } as { dataset: DOMStringMap };

    wireShineToggle([panel, menu] as never, root, () => fakeStore(), new AbortController().signal);
    menu.click();

    expect(root.dataset.shine).toBe("off");
    expect(panel.attributes.get("aria-pressed")).toBe("false");
    expect(menu.attributes.get("aria-pressed")).toBe("false");
  });
});
