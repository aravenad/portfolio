---
title: "Comparaison algorithmique"
summary: "Classement automatique de dépêches de presse par lexiques pondérés, réalisé en binôme puis repris en 2026 pour fiabiliser son évaluation et le comparer à d’autres méthodes d’apprentissage."
tags: ["Java", "Algorithmique", "Optimisation", "Apprentissage automatique", "Tests unitaires"]
status: "termine"
team: "En binôme"
year: 2024
order: 5
cover: algo
featured: false
links:
  repo: "https://github.com/aravenad/comparaison-algorithmique"
role:
  - "Lexiques écrits à la main pour l’économie et l’environnement-sciences, et la classe qui associe un mot à son poids."
  - "Fonctions de recherche dans les lexiques : poids d’un mot, catégorie au meilleur score."
  - "Génération automatique des lexiques, avec mon binôme."
  - "Optimisation : recherche dichotomique avec mon binôme, puis mots vides rangés dans un HashSet et calcul des scores par HashMap."
  - "En 2026, reprise seul du projet : corrections, tests, réglage des lexiques par validation croisée et comparaison avec d’autres méthodes."
competences: ["realiser", "optimiser"]
learned:
  - "Mesurer le temps d’exécution d’un programme et réduire la complexité de ses algorithmes : recherche dichotomique, tables de hachage, tri adapté."
  - "Répartir un traitement entre plusieurs threads, et attendre qu’ils aient fini avant d’utiliser leur résultat."
  - "Évaluer un classifieur sur des données qu’il n’a jamais vues, et régler ses paramètres par validation croisée."
  - "Programmer sans bibliothèque des méthodes classiques d’apprentissage automatique : bayésien naïf, TF-IDF, plus proches voisins, régression logistique."
  - "Lire une matrice de confusion pour comprendre où un classifieur se trompe."
  - "Outiller un projet Java : Maven, tests JUnit 5, intégration continue avec GitHub Actions."
---

## Contexte

Projet de première année de BUT, mené en binôme du 15 au 19 janvier 2024 pour
la SAÉ 1.02, « Comparaison d'approches algorithmiques ». Le client, fictif,
était un site de presse qui voulait trier automatiquement ses articles par
catégorie pour faciliter leur archivage, en se fondant uniquement sur les
dépêches associées.

L'IUT fournissait le squelette du programme en Java et deux corpus de dépêches
datées de 2008 : 500 pour l'apprentissage et 500 pour le test, cent par
catégorie.

## Objectifs

- Classer chaque dépêche dans l'une des cinq catégories : environnement-sciences,
  culture, économie, politique et sports.
- Écrire à la main un lexique de mots pondérés par catégorie, puis générer ces
  lexiques automatiquement à partir des dépêches déjà classées.
- Analyser la complexité des algorithmes et réduire le temps d'exécution.

## Réalisation

### Phase 1 : lexiques manuels

Chaque lexique liste les mots caractéristiques d'une catégorie, avec un poids
de 1 à 3 : « match » ou « joueur » pour les sports. Le score d'une dépêche pour
une catégorie est la somme des poids de ses mots présents dans le lexique, et la
dépêche va à la catégorie au plus grand score. Nous avons écrit chacun une
partie des lexiques, puis les fonctions de chargement, de calcul des scores et
de classement.

### Phase 2 : génération automatique

Le programme construit ensuite les lexiques seul. Pour une catégorie, il relève
les mots de ses dépêches en écartant les mots vides (le, de, avec…). Chaque mot
gagne un point à chaque apparition dans une dépêche de la catégorie et en perd
un ailleurs, puis ce score est converti en poids 1, 2 ou 3.

### Phase 3 : efficacité

Le sujet demandait de mesurer le temps d'exécution et de l'améliorer. Nous
avons gardé les listes triées pour y chercher par dichotomie, rangé les mots
vides dans un HashSet et calculé les scores avec une HashMap plutôt qu'avec une
double boucle. La génération des lexiques tourne dans un thread par catégorie.

## Reprise en 2026

En octobre 2026, j'ai repris le projet seul. La version rendue affichait 98 %
de dépêches bien classées, mais elle s'évaluait sur les dépêches qui avaient
servi à construire ses lexiques : sur des dépêches jamais vues, elle tombait à
74 %. Son classement utilisait aussi les lexiques de l'exécution précédente, car
les threads n'étaient lancés qu'après leur lecture.

- **La fiabilité** : apprentissage et test sur des dépêches distinctes, threads
  attendus avant le classement, accents lus correctement sous Windows, erreurs
  signalées au lieu d'être ignorées. Le code est rangé dans un projet Maven,
  couvert par une trentaine de tests JUnit 5 et vérifié par GitHub Actions.
- **L'efficacité** : un index des lexiques et une liste de mots triée une seule
  fois ramènent la génération des cinq lexiques de 210 à 15 ms, et le calcul des
  2 500 scores de 560 à 5 ms, pour des résultats identiques.
- **Le réglage** : la longueur minimale des mots et les seuils des poids sont
  choisis par validation croisée sur les seules dépêches d'apprentissage, parmi
  10 140 combinaisons. Garder les mots de trois lettres ramène les sigles (PIB,
  PSG, OGM). Les lexiques générés passent de 74 à 76 % de réussite.
- **La comparaison** : j'ai programmé sans bibliothèque d'autres méthodes
  d'apprentissage, évaluées avec le même protocole. La meilleure est le bayésien
  naïf appliqué aux morceaux de 3 à 6 lettres des mots, pour que
  « footballeurs » ressemble à « football » : 78 %.

## Résultats

Sur les 500 dépêches de test, les lexiques écrits à la main en classent 58 %
correctement, les lexiques générés 76 % et le bayésien naïf 78 %. Toutes les
méthodes essayées finissent entre 75 et 79 % : les dépêches sont courtes,
40 mots en moyenne, l'apprentissage ne compte que 500 exemples, et les
catégories se recouvrent. Une dépêche sur les OGM votés à l'Assemblée, étiquetée
environnement-sciences, parle autant de politique.

En 2024, le projet m'a appris à rendre un algorithme plus rapide. La reprise
m'a appris à vérifier un bon résultat avant d'y croire : nos 98 % venaient d'une
erreur de protocole, et non de la qualité des lexiques.
