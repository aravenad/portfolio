---
title: "Création d'une base de données"
summary: "Modélisation, implémentation PostgreSQL et interrogation d'une base sur le naufrage du Titanic."
tags: ["PostgreSQL", "SQL", "Modélisation"]
status: "termine"
team: "En binôme"
year: 2024
order: 3
featured: true
---

## Contexte

Projet en binôme portant sur le naufrage du Titanic : modéliser, créer puis
interroger une base de données pour analyser les facteurs ayant influencé la
survie des passagers. Le travail allait de la collecte des données à leur
exploitation par requêtes.

## Objectifs

- Analyser et synthétiser le contexte historique du naufrage.
- Modéliser la base à l'aide d'un schéma entités-associations (SEA).
- Implémenter la base sous PostgreSQL et la peupler.
- Répondre par des requêtes aux questions portant sur la survie des passagers.

## Réalisation

### Analyse et modélisation

Exploration de plusieurs sources pour comprendre l'organisation du sauvetage,
les causes du nombre de décès et les erreurs commises. Nous en avons tiré des
règles de gestion structurant les données : passagers, ports d'embarquement,
cabines, canots de sauvetage. Le SEA a ensuite modélisé ces entités et leurs
relations, chaque choix de modélisation étant justifié.

### Implémentation et peuplement

Vérification de la cohérence entre le SEA et le schéma relationnel dérivé, puis
rédaction d'un document justifiant l'origine des attributs, les clés primaires
et étrangères et les cardinalités. Sont venus ensuite les scripts SQL de
création et de suppression des relations, les contraintes de conformité, le
peuplement et la vérification de l'intégrité des données insérées.

### Interrogation et analyse

Requêtes de dénombrement des survivants et des victimes par classe et par
catégorie (enfant, femme, homme), correction des données erronées puis
réexécution, et enfin requêtes complémentaires sur l'influence des canots de
sauvetage et la répartition des survivants par âge.

## Résultats

Les requêtes ont fait ressortir des tendances nettes, en particulier
l'influence de la classe et du genre sur les taux de survie. Le projet m'a
appris l'importance d'une modélisation rigoureuse en amont : c'est elle qui
rend les analyses possibles ensuite.
