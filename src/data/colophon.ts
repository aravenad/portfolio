import { withFrenchSpacing } from "../lib/typography";
import { site } from "./site";

/**
 * « Comment ce site est fait » : la trame de glyphes, le changement de thème
 * et le travail de performance, rendus visibles avec leurs chiffres.
 *
 * Les chiffres viennent des mesures notées en commentaire à côté du code
 * (BaseLayout.astro pour la matière du fond, son préchargement et le reflet
 * des titres) et du budget de performance (tools/budget/budget.mjs). Une
 * nouvelle mesure, ou un plafond relevé, se reporte ici dans les deux langues.
 *
 * L'anglais a exactement la même forme (`satisfies Colophon`) : même nombre
 * de parties, de paragraphes et de lignes de tableau, vérifié par les tests.
 */

/** Une ligne d'un tableau de chiffres : le poste, puis ses deux valeurs. */
export interface ColophonRow {
  item: string;
  from: string;
  to: string;
}

/** Un tableau de chiffres, avec sa légende et l'intitulé de ses colonnes. */
export interface ColophonTable {
  caption: string;
  headers: { item: string; from: string; to: string };
  rows: ColophonRow[];
}

/** Une partie de l'article : un titre, des paragraphes, parfois un tableau. */
export interface ColophonSection {
  /** L'ancre du titre, la même dans les deux langues. */
  id: string;
  title: string;
  paragraphs: string[];
  table?: ColophonTable;
  /** Une remarque sous le tableau. */
  note?: string;
}

export interface Colophon {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  source: string;
  newTab: string;
  sections: ColophonSection[];
  /** La dernière phrase, qui mène à la déclaration d'accessibilité. */
  accessibility: { before: string; link: string; after: string };
}

export const colophon: Colophon = withFrenchSpacing({
  title: "Comment ce site est fait",
  metaTitle: `Comment ce site est fait | ${site.author}`,
  metaDescription:
    "Les coulisses du portfolio de Damien Aravena Bravo : la trame de glyphes du fond, le changement de thème et le travail de performance, chiffres avant et après à l'appui.",
  intro:
    "Ce site est un projet comme les autres, et l'essentiel de son travail ne se voit pas. Voici ce qui se passe sous la surface, avec les chiffres mesurés.",
  source: "Lire le code sur GitHub",
  newTab: "(nouvel onglet)",
  sections: [
    {
      id: "colophon-base",
      title: "La base",
      paragraphs: [
        "Un site entièrement statique, construit avec Astro et Tailwind CSS, servi par GitHub Pages : pas de serveur, pas de base de données. Chaque page existe en français et en anglais.",
        "Le JavaScript se limite au routeur qui enchaîne les pages sans rechargement et à une poignée de comportements. Sans lui, tout le contenu reste lisible et tous les liens fonctionnent.",
      ],
    },
    {
      id: "colophon-glyphs",
      title: "Le fond en glyphes",
      paragraphs: [
        "Le fond est une photo de métal froissé, recomposée en caractères. Chaque cellule de 4 pixels devient un glyphe de la rampe « ·:+×xX# », du plus clair au plus dense, et un tramage de Bayer 4 × 4 rend les nuances intermédiaires. Le tout est dessiné sur un canvas, en IBM Plex Mono.",
        "Le même moteur trame les couvertures des projets, animées au survol, les logos des compétences, et un fragment de matière caché dans chaque bouton.",
        "Pour rester léger, il lit une copie de la photo réduite à 480 pixels de large : un pixel par cellule suffit. Une seule boucle tourne, à 12 images par seconde ; elle ne repeint que les cellules qui changent et s'arrête hors de l'écran. L'animation se coupe dans les réglages, et d'elle-même si votre système demande moins de mouvement.",
      ],
    },
    {
      id: "colophon-theme",
      title: "Le changement de thème",
      paragraphs: [
        "Le bouton de thème ne fait pas un simple fondu : le nouveau thème se découvre du haut vers le bas, puis du bas vers le haut au changement suivant, derrière un front de glyphes au bord irrégulier, en une seconde.",
        "C'est une View Transition du navigateur. Son masque est une image SVG dessinée une fois, puis glissée par une animation native ; le canvas du front ne peint que les lignes qu'il traverse. Pendant la course, la trame du fond se repeint aux nouvelles couleurs par tranches de 3 millisecondes, lignes visibles d'abord, pour être prête avant que le front ne l'atteigne.",
        "Le thème clair n'ajoute aucune classe : il redonne une valeur claire à chaque nuance de gris, et le fond devient un papier crème. Chaque composant garde ainsi sa hiérarchie dans les deux thèmes.",
      ],
    },
    {
      id: "colophon-performance",
      title: "Le travail de performance",
      paragraphs: ["Chaque correction a été mesurée sur le site construit, avant et après."],
      table: {
        caption: "Les gains mesurés, avant et après chaque correction",
        headers: { item: "Poste", from: "Avant", to: "Après" },
        rows: [
          {
            item: "Photo du fond",
            from: "5,2 Mo sans perte, 319 ms de téléchargement",
            to: "417 Ko en WebP, sans différence visible à l'écran",
          },
          { item: "Copie lue par la trame", from: "427 Ko", to: "51 Ko" },
          {
            item: "Arrivée du fond, en 4G lente",
            from: "377 ms, après la feuille de style",
            to: "Dès le HTML, en même temps que la feuille de style",
          },
          {
            item: "Reflet chromé des titres",
            from: "~9 % du processeur par titre, même hors de l'écran",
            to: "En pause dès qu'il sort de l'écran",
          },
        ],
      },
      note: "S'y ajoutent des gains plus petits : les icônes de l'onglet ne se retéléchargent plus à chaque page, et la trame ne prépare les surfaces éloignées qu'au repos.",
    },
    {
      id: "colophon-budget",
      title: "Un budget pour que ça dure",
      paragraphs: [
        "Ces gains ne valent que s'ils tiennent. Après chaque construction du site, l'intégration continue le mesure, et bloque la mise en ligne si un poste dépasse son plafond.",
      ],
      table: {
        caption: "Le budget de performance, mesuré en novembre 2026",
        headers: { item: "Poste", from: "Aujourd'hui", to: "Plafond" },
        rows: [
          {
            item: "JavaScript, tout le site",
            from: "59 Ko (26,2 Ko compressé)",
            to: "70 Ko (30 Ko compressé)",
          },
          { item: "Feuille de style, compressée", from: "13,9 Ko", to: "17 Ko" },
          { item: "Page la plus lourde, compressée", from: "27,8 Ko", to: "34 Ko" },
          { item: "Plus grosse image", from: "417 Ko", to: "500 Ko" },
        ],
      },
    },
    {
      id: "colophon-checks",
      title: "Vérifié avant chaque mise en ligne",
      paragraphs: [
        "Chaque règle des scripts est écrite à part, en TypeScript pur, et testée ; chaque comportement est aussi vérifié dans un vrai navigateur. Ces tests tournent à chaque modification, avec un audit des dépendances : si l'un échoue, le site en ligne reste la version précédente.",
      ],
    },
  ],
  accessibility: {
    before: "Le site a aussi été audité selon le RGAA, le référentiel d'accessibilité : voir la",
    link: "déclaration d'accessibilité",
    after: ".",
  },
});

export const colophonEn = {
  title: "How this site is built",
  metaTitle: `How this site is built | ${site.author}`,
  metaDescription:
    "Behind the scenes of Damien Aravena Bravo's portfolio: the glyph texture of the background, the theme change and the performance work, with before and after figures.",
  intro:
    "This site is a project like any other, and most of its work is out of sight. Here is what happens under the surface, with the measured figures.",
  source: "Read the code on GitHub",
  newTab: "(new tab)",
  sections: [
    {
      id: "colophon-base",
      title: "The foundations",
      paragraphs: [
        "A fully static site, built with Astro and Tailwind CSS and served by GitHub Pages: no server, no database. Every page exists in French and in English.",
        "JavaScript is limited to the router that moves between pages without a reload and a handful of behaviours. Without it, all the content stays readable and every link works.",
      ],
    },
    {
      id: "colophon-glyphs",
      title: "A background made of glyphs",
      paragraphs: [
        "The background is a photo of crumpled metal, rebuilt out of characters. Each 4-pixel cell becomes a glyph from the ramp “ ·:+×xX#”, from lightest to densest, and a 4 × 4 Bayer dither renders the shades in between. It is all drawn on a canvas, in IBM Plex Mono.",
        "The same engine renders the project covers, animated on hover, the skill logos, and a fragment of the texture hidden in every button.",
        "To stay light, it reads a copy of the photo scaled down to 480 pixels wide: one pixel per cell is enough. A single loop runs, at 12 frames per second; it only repaints the cells that change and stops off screen. The animation can be turned off in the settings, and turns itself off if your system asks for less motion.",
      ],
    },
    {
      id: "colophon-theme",
      title: "The theme change",
      paragraphs: [
        "The theme button does not just fade: the new theme is revealed from top to bottom, then from bottom to top on the next change, behind a front of glyphs with a ragged edge, in one second.",
        "It is a browser View Transition. Its mask is an SVG image drawn once, then slid by a native animation; the front's canvas only paints the lines it crosses. While it runs, the background texture repaints in the new colours in 3-millisecond slices, visible lines first, so that it is ready before the front reaches it.",
        "The light theme adds no classes: it gives each shade of grey a light value, and the background becomes cream paper. Every component keeps its hierarchy in both themes.",
      ],
    },
    {
      id: "colophon-performance",
      title: "The performance work",
      paragraphs: ["Every fix was measured on the built site, before and after."],
      table: {
        caption: "The measured gains, before and after each fix",
        headers: { item: "Item", from: "Before", to: "After" },
        rows: [
          {
            item: "Background photo",
            from: "5.2 MB lossless, 319 ms to download",
            to: "417 KB as WebP, with no visible difference on screen",
          },
          { item: "Copy read by the texture", from: "427 KB", to: "51 KB" },
          {
            item: "Background arrival, on slow 4G",
            from: "377 ms, after the stylesheet",
            to: "From the HTML, alongside the stylesheet",
          },
          {
            item: "Chrome shine on headings",
            from: "~9% of the CPU per heading, even off screen",
            to: "Paused as soon as it leaves the screen",
          },
        ],
      },
      note: "Smaller gains add up too: the tab icons are no longer downloaded again on every page, and the texture only prepares distant surfaces when the browser is idle.",
    },
    {
      id: "colophon-budget",
      title: "A budget to make it last",
      paragraphs: [
        "These gains only matter if they hold. After every build, continuous integration measures the site, and blocks the release if any item goes over its cap.",
      ],
      table: {
        caption: "The performance budget, measured in November 2026",
        headers: { item: "Item", from: "Today", to: "Cap" },
        rows: [
          {
            item: "JavaScript, whole site",
            from: "59 KB (26.2 KB compressed)",
            to: "70 KB (30 KB compressed)",
          },
          { item: "Stylesheet, compressed", from: "13.9 KB", to: "17 KB" },
          { item: "Heaviest page, compressed", from: "27.8 KB", to: "34 KB" },
          { item: "Largest image", from: "417 KB", to: "500 KB" },
        ],
      },
    },
    {
      id: "colophon-checks",
      title: "Checked before every release",
      paragraphs: [
        "Every rule in the scripts is written separately, in plain TypeScript, and tested; every behaviour is also checked in a real browser. These tests run on every change, along with a dependency audit: if one fails, the live site stays on the previous version.",
      ],
    },
  ],
  accessibility: {
    before: "The site has also been audited against the RGAA, the French accessibility framework: see the",
    link: "accessibility statement",
    after: ".",
  },
} satisfies Colophon;
