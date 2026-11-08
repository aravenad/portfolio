import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  COPIED_FOR,
  type CopyClipboard,
  type CopyRoot,
  type CopyStatus,
  wireCopy,
} from "../../src/lib/copy";

/**
 * Le script du bouton tourne dans le navigateur, hors de la couverture. Ici, un
 * `EventTarget` joue le bouton, et deux objets simples le bloc et la zone de
 * statut : c'est tout ce que le câblage en utilise.
 */

const labels = {
  text: "moi@example.com",
  copied: "Adresse copiée",
  failed: "Copie impossible, l'adresse :",
};

function setup(clipboard: CopyClipboard | undefined, signal = new AbortController().signal) {
  const root: CopyRoot = { dataset: {} as DOMStringMap, hidden: true };
  const button = new EventTarget();
  const status: CopyStatus = { textContent: "" };

  wireCopy(root, button, status, clipboard, labels, signal);

  /** Clique, puis laisse l'écriture dans le presse-papiers se terminer. */
  const click = async () => {
    button.dispatchEvent(new Event("click"));
    await vi.advanceTimersByTimeAsync(0);
  };

  return { root, status, click };
}

const accepting = () => ({ writeText: vi.fn(async () => {}) });
const refusing = () => ({
  writeText: vi.fn(async () => {
    throw new DOMException("refusé", "NotAllowedError");
  }),
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("wireCopy", () => {
  it("révèle le bouton, masqué tant que le script ne tourne pas", () => {
    const { root } = setup(accepting());
    expect(root.hidden).toBe(false);
  });

  it("copie le texte et l'annonce", async () => {
    const clipboard = accepting();
    const { root, status, click } = setup(clipboard);

    await click();

    expect(clipboard.writeText).toHaveBeenCalledWith(labels.text);
    expect("copied" in root.dataset).toBe(true);
    expect(status.textContent).toBe(labels.copied);
  });

  it("efface la confirmation passé le délai", async () => {
    const { root, status, click } = setup(accepting());

    await click();
    await vi.advanceTimersByTimeAsync(COPIED_FOR - 1);
    expect(status.textContent).toBe(labels.copied);

    await vi.advanceTimersByTimeAsync(1);
    expect("copied" in root.dataset).toBe(false);
    expect(status.textContent).toBe("");
  });

  it("relance le délai à chaque clic", async () => {
    const { status, click } = setup(accepting());

    await click();
    await vi.advanceTimersByTimeAsync(COPIED_FOR - 500);
    await click();
    await vi.advanceTimersByTimeAsync(COPIED_FOR - 1);

    expect(status.textContent).toBe(labels.copied);
  });

  it("affiche l'adresse quand la copie est refusée, et la garde", async () => {
    // Sans elle, le visiteur n'aurait ni client mail ni adresse à recopier.
    const { root, status, click } = setup(refusing());

    await click();
    await vi.advanceTimersByTimeAsync(COPIED_FOR * 2);

    expect("failed" in root.dataset).toBe(true);
    expect("copied" in root.dataset).toBe(false);
    expect(status.textContent).toBe(`${labels.failed} ${labels.text}`);
  });

  it("affiche l'adresse sans presse-papiers, absent hors HTTPS", async () => {
    const { root, status, click } = setup(undefined);

    await click();

    expect("failed" in root.dataset).toBe(true);
    expect(status.textContent).toContain(labels.text);
  });

  it("repart de zéro quand une copie réussit après un refus", async () => {
    const clipboard = refusing();
    const { root, status, click } = setup(clipboard);

    await click();
    clipboard.writeText.mockResolvedValueOnce(undefined);
    await click();

    expect("failed" in root.dataset).toBe(false);
    expect(status.textContent).toBe(labels.copied);
  });

  it("n'annonce plus rien une fois la page quittée", async () => {
    const controller = new AbortController();
    let finish!: () => void;
    const clipboard = {
      writeText: vi.fn(() => new Promise<void>((resolve) => (finish = resolve))),
    };
    const { root, status, click } = setup(clipboard, controller.signal);

    await click();
    controller.abort();
    finish();
    await vi.advanceTimersByTimeAsync(0);

    expect("copied" in root.dataset).toBe(false);
    expect(status.textContent).toBe("");
  });

  it("n'affiche pas l'adresse non plus si le refus arrive après le départ", async () => {
    const controller = new AbortController();
    let refuse!: () => void;
    const clipboard = {
      writeText: vi.fn(() => new Promise<void>((_, reject) => (refuse = () => reject(new Error())))),
    };
    const { root, status, click } = setup(clipboard, controller.signal);

    await click();
    controller.abort();
    refuse();
    await vi.advanceTimersByTimeAsync(0);

    expect("failed" in root.dataset).toBe(false);
    expect(status.textContent).toBe("");
  });

  it("annule le délai en cours au changement de page", async () => {
    const controller = new AbortController();
    const { status, click } = setup(accepting(), controller.signal);

    await click();
    controller.abort();
    await vi.advanceTimersByTimeAsync(COPIED_FOR);

    // Le délai visait des éléments remplacés : il ne doit plus rien toucher.
    expect(status.textContent).toBe(labels.copied);
  });

  it("ne répond plus aux clics une fois la page quittée", async () => {
    const controller = new AbortController();
    const clipboard = accepting();
    const { click } = setup(clipboard, controller.signal);

    controller.abort();
    await click();

    expect(clipboard.writeText).not.toHaveBeenCalled();
  });
});
