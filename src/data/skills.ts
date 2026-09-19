import type { Skill } from "../types";

/*
 * Langages et outils affichés en tuiles à côté du texte.
 *
 * `color` : couleur officielle de la marque, appliquée au logo au survol.
 * Trois marques ont un hex officiel noir ou très sombre (OpenJDK, JetBrains,
 * GitHub), illisible sur fond zinc : leur couleur est adaptée pour rester
 * visible, ce qui est signalé au cas par cas.
 */
export const technicalSkills: Skill[] = [
  { label: "HTML", icon: "simple-icons:html5", color: "#E34F26" },
  { label: "CSS", icon: "simple-icons:css", color: "#663399" },
  { label: "PHP", icon: "simple-icons:php", color: "#777BB4" },
  {
    label: "JavaScript",
    short: "JS",
    icon: "simple-icons:javascript",
    color: "#F7DF1E",
  },
  { label: "C++", icon: "simple-icons:cplusplus", color: "#00599C" },
  // Logo local (src/icons/java.svg) : simple-icons ne publie pas de logo Java,
  // la marque étant déposée. Celui-ci vient de devicon, sous licence MIT — voir
  // l'en-tête du fichier. Comme toutes les tasses Java, c'est un dessin au
  // trait qui ne couvre que 12 % de sa boîte contre 33 à 64 % pour ses
  // voisins : d'où `lineArt`, qui le remonte à 18 %.
  { label: "Java", icon: "java", color: "#E76F00", lineArt: true },
  { label: "Python", icon: "simple-icons:python", color: "#3776AB" },
  // SQL n'a pas de logo — c'est une norme ISO. Le cylindre générique
  // (src/icons/database.svg) est le seul pictogramme non-marque de la grille,
  // posé pour que cette tuile ne soit plus la seule sans glyphe. Pas de `color`
  // non plus : sans marque, pas de couleur de marque, la tuile ne se teinte donc
  // pas au survol — `--skill-color` retombe sur `currentColor`.
  { label: "SQL", icon: "database" },
  // L'éléphant est un dessin au trait, comme la tasse Java : 19 % d'encre là où
  // le Git et le GitHub de la même rangée en peignent 43 à 46 %. `lineArt` le
  // remonte à 28 %. Il vient de simple-icons, donc déjà en viewBox 24 : la règle
  // de SkillTile s'applique sans renormalisation.
  {
    label: "PostgreSQL",
    short: "PSQL",
    icon: "simple-icons:postgresql",
    color: "#4169E1",
    lineArt: true,
  },
  // Le logo JetBrains est un dégradé noir/rose : on garde le rose.
  {
    label: "JetBrains",
    short: "JB",
    icon: "simple-icons:jetbrains",
    color: "#FF318C",
  },
  { label: "Git", icon: "simple-icons:git", color: "#F05032" },
  // GitHub s'affiche en blanc sur fond sombre, son noir serait invisible.
  { label: "GitHub", icon: "simple-icons:github", color: "#FFFFFF" },
];

export const softSkills: Skill[] = [
  { label: "Travail en équipe", detail: "Projets de 2 à 7 personnes" },
  { label: "Gestion de projet", detail: "Découpage, planning, délais" },
  { label: "Recueil de besoins", detail: "Entretiens client, spécifications" },
  { label: "Vulgarisation", detail: "Publics non techniques" },
  { label: "Rédaction technique", detail: "Guides d'installation, rapports" },
  { label: "Anglais", detail: "Niveau B2 · guides et rapports rédigés" },
  { label: "Autonomie", detail: "Projets menés seul de bout en bout" },
  { label: "Documentation", detail: "Choix de conception justifiés" },
  { label: "Analyse de données", detail: "Nettoyage SQL, visualisations" },
];
