import { url } from "./url";

/*
 * ⚠️ LA VERSION PUBLIQUE, ET ELLE SEULE. Le kit produit deux CV : celui-ci, et
 * un complet qui porte le téléphone et l'adresse mail. Le dépôt est public et
 * le fichier servi ici est indexable : le suffixe reste donc dans le nom du
 * fichier, pour qu'on ne puisse pas déposer l'autre à sa place sans le voir.
 *
 * Le nom envoyé au lecteur, lui, n'a pas à porter cette précaution : `download`
 * le rebaptise à l'enregistrement.
 *
 * Le CV n'existe qu'en français : la version anglaise du site sert le même
 * fichier, et ses liens le signalent.
 *
 * Une fonction plutôt qu'une constante : `url()` lit la base au moment de
 * l'appel, comme partout ailleurs.
 */
export function publicCv() {
  return {
    href: url("/cv-damien-aravena-bravo-public.pdf"),
    filename: "CV-Damien-Aravena-Bravo.pdf",
  };
}
