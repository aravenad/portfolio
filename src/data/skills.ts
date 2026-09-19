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
  // simple-icons ne publie pas de logo Java (marque déposée) : c'est Duke, la
  // mascotte d'OpenJDK, qui en tient lieu — vérifié, aucune icône `java` dans
  // les 3 733 du jeu. Duke est un dessin au trait et ne couvre que 16 % de sa
  // boîte, contre 33 à 64 % pour ses voisins : d'où `lineArt`.
  // OpenJDK est officiellement noir : orange Java, plus lisible ici.
  { label: "Java", icon: "simple-icons:openjdk", color: "#E76F00", lineArt: true },
  { label: "Python", icon: "simple-icons:python", color: "#3776AB" },
  { label: "SQL" },
  {
    label: "PostgreSQL",
    short: "PSQL",
    icon: "simple-icons:postgresql",
    color: "#4169E1",
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
