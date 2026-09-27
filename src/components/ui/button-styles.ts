/**
 * Les surfaces cliquables du site, partagées par Button et Pagination pour que
 * les deux ne divergent plus.
 *
 * Au survol, un bouton devient « plein » : un aplat, sous l'arête lumineuse de
 * `surface-lit`. Le contour se remplit, le plein perd son dégradé.
 */

/**
 * Bouton à contour. Le remplissage est un cran plus marqué en sombre
 * (`zinc-800`) qu'en clair (`zinc-900`, soit un gris perle une fois l'échelle
 * retournée) : un même écart de luminance se voit moins sur un fond noir.
 */
export const outlineButton =
  "surface-lit border border-zinc-700 hover:bg-zinc-800 light:hover:bg-zinc-900";

/**
 * Bouton plein : un dégradé haut-bas au repos, comme les surfaces éclairées du
 * site, qui devient un aplat au survol. Blanc en sombre, graphite en clair.
 */
export const solidButton =
  "surface-lit bg-gradient-to-b from-white to-zinc-300 text-black hover:from-zinc-200 hover:to-zinc-200";
