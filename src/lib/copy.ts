/**
 * Le bouton qui copie l'adresse e-mail, sans dépendre du vrai `navigator`.
 *
 * Le lien `mailto:` n'ouvre rien sur un poste sans client mail configuré, ce
 * qui est courant : le bouton voisin met l'adresse dans le presse-papiers. Le
 * script du composant trouve les éléments ; tout le reste est ici, pour être
 * testé.
 */

/** Combien de temps la confirmation reste affichée. */
export const COPIED_FOR = 2000;

/** Ce que le bouton utilise du presse-papiers : absent hors HTTPS. */
export type CopyClipboard = Pick<Clipboard, "writeText">;

/**
 * Le bloc qui porte l'état : masqué sans script, `data-copied` une fois copié,
 * `data-failed` quand la copie est refusée.
 */
export type CopyRoot = Pick<HTMLElement, "dataset"> & { hidden: boolean };

/** Ce que le câblage utilise du bouton. */
export type CopyButton = Pick<HTMLElement, "addEventListener">;

/** La zone qui annonce le résultat, à l'écran comme aux lecteurs d'écran. */
export type CopyStatus = Pick<HTMLElement, "textContent">;

export interface CopyLabels {
  /** Le texte à copier. */
  text: string;
  /** L'annonce une fois copié. */
  copied: string;
  /** Ce qui précède le texte quand la copie est refusée. */
  failed: string;
}

/**
 * Câble le bouton : il n'apparaît qu'ici, sans script il ne ferait rien.
 *
 * Copié, le bloc passe en `data-copied` (l'icône devient une coche) et la zone
 * de statut l'annonce, le temps de `COPIED_FOR`. Refusé (presse-papiers absent
 * ou permission refusée), il passe en `data-failed` et la zone affiche
 * l'adresse elle-même, et la garde : on peut alors la sélectionner à la main.
 *
 * Le délai en cours est annulé avec le `signal` : sans cela, il viserait après
 * un changement de page des éléments qui n'existent plus.
 */
export function wireCopy(
  root: CopyRoot,
  button: CopyButton,
  status: CopyStatus,
  clipboard: CopyClipboard | undefined,
  labels: CopyLabels,
  signal: AbortSignal,
): void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const reset = () => {
    clearTimeout(timer);
    timer = undefined;
    delete root.dataset.copied;
    delete root.dataset.failed;
    status.textContent = "";
  };

  signal.addEventListener("abort", () => clearTimeout(timer));
  root.hidden = false;

  button.addEventListener(
    "click",
    async () => {
      reset();
      try {
        if (!clipboard) throw new Error("presse-papiers indisponible");
        await clipboard.writeText(labels.text);
      } catch {
        if (signal.aborted) return;
        root.dataset.failed = "";
        status.textContent = `${labels.failed} ${labels.text}`;
        return;
      }

      // La page a pu changer pendant l'écriture : plus rien à annoncer.
      if (signal.aborted) return;
      root.dataset.copied = "";
      status.textContent = labels.copied;
      timer = setTimeout(reset, COPIED_FOR);
    },
    { signal },
  );
}
