# Masque de fondu de la matière

`chrome-fade.svg` est la source du masque qui estompe la matière métallique en
haut de page. Le site n'utilise pas ce SVG mais son rendu,
`src/assets/chrome-fade.webp`.

## Pourquoi une image

Le bord irrégulier du fondu vient de deux filtres SVG, `feTurbulence` et
`feDisplacementMap`. Or un SVG est redessiné à chaque palier de zoom. Au zoom
du pavé tactile, Firefox recalculait donc ces filtres sur tout le haut de la
page, à chaque image, et le fond comme le contenu saccadaient. Une image n'est
que mise à l'échelle.

Le bruit utilise une graine fixe (`seed="21"`) : le rendu est déterministe, et
l'image contient exactement la forme du SVG.

## Régénérer

Après une retouche du SVG :

```sh
node tools/chrome-fade/render.mjs
```

C'est Chrome, en mode headless, qui dessine le SVG : ImageMagick et librsvg ne
rendent pas ces deux filtres à l'identique. `sharp` encode ensuite le résultat en
WebP sans perte, à 1600 × 1024.

## Vérifié

Rendu sur la page d'accueil en 375, 1440 et 1920 px, le masque en image ne
diffère du masque SVG que sur 25 à 81 pixels de plus de 2/255, tous dans les
cinq premières lignes de la page, sous la barre de navigation. Une version
réduite de moitié en faisait dix à vingt fois plus.
