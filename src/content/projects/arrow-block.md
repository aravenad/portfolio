---
title: "Arrow Block"
summary: "Jeu de réflexion en 3D pour téléphone : 240 niveaux vérifiés par un solveur, une version web en three.js, puis une application Flutter au moteur 3D maison."
tags: ["JavaScript", "three.js", "Flutter", "Dart", "Android"]
status: "en-cours"
team: "Projet personnel"
year: 2026
order: 2
cover: cube
featured: true
demo:
  src: "/demos/arrow-block/"
  caption: "Faire sortir tous les cubes, chacun dans le sens de sa flèche ; un cube qui en heurte un autre coûte un cœur. Toucher ou cliquer un cube pour le lancer, glisser pour tourner la forme. Au clavier : flèches pour tourner, Tab pour choisir un cube, Entrée pour le lancer, + et − pour zoomer, Échap pour la pause."
role:
  - "Conception du jeu : règles, douze mondes et leurs mécaniques, progression, missions et boutique cosmétique."
  - "Pilotage du développement avec une IA (Claude Opus 5.5) : consignes, choix techniques, relecture et validation de chaque étape."
  - "Développement de la version web, de son générateur de niveaux et de son solveur."
  - "Emballage Android avec Capacitor, puis réécriture complète en Flutter."
  - "Tests et mesures de performance sur téléphone."
competences: ["realiser", "optimiser", "conduire"]
learned:
  - "Travailler avec une IA de code : cadrer sa tâche, vérifier ce qu’elle produit, garder la main sur les décisions."
  - "Écrire un rendu 3D sans moteur : projection, tri des faces, éclairage et textures dessinés à la main."
  - "Traduire un programme d’un langage à l’autre sans changer son résultat, vérifié par des références communes."
  - "Mesurer la fluidité d’une application sur un vrai téléphone plutôt que de la supposer."
  - "Garder une seule source pour les niveaux et les textes, et générer le reste à partir d’elle."
---

## Contexte

Arrow Block est un projet personnel, commencé en 2026 en parallèle de ma
2e année de BUT. C'est un jeu de réflexion en 3D : une forme faite de cubes
fléchés, qu'il faut défaire en lançant les cubes dans le bon ordre. Un cube
part dans le sens de sa flèche ; s'il en heurte un autre, le joueur perd un
cœur.

Le jeu est né en page web, puis a pris la direction du téléphone : d'abord la
même page emballée pour Android, ensuite une vraie application.

## Objectifs

- Un jeu complet : 12 mondes de 20 niveaux, un défi du jour, une série, des
  missions et des pièces de puzzle à collectionner, sans publicité ni achat.
- Des niveaux toujours faisables, et de difficulté croissante.
- Une application fluide sur téléphone, en 11 langues.
- Une démo jouable ici, tirée de la même source que le jeu.
- Découvrir ce qu'une IA de code permet sur un projet complet, et apprendre à
  m'en servir.

## Démarche : un projet mené avec l'IA

J'ai mené ce projet avec une intelligence artificielle : Claude Opus 5.5,
d'Anthropic, réglé sur un effort de raisonnement élevé, d'abord en conversation
puis dans Claude Code, un agent qui lit le dépôt, écrit le code et lance les
tests. C'était un choix délibéré : voir jusqu'où va cette technologie sur un
vrai projet, de la première règle du jeu à une application sur téléphone, et apprendre à
l'utiliser maintenant plutôt que de la découvrir plus tard en entreprise.

Les rôles étaient partagés. L'IA a écrit l'essentiel du code et proposé des
solutions techniques ; je décidais de ce que le jeu devait être, je choisissais
parmi ses propositions et je validais chaque étape : relecture, essai sur mon
téléphone, et retour en arrière quand le résultat ne me convenait pas.

Travailler ainsi demande de la méthode :

- un document de passation, tenu à jour, que l'IA relit au début de chaque
  session : décisions prises, consignes à respecter, pièges déjà rencontrés ;
- des règles vérifiées par la machine plutôt que par la confiance : empreinte
  des 120 premiers niveaux, comparaison des versions JavaScript et Dart, tests
  sur le téléphone ;
- des mesures réelles (images par seconde, poids de l'application) pour juger
  une proposition, et non l'assurance avec laquelle elle est présentée.

Ce que j'en retiens pour la suite : l'IA accélère énormément l'écriture du
code, au point qu'un étudiant seul peut mener un projet de cette taille, mais
elle ne sait pas ce qui compte pour le projet, et peut se tromper avec aplomb.
Le métier de développeur se déplace vers la spécification, l'architecture, les
tests et la relecture critique : savoir précisément ce que l'on veut, et
prouver qu'on l'a obtenu. Cela pose aussi des questions que je garde en tête :
rester capable de comprendre et de reprendre le code produit, assumer la
responsabilité de ce qui est livré, et ne pas confondre aller vite avec bien
faire.

## Réalisation

### Version web

Le jeu est écrit en JavaScript, sans framework, avec three.js pour la 3D. Les
240 niveaux ne sont pas dessinés à la main : un générateur les construit à
partir d'une graine, et un solveur vérifie que chacun se termine. Une empreinte
des 120 premiers niveaux, contrôlée par l'intégration continue, garantit qu'une
modification ne change pas les niveaux déjà joués. La musique et les effets
sonores sont générés par le navigateur (Web Audio), sans fichier son.

La caméra se cadre seule pendant la partie. La première version tournait sans
cesse et cachait parfois les cubes jouables ; je l'ai refaite en lançant des
rayons dans la grille pour mesurer ce que le joueur voit vraiment, et en
choisissant la meilleure vue parmi 96. Rejouée sur les 240 niveaux, elle passe
de 369 rotations à 7.

### Application Android

Pour avoir des joueurs tôt, la version web a d'abord été emballée pour Android
avec Capacitor. L'application définitive est réécrite en Flutter. Plutôt qu'un
moteur 3D encore instable, j'ai écrit un rendu 3D maison sur le canevas de
Flutter : projection des cubes, tri de l'arrière vers l'avant, éclairage et
flèches plaquées en texture, le tout en un seul appel de dessin.

La logique du jeu a été traduite en Dart ligne à ligne. Des tests comparent les
240 niveaux des deux versions champ par champ : la moindre différence de calcul
entre JavaScript et Dart changerait les niveaux. La sauvegarde est commune aux
deux applications, pour qu'un joueur garde sa progression en passant de l'une
à l'autre.

### Démo

La démo ci-dessus est la version web du jeu, réduite à trois niveaux et
compressée en un seul fichier. Elle tourne dans un cadre isolé de la page et ne
communique avec elle que par messages : prête, hauteur conseillée, niveau
réussi. Elle se joue aussi au clavier.

## Résultats

Sur un Samsung Galaxy S23, le plus gros niveau (216 cubes) tourne à 120 images
par seconde, l'affichage d'une image prenant environ 2 ms sur les 8 disponibles.
Le jeu est traduit en 11 langues, et sa logique est couverte par des tests en
JavaScript, en Dart et sur le téléphone lui-même.

Ce projet m'a surtout appris à mesurer avant d'optimiser, à vérifier une réécriture par
des références plutôt qu'à l'œil, et à travailler avec une IA sans lui confier
mon jugement.
