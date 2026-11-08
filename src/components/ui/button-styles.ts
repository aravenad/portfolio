/**
 * Les surfaces cliquables du site, partagées par Button et Pagination pour que
 * les deux ne divergent plus.
 *
 * Chaque bouton est un objet en relief (`surface-raised`, dans global.css) : un
 * dégradé qui s'assombrit vers le bas, entre deux arêtes, avec une ombre
 * portée. Au survol il s'éclaircit sans perdre son dégradé, donc son volume ;
 * au clic, il s'enfonce.
 */

/**
 * Bouton à contour. Rempli à peine plus clair que le fond, pour avoir une
 * matière sur laquelle poser le relief. En clair, l'échelle retournée donnerait
 * un bouton plus sombre que la page : il prend un crème plus clair que le
 * papier, comme une carte posée dessus, et s'assombrit d'un cran au survol.
 */
export const outlineButton = [
  "surface-raised border border-zinc-700/80 bg-gradient-to-b from-zinc-800/70 to-zinc-900",
  "hover:border-zinc-600 hover:from-zinc-700/80 hover:to-zinc-800",
  "light:border-zinc-700 light:from-[oklch(97%_0.01_84)] light:to-[oklch(94.4%_0.014_83)]",
  "light:hover:border-zinc-700 light:hover:from-[oklch(95.5%_0.012_84)] light:hover:to-[oklch(91.5%_0.016_82)]",
].join(" ");

/**
 * Bouton plein : blanc en sombre, graphite en clair, le bas toujours le plus
 * sombre (d'où le dégradé inversé en clair, où `white` est l'encre graphite).
 * Au survol, il s'allume : blanc franc et halo en sombre (`surface-glow`), un
 * graphite plus clair en clair.
 */
export const solidButton = [
  "surface-raised surface-glow bg-gradient-to-b from-zinc-100 to-zinc-300 text-black",
  "hover:from-white hover:to-zinc-200",
  "light:from-zinc-300 light:to-white",
  "light:hover:from-zinc-400 light:hover:to-zinc-100",
].join(" ");
