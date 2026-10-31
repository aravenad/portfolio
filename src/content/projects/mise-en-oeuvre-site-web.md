---
title: "Mise en œuvre d'un site web"
summary: "Recueil de besoins puis réalisation d'un site sobre présentant Capgemini à des élèves de troisième, repris et enrichi en 2026."
tags: ["HTML", "CSS", "Responsive", "Écoconception", "Recueil de besoins"]
status: "termine"
team: "En équipe de 4"
year: 2024
order: 7
cover: web
featured: true
links:
  site: "https://aravenad.github.io/site-capgemini-3e/"
  repo: "https://github.com/aravenad/site-capgemini-3e"
role:
  - "Chef de projet de l’équipe de quatre."
  - "Recherches sur l’organisation, la stratégie et les valeurs de Capgemini pour la fiche de synthèse, puis mise en page de cette fiche avec un camarade."
  - "Maquette de la page d’accueil sur Whimsical."
  - "Structure HTML de l’ensemble du site, que j’ai avancée de mon côté pour laisser le groupe se concentrer sur le CSS, puis participation au CSS."
  - "En 2026, reprise seul de tout le site : contenu, mise en page responsive et allègement."
competences: ["conduire", "collaborer"]
learned:
  - "Trier une masse d’informations et l’expliquer à un public non initié."
  - "Passer d’un besoin client à une maquette, puis à un site fidèle à cette maquette."
  - "Travailler à plusieurs sur le même code avec Git, GitHub et Live Share."
  - "Rédiger un document structuré : sommaire automatique, pages numérotées, figures légendées, sitographie datée."
  - "Alléger un site : images en WebP redimensionnées, police servie en local, aucun service externe."
  - "Adapter un site au téléphone et valider son code avec le validateur du W3C."
---

## Contexte

Projet de première année de BUT, mené de septembre 2023 à janvier 2024 et
commun à deux SAE : la 1.05, « Recueil de besoins », et la 1.06, « Découverte de
l'environnement économique et écologique ». Chaque groupe choisissait une
entreprise du numérique dans une liste de onze ; le nôtre a pris Capgemini.

Le sujet partait d'un constat : les sites d'entreprise sont souvent commerciaux,
écrits pour des professionnels et prompts à mettre en avant les thèmes du
moment. Il fallait en faire un qui présente l'entreprise à des élèves de
troisième qui cherchent un stage et ne connaissent pas le monde du travail.

## Objectifs

- Rechercher et synthétiser des informations sur l'entreprise : activité,
  services, organisation, concurrents, clients, financement, stratégie et
  valeurs.
- Analyser sa transition numérique et écologique : situation actuelle,
  contraintes, avantages attendus.
- Expliquer le vocabulaire de l'économie et du management à des collégiens.
- Concevoir une maquette, puis réaliser un site sobre visuellement et
  écologiquement.

## Réalisation

### Phase 1 : recueil des besoins

Chacun a d'abord cherché des informations sur l'ensemble de l'entreprise, sur
son site institutionnel et sur d'autres sources pour garder un regard objectif,
puis sur sa transition écologique. Nous avons mis nos notes en commun dans un
Google Doc. Le rendu était une fiche « synthèse entreprise » rédigée sous Word,
avec les normes d'un document professionnel : page de titre, sommaire
automatique, pages numérotées, figures légendées et sitographie datée.

### Phase 2 : conception

Après l'analyse du besoin, chacun a maquetté une ou plusieurs des six pages du
site sur Whimsical, et Notion nous a servi à organiser la SAE. La maquette a été
rendue mi-décembre, puis revue en TP : ces retours ont fait évoluer la
conception avant la réalisation.

### Phase 3 : réalisation

Le site a été développé en HTML5 et CSS3 sous Visual Studio Code, avec
l'extension Live Server pour voir les modifications en direct. Le début a été
difficile, faute de méthode pour travailler à plusieurs sur le même code. Un
dépôt GitHub et l'extension Live Share ont réglé le problème, y compris pour
travailler chacun de chez soi. La SAE s'est conclue par une présentation du site
en groupe et un oral individuel sur nos grilles d'auto-évaluation.

## Reprise en 2026

En octobre 2026, j'ai repris le site seul pour le rapprocher du sujet : la
version rendue en janvier 2024 chargeait 25 Mo d'images et n'était pas prévue pour le
téléphone.

- **Le contenu** : de nouvelles pages sur l'entreprise (chiffres, histoire,
  organisation, concurrents), ses engagements pour le climat, ses métiers, la
  recherche d'un stage de troisième et un lexique des mots de l'entreprise. Les
  valeurs et les services sont réécrits avec des exemples concrets, les secteurs
  refaits à partir de ceux de Capgemini, et les sources mortes remplacées.
- **La sobriété** : les images passent en WebP et sont redimensionnées, de
  25 Mo à moins de 1 Mo. Font Awesome disparaît, la police est servie en local,
  et le site n'appelle plus aucun service externe. Chaque page pèse moins de
  250 Ko.
- **L'affichage** : le site s'adapte désormais au téléphone, où les collégiens
  le consulteront le plus, avec un menu dédié. L'en-tête et le pied de page sont
  refaits, et le code passe le validateur du W3C.

## Résultats

Le site présente Capgemini de façon pédagogique à des élèves de troisième, en
mettant en avant ses engagements environnementaux. Dans mon auto-évaluation de
2024, j'avais jugé la compétence de conduite de projet acquise, et celle du
travail en équipe en cours d'acquisition : la collaboration sur le code nous
avait d'abord posé problème. C'est ce que ce projet m'a le plus appris, avec la
traduction d'un besoin client en architecture de site et la vulgarisation pour
un public non technique.
