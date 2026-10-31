---
title: "Dauphinéo"
summary: "Site de réservation de visites guidées dans les sites patrimoniaux du Dauphiné, mené comme chef de projet d'une équipe de sept, repris et publié en 2026."
tags: ["React", "TypeScript", "Laravel", "PostgreSQL", "Gestion de projet"]
status: "termine"
team: "En équipe de 7"
year: 2024
order: 3
cover: map
featured: true
links:
  site: "https://aravenad.github.io/dauphineo/"
  repo: "https://github.com/aravenad/dauphineo"
role:
  - "Chef de projet de l’équipe de sept : répartition des rôles avec une matrice RACI, organisation des soutenances et relecture de chaque dossier avant son rendu."
  - "Modèles et contrôleurs de l’API Laravel pour les sites, les photos, les avis et les guides, documentés pour le reste de l’équipe."
  - "Premier service de recommandation, qui interrogeait l’API d’OpenAI à partir des réponses au questionnaire, et calcul de la note moyenne des avis."
  - "Paiement en ligne avec PayPal et Stripe, resté sur une branche non fusionnée, et scripts SQL pour la conformité au RGPD."
  - "En 2026, reprise seul de tout le projet : pages reliées à l’API, sécurité, recommandation, contenu, version anglaise et démonstration en ligne."
competences: ["realiser", "gerer", "conduire", "collaborer"]
learned:
  - "Séparer un site React d’une API Laravel qui fait foi pour le prix, les places restantes et la validation des données."
  - "Sécuriser une API : jetons Sanctum à durée limitée, limitation des essais, mots de passe hachés en Argon2id, politique de sécurité du contenu."
  - "Garder des données cohérentes avec un déclencheur PostgreSQL, même quand deux réservations arrivent en même temps."
  - "Appeler un modèle de langage depuis un serveur sans exposer la clé, avec un moteur local qui prend le relais."
  - "Tester une API avec Pest, puis automatiser les tests, l’analyse et le déploiement avec GitHub Actions."
  - "Coordonner sept personnes sur deux dossiers de conception, plusieurs soutenances et une démonstration."
---

## Contexte

Projet de deuxième année de BUT, la SAÉ 3.01, mené d'octobre 2024 à janvier
2025 en équipe de sept. Le client demandait une application web pour valoriser
le patrimoine culturel ; nous avons proposé de la consacrer aux Sites
Patrimoniaux Remarquables (SPR), ces villes et villages dont le centre ancien
est protégé, comme Grenoble ou Saint-Antoine-l'Abbaye. Nous l'avons appelée
**Dauphinéo**.

Le projet se déroulait en trois phases : un dossier de cadrage, un dossier de
conception, puis le code, chacune conclue par une soutenance, avec en plus un
pitch et une rétrospective en anglais.

## Objectifs

- Donner sur chaque site une fiche claire et vérifiée : description, photos,
  thèmes, carte et accessibilité.
- Recommander des sites à partir d'un questionnaire sur les envies du visiteur.
- Réserver une visite avec un guide local, sur un créneau et pour un nombre de
  personnes donnés.
- Laisser un avis et une note sur un site visité.

## Réalisation

### Phase 1 : cadrage

Le premier dossier comparait Dauphinéo à TripAdvisor, Airbnb Expériences et
Booking : aucun ne réunissait fiches détaillées, recommandations, réservation
de guides et avis. Nous y avons analysé les contraintes et les risques du
projet, chacun noté avant et après mitigation, réparti les rôles avec une
matrice RACI et décrit trois personas : une personne âgée, une famille et
une personne à mobilité réduite. L'équipe communiquait sur Discord, suivait ses
tâches dans un tableau Kanban sur Notion et partageait le code sur le GitLab de
l'université.

### Phase 2 : conception

Le deuxième dossier décrivait neuf cas d'utilisation, les maquettes de chaque
page sur Figma, l'architecture du code et le schéma de la base de données. Nous
avons choisi React et TypeScript avec la bibliothèque MUI pour le site, Laravel
pour l'API et PostgreSQL pour la base, après avoir comparé leurs avantages et
leurs limites.

### Phase 3 : développement

Le code a été écrit en trois semaines, en janvier 2025. Chacun avançait sur sa
branche : le site React d'un côté, l'API Laravel et la base de l'autre. J'ai
écrit les modèles et les contrôleurs de plusieurs ressources de l'API, ainsi
qu'une première recommandation qui confiait le classement des sites à un modèle
d'OpenAI. Le projet s'est conclu le 24 janvier 2025 par une soutenance et une
démonstration, sur un serveur de l'IUT.

## Reprise en 2026

En octobre 2026, j'ai repris le projet seul. La version rendue en janvier 2025
n'était pas reliée à l'API sur toutes ses pages, son paiement n'avait jamais
été fusionné, et elle ne tournait que sur les serveurs de l'IUT, fermés depuis.

- **L'architecture** : toutes les pages passent par l'API, qui fait foi pour le
  prix d'une réservation, les places restantes et l'unicité d'un avis. Les
  scripts SQL deviennent des migrations, et la base se remplit à partir de
  fichiers CSV. Le projet passe à Laravel 12, React 19 et MUI 9.
- **La sécurité** : jetons qui expirent, mots de passe hachés en Argon2id,
  limitation des essais, inscription confirmée par e-mail, erreurs qui ne
  révèlent rien du serveur, politique de sécurité du contenu. Un déclencheur
  PostgreSQL empêche deux réservations simultanées de dépasser la capacité
  d'une visite, et 59 tests Pest couvrent l'API.
- **La recommandation** : un moteur local, déterministe, choisit et classe les
  sites ; Claude Haiku en rédige seulement les raisons, et le site s'en passe
  quand aucune clé n'est configurée.
- **Le contenu** : 46 sites dans tout le Dauphiné au lieu de 19 en Isère, 60
  photos sous licence libre créditées, une version anglaise complète, un tri
  par note ou par réservations et un fil d'Ariane.
- **La démonstration** : une version sans serveur, publiée sur GitHub Pages,
  qui lit les mêmes données et garde le compte, les réservations et les avis
  dans le navigateur. GitHub Actions lance les tests, l'analyse et le
  déploiement à chaque modification.

## Résultats

Dauphinéo couvre les cas d'utilisation principaux de notre conception :
fiches, exploration, questionnaire, réservation, avis et compte. Seuls le
paiement et l'espace des guides restent à faire ; le dépôt liste ces écarts
avec le dossier de conception. Comme chef de projet, j'ai retenu qu'un
découpage par couche, le site d'un côté et l'API de l'autre, repoussait
l'assemblage aux derniers jours. La reprise m'a appris à sécuriser une
application web de bout en bout et à la rendre consultable par tous, sans
serveur.
