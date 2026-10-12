---
title: "Création d'une base de données"
summary: "Modélisation en schéma entités-associations, implémentation PostgreSQL et interrogation d'une base de données sur le naufrage du Titanic."
tags: ["PostgreSQL", "SQL", "Modélisation"]
status: "termine"
team: "En binôme"
year: 2024
order: 5
cover: erd
featured: true
role:
  - "Tout le travail mené à deux, de l’analyse du naufrage aux requêtes : SEA, schéma relationnel, scripts de création et de peuplement, requêtes et rapport."
competences: ["gerer"]
learned:
  - "Passer d’un schéma entités-associations à un schéma relationnel, en justifiant clés primaires, clés étrangères et cardinalités."
  - "Créer une base PostgreSQL par scripts : tables, contraintes d’intégrité, peuplement et contrôle des données insérées."
  - "Écrire des requêtes d’agrégation : COUNT et SUM, GROUP BY et HAVING, pourcentages arrondis avec ROUND."
  - "Combiner des requêtes : sous-requêtes corrélées, filtres IN, jointures sur quatre tables, UNION pour regrouper par tranche d’âge."
  - "Recouper un résultat par une seconde requête et vérifier que les sous-totaux retombent sur le total."
---

## Contexte

Projet de première année de BUT, mené en binôme pour la SAÉ 1.04, « Création
d'une base de données », et rendu en trois étapes entre le 12 décembre 2023 et
le 11 janvier 2024. Le sujet portait sur le naufrage du Titanic : modéliser,
créer puis interroger une base de données pour analyser les facteurs qui ont
influencé la survie des passagers.

L'IUT fournissait les données : 1 309 passagers, les domestiques et leurs
employeurs, les embarcations de sauvetage avec leur emplacement et leur heure
de mise à l'eau, et l'heure de leur récupération par le Carpathia.

## Objectifs

- Analyser et synthétiser le contexte historique du naufrage.
- Modéliser la base à l'aide d'un schéma entités-associations (SEA).
- Implémenter la base sous PostgreSQL et la peupler.
- Répondre par des requêtes aux questions portant sur la survie des passagers.

## Réalisation

### Étape 1 : analyse et modélisation

Exploration de plusieurs sources pour comprendre l'organisation du sauvetage,
les causes du nombre de décès et les erreurs commises. Nous en avons tiré des
règles de gestion structurant les données : passagers, ports d'embarquement,
cabines, canots de sauvetage. Le SEA a ensuite modélisé ces entités et leurs
relations, chaque choix de modélisation étant justifié.

### Étape 2 : implémentation et peuplement

Vérification de la cohérence entre le SEA et le schéma relationnel dérivé, puis
rédaction d'un document justifiant l'origine des attributs, les clés primaires
et étrangères et les cardinalités. Sont venus ensuite les scripts SQL de
création et de suppression des relations, les contraintes de conformité, le
peuplement et la vérification de l'intégrité des données insérées.

### Étape 3 : interrogation et analyse

Les requêtes imposées dénombrent les survivants et les victimes par classe,
puis par catégorie : enfant de moins de 12 ans, femme ou homme. Chaque résultat
est recoupé par une seconde requête, classe par classe. En additionnant les
trois catégories, il manquait 263 passagers sur 1 309 : leur âge n'était pas
renseigné. Une fois la table des passagers corrigée, les catégories retombent
bien sur les 500 survivants et les 809 victimes.

Viennent ensuite les taux de survie par classe et par catégorie, puis ceux des
rescapés, les passagers qui ont pu monter dans une embarcation : par canot, par
catégorie et par classe. Les requêtes complémentaires interrogent le sort des
domestiques et de leurs employeurs, l'influence de l'emplacement des canots et
de leur heure de mise à l'eau ou de récupération, et la survie par tranche
d'âge.

## Résultats

La classe a beaucoup pesé : 62 % des passagers de première classe ont survécu,
43 % en deuxième et 26 % en troisième. Le genre plus encore : 75 % des femmes
ont survécu, contre 17 % des hommes, et la moitié des enfants. Les deux se
cumulent : 97 % des femmes de première classe ont survécu, mais seulement 36 %
des enfants de troisième, quand tous ceux de deuxième ont été sauvés. Monter
dans un canot décidait presque de tout : 37 % des passagers y ont pris place,
et 97 % d'entre eux ont survécu.

Le projet m'a appris l'importance d'une modélisation rigoureuse en amont : c'est
elle qui rend les analyses possibles ensuite. Il m'a aussi appris à vérifier un
résultat avant de l'interpréter : ce sont des totaux qui ne tombaient pas juste
qui ont révélé les âges manquants.
