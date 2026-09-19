# Kit DA pour le CV

Les valeurs du portfolio, sous une forme utilisable hors du code. La DA est
monochrome, calquée sur la bannière LinkedIn : noir profond, métal liquide,
aucune teinte franche.

Référence complète et justifications : §5 de `DOCUMENTATION.md`.

---

## 1. Couleurs

L'unité de référence du site est `oklch`. Les hex sont donnés pour les outils qui
ne le gèrent pas (Canva, Word, InDesign…). Les équivalences ont été vérifiées en
faisant convertir les deux écritures par le moteur de rendu : écart maximal
1/255 sur les gris, 0 sur le fond et les titres.

| Rôle | Hex | oklch | Où l'employer |
| :--- | :--- | :--- | :--- |
| Fond | `#09090B` | `oklch(14.1% 0.005 285.8)` | le fond de page, partout |
| Titres | `#FAFAFA` | `oklch(98.5% 0 0)` | nom, titres de section |
| Texte courant | `#A1A1AA` | `oklch(71.5% 0.013 286.1)` | paragraphes, descriptions |
| Texte secondaire | `#71717A` | `oklch(55.2% 0.016 285.9)` | dates, lieux, mentions |
| Séparateurs | `#27272A` | `oklch(27.4% 0.006 286)` | filets, bordures de blocs |
| Surface | `#18181B` | `oklch(21% 0.006 285.9)` | encadrés, cartouches |
| **Accent argent** | `#CFE0F3` | `oklch(90% 0.032 250)` | **voir la règle ci-dessous** |

### La règle qui tient toute la DA

**L'accent n'est jamais décoratif.** Sur le site il ne marque qu'une interaction
ou un état — jamais un titre, jamais un filet. Un CV n'a pas d'interactions :
l'accent n'y a donc quasiment pas d'emploi. Le transposer en « couleur de
titres » casserait la cohérence plus sûrement que de ne pas l'utiliser du tout.

Si tu veux malgré tout un point d'accent, garde-le pour **une seule** chose sur
toute la page (un filet sous ton nom, par exemple), jamais deux.

---

## 2. Le lettrage chromé

Le dégradé du prénom dans le hero, du favicon et de l'image d'aperçu. C'est
l'élément le plus reconnaissable de la DA : à réserver à **ton nom**, en très
grand corps.

```
Type       : dégradé linéaire
Angle      : 172° (quasi vertical, la lumière vient du haut)
Arrêts     : #FFFFFF  à  0 %
             #FFFFFF  à 46 %
             #A1A1AA  à 63 %
             #F4F4F5  à 78 %
             #D4D4D8  à 100 %
```

Dans un outil qui compte l'angle autrement (Figma, Illustrator, Canva), vise
**une descente presque verticale, très légèrement inclinée vers la droite**.

⚠️ **Deux tiers hauts en blanc, un seul reflet en bas.** C'est le point à ne pas
rater. Un dégradé réparti à parts égales entre clair et sombre rend le mot
globalement *plus sombre* que le texte blanc autour : le nom recule au lieu de
mener. Il doit rester l'élément le plus lumineux de la page.

⚠️ **Sous ~2 rem (28 pt), ne pas l'utiliser.** Les bandes du dégradé se lisent
alors comme un défaut d'impression, pas comme un reflet.

---

## 3. La matière « métal liquide »

Deux exports prêts à poser, déjà composés sur le noir de la DA (un document
n'a pas de mode de fusion `screen`) :

| Fichier | Usage |
| :--- | :--- |
| `bandeau-a4-300dpi.png` | 2480 × 1128 px — pleine largeur A4, pour l'impression |
| `bandeau-ecran-150dpi.png` | 1654 × 752 px — CV lu en PDF à l'écran |

**Comment la poser.** En bandeau haut de page, pleine largeur, sur environ un
tiers de la hauteur. Elle est déjà fondue vers le noir en bas : elle se raccorde
donc toute seule au fond, sans masque à dessiner.

⚠️ **Ne pas l'éclaircir.** Son ruban le plus clair est plafonné à 16 % de blanc,
et ce n'est pas un choix esthétique : au-delà, un texte gris posé dessus passe
sous le rapport de contraste 4,5:1. Si du texte doit vivre dessus, il reste
lisible à cette intensité — pas au-delà.

⚠️ **Ne pas l'étirer horizontalement.** Son format est 2,2:1. Au-delà d'environ
1,25× d'étirement, l'écoulement se lit comme des traînées et l'effet tombe.

Pour la régénérer autrement (autre graine, autre densité) : `tools/chrome.svg`
et la commande de §5 de `DOCUMENTATION.md`.

---

## 4. Le grain

Le site pose un bruit gris désaturé à **5 % d'opacité** par-dessus toute la page.
Il casse l'uniformité des aplats sombres, où les dégradés se voient par bandes.

Sur un CV **écran**, il vaut le coup : même raison, mêmes bandes.
Sur un CV **imprimé**, laisse-le tomber — la trame d'impression fait déjà ce
travail, et le bruit ne survit pas à une impression laser de bureau.

---

## 5. Typographie

Le site n'embarque aucune police : il utilise la pile système (Inter sur la
plupart des machines). Pour le CV, **Inter** est donc le choix qui colle le
mieux — à défaut, n'importe quelle grotesque neutre (Helvetica, Arial, Source
Sans, Figtree) tiendra la DA.

Ce qui compte plus que la police :

| | Valeur du site |
| :--- | :--- |
| Graisse des titres | 700 |
| Graisse du texte | 400 |
| Interlettrage des grands titres | serré, `-0.035em` |
| Interlettrage du texte | normal |
| Interligne du texte | 1,6 à 1,75 |
| Libellés de catégorie | capitales, `+0.06em`, corps réduit, gris `#71717A` |

L'interlettrage serré sur les grands titres est une part réelle de l'identité :
sans lui, le nom en très grand corps paraît lâche et générique.
