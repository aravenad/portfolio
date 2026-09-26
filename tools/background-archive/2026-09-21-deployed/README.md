# Ancien fond déployé — sauvegarde du 21 septembre 2026

Version vérifiée avant remplacement : `7b8785d60ebf9a49b8e04d2ff9486be30d495c26`.
Déploiement GitHub Pages réussi : https://github.com/aravenad/portfolio/actions/runs/35539274350.

Les fichiers de cette archive sont des copies exactes de ce commit :

- `chrome.webp` : ancien fond utilisé en production (6 048 octets).
- `chrome.svg` : source procédurale du marbrage.
- `global.css` : composition des couches, fondu, grain et styles de l'époque.
- `BaseLayout.astro` : préchargement et structure de page de l'époque.
- `Header.astro` : fond et bordure de navigation de l'époque.

Cette archive dans `tools/` n'est pas servie par le site. Les fichiers Astro
et CSS sont des instantanés de référence, pas des composants autonomes.
Pour rétablir seulement le fond, reprendre les règles `body` et `body::after`
de l'ancien CSS, retirer le nouveau `body::before` et son masque, puis pointer
le préchargement vers `src/assets/chrome.webp` (également conservé à son
emplacement d'origine). Le commit ci-dessus permet de retrouver tout l'état
antérieur sans dépendre de cette archive.

## Nouveau fond

> État au 21 septembre 2026. Depuis, le WebP est encodé avec perte (qualité 80)
> et le masque est une image, `src/assets/chrome-fade.webp` : voir
> `tools/chrome-fade/README.md`.

La version retenue utilise `src/assets/chrome-original-hq.webp`, issue de
l'image fournie `a6630457502c9a3dcee8832287cf9b96.png` (1920 × 3770).
Le WebP est sans perte, sans agrandissement, et pèse 5 453 882 octets : la
fidélité de la preview validée est conservée. Le cadrage, le mélange `screen`
et le masque `src/assets/chrome-fade.svg` sont appliqués en CSS. Le grain est
réduit et placé derrière le contenu ; le fond de navigation s'estompe.

Les essais vidéo, GIF et images intermédiaires restent des fichiers locaux
de travail et ne font pas partie de cette publication.
