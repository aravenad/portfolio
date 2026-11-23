---
title: "PASSE"
summary: "Point d'Accès aux Services de Soutien Étudiant : application web qui guide les nouveaux étudiants grenoblois vers les aides de santé et d'alimentation, menée comme chef de projet d'une équipe de sept."
teaser: "Orienter les étudiants vers les aides de santé et d'alimentation."
tags: ["Symfony", "Twig", "PostgreSQL", "Leaflet", "OpenStreetMap", "Docker", "Figma", "Jira", "Git"]
kind: "web-app"
status: "en-cours"
team: "En équipe de 7"
year: 2026
order: 2
cover: web
featured: true
role:
  - "Chef de projet : organisation de l’équipe de sept en sprints Scrum sur Jira, rituels, suivi du planning et lien avec les coachs."
  - "Cadrage du projet : périmètre classé avec la méthode MoSCoW, registre de 21 contraintes et risques cotés selon leur criticité, stratégie de repli."
  - "Planification des sprints : capacité de l’équipe estimée en story points, charge de chaque sprint comparée à cette capacité."
  - "Charte graphique de l’application : palette tirée de l’identité de l’université, typographies et matrice de contrastes."
sae: ["3.Real.01"]
ac: ["AC21.01", "AC21.02", "AC25.02", "AC25.03", "AC25.04", "AC26.02", "AC26.03", "AC26.04"]
learned:
  - "Cadrer un produit à partir d’un pitch : problème, utilisateurs visés, priorités et risques."
  - "Coter des risques selon leur impact et leur probabilité, et prévoir une version de repli pour chaque cas d’utilisation."
  - "Concevoir une charte graphique accessible, aux contrastes vérifiés selon les WCAG 2.2 et le RGAA."
  - "Organiser une équipe en sprints : points courts, relecture par un pair et définition du terminé."
---

## Contexte

SAÉ 3.01 de deuxième année de BUT, « Développement et déploiement d'une
application », menée du 12 octobre 2026 au 22 janvier 2027. À partir d'un
besoin décrit en quelques lignes, chaque équipe doit recueillir et formaliser
ce besoin, puis créer une application client-serveur sécurisée, adossée à une
base de données, qui respecte l'ergonomie, la qualité logicielle et la
sécurité. Quinze équipes de six ou sept étudiants y travaillent, chacune suivie
par deux enseignants coachs : dix semaines à raison de deux demi-journées, puis
trois semaines à temps plein.

Le sujet commun : faire découvrir l'environnement universitaire grenoblois à de
futurs étudiants, grâce à des services personnalisés. L'Université Grenoble
Alpes accueille environ 57 000 étudiants sur une quinzaine de sites. Après une
séance de créativité, nous avons présenté nos pitchs le 23 octobre devant les
coachs ; celui retenu vise les nouveaux étudiants en situation de précarité. Les
aides existent, mais elles sont dispersées entre l'université, le CROUS, la
CAF, la Métropole et les associations : beaucoup d'étudiants les découvrent
trop tard, ou jamais.

Notre application s'appelle PASSE, pour Point d'Accès aux Services de Soutien
Étudiant. C'est un guide d'orientation : elle informe et renvoie vers les
services officiels, sans s'y substituer.

## Objectifs

- Rassembler au même endroit les aides de santé et d'alimentation à Grenoble ;
  les autres thèmes (aides financières, logement, transports, sport) renvoient
  vers le site officiel.
- Tout consulter sans compte : fiches, carte des lieux et calendrier des
  distributions. Un compte, complété par un court questionnaire de besoins,
  personnalise l'accueil.
- Atteindre toute fiche en trois clics au plus depuis l'accueil, sur téléphone
  d'abord, sans jamais afficher le mot « précarité », pour que personne ne se
  sente étiqueté.
- Laisser les associations locales tenir leur fiche et publier elles-mêmes
  leurs distributions, une fois leur demande validée par un administrateur.
- Donner une information fiable : chaque fiche cite sa source et sa date de
  vérification, et la démonstration en comptera au moins trente, réelles.
- Respecter le RGPD et la sécurité : seule l'adresse électronique est
  obligatoire, le besoin de soutien psychologique est facultatif et demande un
  consentement séparé, les mots de passe sont hachés, le site passe en HTTPS et
  suit le Top 10 de l'OWASP.

## Réalisation

### Phase 1 : cadrage et besoins

Rendue le 18 novembre 2026, sous la forme d'un dossier de conception.

Le cadrage s'appuie sur deux enquêtes nationales récentes, de Cop1 avec l'Ifop
et de l'Observatoire national de la vie étudiante : un étudiant sur trois a
déjà sauté des repas faute d'argent, plus de la moitié se disent mal informés
sur les aides psychologiques, et moins de trois étudiants en détresse sur dix
ont consulté. Cinq solutions existantes ont été comparées, du portail étudiant
de l'UGA à MesServices.etudiant.gouv.fr : aucune ne réunit un filtrage selon le
profil, une carte, la santé et l'alimentation, et la publication par les
associations locales.

Le périmètre de la version finale est classé avec la méthode MoSCoW. Un registre
recense 21 contraintes et risques, cotés selon leur impact et leur probabilité ;
après traitement, aucun ne dépasse une criticité de 4 sur 9. Une stratégie de
repli fixe, pour chaque cas d'utilisation, la version réduite à livrer si le
temps manque, plutôt que de l'abandonner.

Quatre personas, du primo-étudiant de 17 ans arrivé seul à Grenoble à la
présidente d'une association d'aide alimentaire, donnent 14 récits
utilisateur. Les 27 besoins fonctionnels sont regroupés en 15 cas
d'utilisation pour cinq acteurs (visiteur, étudiant inscrit, étudiant vérifié,
association, administrateur) : 14 Must, 7 Should et 6 Could. Les dix exigences
non fonctionnelles sont mesurables et ont chacune leur méthode de
vérification : un service trouvé en moins de deux minutes, un score
d'utilisabilité SUS d'au moins 70, le niveau AA des WCAG 2.2, un affichage en
moins de 2,5 s en 4G. L'inscription, la publication d'une distribution et la
revendication d'une fiche par une association sont modélisées par un logigramme
et deux diagrammes BPMN.

### Architecture et choix techniques

L'équipe connaît PHP, mais aucun de nous n'avait encore utilisé Symfony ni
Twig. La pile retenue reste donc proche de ces acquis : Symfony 7 et Twig pour
des pages rendues côté serveur, légères sur un téléphone modeste, PostgreSQL 16,
Leaflet et OpenStreetMap pour la carte, EasyAdmin pour le back-office. Chaque
développeur la validera par une preuve de concept au sprint 3.

L'application tournera sur deux machines virtuelles de l'IUT2. La VM
applicative est la seule exposée à Internet, en HTTPS ; la VM de données
n'accepte la base que depuis la première, en TLS. Les avis et les contenus
proposés sont contrôlés par des règles avant publication, et une IA locale
pourra s'y ajouter en option, sans qu'aucun texte d'étudiant ne quitte les
serveurs de l'IUT. Faute de serveur de courriel sur les VM, les décisions
s'affichent dans un centre de notifications sur le site.

### Charte graphique

La charte reprend l'identité actuelle de l'Université Grenoble Alpes, relevée
sur son site plutôt que dans le guide de 2016 : orange et bleu nuit,
typographies Calistoga et Open Sans. Pensée pour le téléphone, elle vise le
niveau AA des WCAG 2.2, vérifié avec le RGAA : une matrice de contrastes fixe
les couleurs permises pour chaque texte, et rien ne déborde à 320 px de large.
Les fils de fer des 27 écrans, 24 sur téléphone et 3 sur ordinateur, sont en
cours sur Figma.

### Organisation

L'équipe compte cinq étudiants du parcours RA et deux du parcours DACS. Elle
suit Scrum en sprints de deux semaines, suivis sur Jira, avec Git pour le code
et les livrables et Docker Compose pour un même environnement sur chaque poste.
Chaque séance commence par un point de dix minutes (fait, à faire, blocages),
et une tâche n'est terminée qu'une fois relue par un pair et fusionnée sur Git.
Chaque domaine a un garant et un suppléant, répartis selon le parcours de
chacun puis confrontés au test de Belbin ; une matrice RACI précise qui
réalise, répond, est consulté ou informé pour chaque lot de travail.

Comme chef de projet, j'ai estimé la capacité de l'équipe : 28 heures
garanties par semaine, dont 80 % planifiées pour absorber absences et imprévus,
soit 22 story points garantis par sprint. La charge de chaque sprint est
comparée à cette capacité, et les stories Should n'entrent dans le dernier
qu'en cas d'avance.

## À venir

- **Phase 2**, pour le 18 décembre 2026, encore consacrée à la conception :
  modèle de données (MCD puis MLD) et jeu de test, maquettes conformes à la
  charte, choix techniques validés par des preuves de concept, et
  environnements prêts pour le développement : deux VM durcies, HTTPS,
  sauvegarde et intégration continue.
- **Phase 3**, pour le 22 janvier 2027 : développement des Must en janvier, en
  commençant par la consultation des fiches sans compte, saisie de trente
  fiches réelles, tests de sécurité et tests utilisateurs, puis soutenance
  finale et démonstration, après une présentation orale en anglais le
  15 janvier.

Cette fiche sera complétée au fil du projet : captures de l'application et
bilan.
