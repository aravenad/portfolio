---
title: "Comparaison algorithmique"
summary: "Classification automatique de dépêches de presse par lexiques pondérés, puis optimisation des performances."
tags: ["Java", "Algorithmique", "Optimisation"]
status: "termine"
team: "En binôme"
year: 2024
order: 1
featured: true
---

## Contexte

Projet de première année de BUT informatique, réalisé en binôme pour un client
fictif : un site de presse souhaitant trier automatiquement ses articles par
catégorie (sciences, économie, politique…). Le logiciel devait classer les
articles en se basant uniquement sur les dépêches associées, afin de faciliter
l'archivage des publications.

## Objectifs

- Construire des lexiques, d'abord manuels puis générés automatiquement.
- Classer les dépêches dans cinq catégories : environnement-science, culture,
  économie, politique et sports.
- Réduire le temps d'exécution du programme.

## Réalisation

Nous avons commencé par écrire les lexiques à la main. Chaque lexique liste les
mots caractéristiques d'une catégorie, associés à un poids traduisant leur
importance — le lexique « sports » contenait par exemple « match » ou
« joueur ». Le programme charge ces lexiques en mémoire, calcule un score par
dépêche à partir des mots qu'elle contient, et lui attribue la catégorie au
score le plus élevé.

La seconde partie du projet a consisté à automatiser cette génération. Nous
avons mis en place une méthode d'apprentissage qui analyse les dépêches,
extrait les mots les plus représentatifs de chaque catégorie et leur attribue
un poids calculé à partir de leur fréquence et de leur spécificité.

L'optimisation est venue en dernier : meilleurs algorithmes de tri, et
parallélisation par threads de la génération des lexiques et de la
classification.

## Résultats

Les lexiques automatiques ont amélioré à la fois la rapidité et la précision de
la classification. La version optimisée traite les dépêches en **350 ms en
moyenne sur dix essais**, proche de l'objectif que nous nous étions fixé.

Des marges de progression subsistent : recherches et tris pourraient encore
être optimisés, et les lexiques manuels gagneraient à être plus fournis
(80 à 100 lignes) pour de meilleurs résultats.
