import type { Lang } from "./i18n";
import { url } from "./url";

/*
 * ⚠️ LA VERSION PUBLIQUE, ET ELLE SEULE. Le kit produit deux CV : celui-ci, et
 * un complet qui porte le téléphone et l'adresse mail. Le dépôt est public et
 * le fichier servi ici est indexable : le suffixe reste donc dans le nom du
 * fichier, pour qu'on ne puisse pas déposer l'autre à sa place sans le voir.
 * La version anglaise suit la même règle (`-public-en`).
 *
 * Le nom envoyé au lecteur, lui, n'a pas à porter cette précaution : `download`
 * le rebaptise à l'enregistrement, dans la langue du site (« CV » en
 * français, « Resume » en anglais).
 *
 * Une fonction plutôt qu'une constante : `url()` lit la base au moment de
 * l'appel, comme partout ailleurs.
 */
const files = {
  fr: { path: "/cv-damien-aravena-bravo-public.pdf", filename: "CV-Damien-Aravena-Bravo.pdf" },
  en: {
    path: "/cv-damien-aravena-bravo-public-en.pdf",
    filename: "Resume-Damien-Aravena-Bravo.pdf",
  },
} satisfies Record<Lang, { path: string; filename: string }>;

export function publicCv(lang: Lang) {
  const { path, filename } = files[lang];
  return { href: url(path), filename };
}
