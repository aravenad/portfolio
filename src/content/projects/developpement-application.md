---
title: "Développement d'une application"
summary: "Application de bureau en Java pour organiser un festival de musique, menée comme chef de projet d'une équipe de six, reprise et terminée en 2026."
tags: ["Java", "JavaFX", "UML", "Tests unitaires", "Gestion de projet"]
status: "termine"
team: "En équipe de 6"
year: 2024
order: 2
cover: uml
featured: true
links:
  repo: "https://github.com/aravenad/musigma"
role:
  - "Chef de projet : répartition du travail entre les six membres, suivi des rendus, validation du dossier de conception, du rapport de mathématiques et de l’application."
  - "Note de cadrage, avec trois camarades : besoins, analyse des risques et répartition des rôles."
  - "Diagramme de classes métier et analyse de la gestion des tâches par les graphes, chacun avec un camarade."
  - "Développement des interfaces avec un camarade : fenêtre principale et menu des espaces, planning des concerts, écrans des stocks et des tickets, champs de saisie contrôlés."
  - "Participation au persona, au logo, au Lean Canvas et aux pitchs en français et en anglais."
  - "En 2026, reprise seul de toute l’application : audit du code, corrections, cas d’utilisation terminés, tests et ergonomie."
competences: ["realiser", "optimiser", "conduire", "collaborer"]
learned:
  - "Modéliser un logiciel en UML avant de le coder : cas d’utilisation décrits, diagrammes de classes, de séquence et d’objets."
  - "Construire une application de bureau en Java et JavaFX selon l’architecture MVC."
  - "Cadrer un projet : risques notés et classés dans une matrice de criticité, rôles répartis avec la méthode RACI."
  - "Répartir le travail d’une équipe pour limiter les dépendances entre ses membres."
  - "Traduire un problème de gestion en programme linéaire et le résoudre."
  - "Reprendre un code existant : tests écrits avant chaque correction, analyse statique avec SpotBugs et PMD."
---

## Contexte

Projet de fin de première année de BUT, mené d'avril à juin 2024. Cette
« Méga SAÉ » réunissait quatre SAÉ : développer une application, explorer un
problème par l'algorithmique, conduire un projet et organiser un travail
d'équipe. Elle mobilisait aussi la conception, les interfaces, les graphes, les
mathématiques, la communication et l'anglais, pour environ 100 heures de travail
par étudiant, six rendus et trois présentations.

Le sujet : concevoir et développer une application de bureau qui aide des
organisateurs d'événements à piloter leur projet. Nous avons choisi les
festivals de musique et appelé l'application **Musigma**.

## Objectifs

- Créer un festival : dates, lieu, surface, prix de location et scènes.
- Engager des artistes et planifier leurs représentations sans chevauchement.
- Définir des types de tickets, avec leurs prix et leurs avantages.
- Calculer les stocks nécessaires d'après les avantages des tickets vendus.
- Simuler les recettes et trouver la vente de tickets la plus rentable.

## Réalisation

### Phase 1 : cadrage

La [note de cadrage](https://github.com/aravenad/musigma/blob/master/conception/note-de-cadrage.pdf) posait les besoins fonctionnels, sous forme de cas
d'utilisation classés par priorité, et les besoins non fonctionnels. Nous y
avons analysé douze risques, de la mésentente dans l'équipe à la panne d'un
outil, chacun noté avant et après mitigation, puis classés dans une matrice de
criticité. Les rôles étaient répartis avec la méthode RACI. L'équipe
communiquait sur Discord, planifiait sur Asana et partageait le code sur le
GitLab de l'université.

### Phase 2 : conception

Le [dossier de conception](https://github.com/aravenad/musigma/blob/master/conception/dossier-de-conception.pdf) décrivait chaque cas d'utilisation en détail, puis
l'architecture en UML : diagrammes de classes, de séquence et d'objets. Le
[document des interfaces](https://github.com/aravenad/musigma/blob/master/conception/conception-des-interfaces.pdf) partait de personas pour aboutir à des maquettes,
vérifiées avec des critères ergonomiques. En parallèle, nous avons modélisé la
vente des tickets comme un [programme linéaire](https://github.com/aravenad/musigma/blob/master/conception/optimisation-des-ventes.pdf) : sur notre exemple, vendre
2 000 tickets VIP et 3 000 tickets standard rapporte au plus 205 000 €, un
résultat trouvé graphiquement puis confirmé en R.

### Phase 3 : développement

L'application est écrite en Java avec JavaFX, en MVC, et le planning
s'appuie sur la bibliothèque CalendarFX. Nous avions d'abord réparti le travail
par couche : deux camarades sur le modèle de données, un autre et moi sur les
interfaces. Chaque partie attendait l'autre, ce qui a causé des retards, en
plus d'une panne du GitLab et de bibliothèques incompatibles avec notre
environnement. La programmation en binôme nous a ensuite donné une
vision commune du code. Le projet s'est conclu le 21 juin 2024 par une démonstration, un
pitch en anglais et la présentation de notre Lean Canvas.

## Reprise en 2026

En octobre 2026, j'ai repris l'application seul pour la rendre conforme à notre
dossier de conception. La version rendue en 2024 n'exécutait en réalité aucun
de ses tests, n'avait pas d'écran pour les artistes, et son optimisation des
ventes donnait un résultat faux.

- **La fiabilité** : les tests s'exécutent enfin, chaque défaut trouvé est
  d'abord reproduit par un test, et SpotBugs et PMD analysent le code. Le projet
  compte plus de 80 tests.
- **Les fonctionnalités** : les cas d'utilisation prioritaires sont terminés.
  Le festival a ses scènes et sa date de fin, les artistes leur écran, et le
  planning refuse deux concerts en même temps sur la même scène. L'écran des
  prévisions présente un bilan complet, et l'optimisation retrouve les
  205 000 € de notre modèle.
- **L'ergonomie** : thème sombre, zoom, aide contextuelle, infobulles,
  raccourcis clavier et guide d'utilisation refait. L'application distribuable,
  qui ne démarrait pas, fonctionne sous Windows, Linux et macOS.

## Résultats

Musigma couvre aujourd'hui tous les cas d'utilisation prioritaires de notre
conception, de la création du festival à la prévision des recettes. Comme chef de projet,
j'ai surtout retenu notre erreur d'organisation : répartir le travail par module
complet, modèle, contrôleur et interface ensemble, aurait évité que chacun
attende les autres. La reprise m'a appris à travailler sur un code que je
n'avais pas entièrement écrit, en le sécurisant par des tests avant de le
modifier.
