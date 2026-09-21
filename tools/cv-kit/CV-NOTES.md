# CV une page

Source modifiable : `cv.html`.
Livrable : `../../output/pdf/cv-damien-aravena-bravo.pdf`.

Le CV conserve la colonne latérale du document de référence. Palette monochrome,
texture chromée fournie le 21 septembre 2026 (`chrome-reference.png`) dans le
haut de la colonne et titres sans chevrons. La texture est affichée sans
déformation, atténuée et fondue par CSS pour préserver la lisibilité.
Les coordonnées directes et les liens professionnels sont séparés par un filet ;
chaque libellé de lien reste rapproché de son adresse.
La pile typographique est celle du site (Tailwind par défaut) : ui-sans-serif,
system-ui, sans-serif. L'export Linux actuel utilise Noto Sans, intégrée au PDF.
Le site ne fixe pas Inter : la police résolue dépend du système du lecteur.

Les quatre postes viennent de `src/data/career.ts`. Les responsabilités de
réception et suivi administratif complètent ces données avec l'ancien CV.
Les coordonnées et langues viennent du CV fourni et de `src/data/site.ts`.
Les compétences de développement viennent de `src/data/skills.ts`.

Choix éditoriaux : accroche actualisée, expériences en premier, retrait des
stages d'observation et de l'adresse universitaire, formation condensée.
Pas de mention du bac : le CV fourni et le site divergent sur cette mention.
Dates de prépa limitées aux années, communes aux deux sources.
La photo n'est pas reprise depuis la capture d'écran.

Pour réexporter : ouvrir `cv.html` dans Chrome, imprimer en PDF au format A4,
sans marges ni en-têtes/pieds de page, avec les arrière-plans activés.

## Version publique pour le portfolio

Source : `cv-public.html` ; PDF :
`../../output/pdf/cv-damien-aravena-bravo-public.pdf`.
La localisation personnelle, le téléphone et l'adresse mail sont retirés du
contenu et des liens PDF (pas de simple masque visuel). Le nom, les trois liens
publics et le parcours sont conservés. La version complète reste indépendante.

C'est ce PDF, et lui seul, qui est copié dans `public/` pour le bouton de
téléchargement de la section contact. Il y garde son suffixe `-public` : le
dépôt est public et le fichier servi est indexable, donc le nom doit rendre
impossible de déposer la version complète à sa place sans le voir. Le lecteur,
lui, l'enregistre sous un nom propre — l'attribut `download` du lien s'en charge.

## Ce qui est versionné, et ce qui ne l'est pas

`cv-public.html` est suivi par git. `cv.html` ne l'est pas, et `output/` non plus :
ils portent le téléphone et l'adresse mail, que le site n'affiche nulle part. Un
commit serait définitif — même supprimé, le fichier resterait dans l'historique.
Le `.gitignore` les écarte tous les deux.
