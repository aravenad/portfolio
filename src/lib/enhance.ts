/**
 * Rejoue une initialisation à chaque affichage de page, transitions comprises.
 *
 * Les `<script>` des composants Astro sont des modules : ils s'exécutent **une
 * seule fois** par chargement du document. Avec `<ClientRouter />`, naviguer ne
 * recharge plus le document — le DOM est remplacé, mais les modules ne sont pas
 * réexécutés. Sans ce relais, tout comportement câblé au premier affichage
 * (menu, surlignage, retour en haut…) cesse de fonctionner dès la deuxième page,
 * silencieusement.
 *
 * `astro:page-load` couvre les deux cas : il se déclenche au chargement initial
 * **et** après chaque navigation client.
 *
 * L'`AbortSignal` passé au rappel sert à poser les écouteurs. Ceux du `window`
 * et du `document` survivraient sinon à l'échange de DOM et s'accumuleraient à
 * chaque navigation, en visant des éléments qui n'existent plus. Il est avorté
 * avant l'échange suivant, ce qui les retire tous d'un coup.
 */
export function onEachPage(setup: (signal: AbortSignal) => void): void {
  let controller: AbortController | undefined;

  const stop = () => {
    controller?.abort();
    controller = undefined;
  };

  document.addEventListener("astro:page-load", () => {
    stop();
    controller = new AbortController();
    setup(controller.signal);
  });

  document.addEventListener("astro:before-swap", stop);
}
