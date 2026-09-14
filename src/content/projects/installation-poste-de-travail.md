---
title: "Installation d'un poste de travail"
summary: "Installation et configuration complète d'un poste de développement sous Debian, du système aux outils."
tags: ["Linux", "Debian", "Système"]
status: "termine"
team: "Seul"
year: 2024
order: 2
featured: true
---

## Contexte

Projet individuel de BUT informatique : installer et configurer un poste de
travail sous Debian, destiné au développement logiciel. Il couvrait la mise en
place du système d'exploitation, l'installation des outils de développement et
la gestion des paquets.

## Objectifs

- Installer et configurer un poste de travail sous Debian.
- Mettre en place l'environnement de bureau KDE/Plasma.
- Installer et configurer le JDK, Git et l'IDE NetBeans.
- Optimiser le système pour un usage quotidien en développement.

## Réalisation

### Préparation

Téléchargement de l'image ISO de Debian et vérification de son intégrité avec
`sha512sum`, puis création de l'image disque de la machine virtuelle et
lancement de l'installation.

### Installation du système

Configuration initiale (langue, localisation, clavier, mot de passe root,
comptes utilisateurs), partitionnement du disque et installation des paquets
essentiels, dont l'environnement de bureau KDE/Plasma.

### Amélioration du système

- Configuration du gestionnaire de paquets `apt` pour les mises à jour.
- Installation et configuration de `sudo` pour les commandes administratives.
- Ajout de `snapd` et `flatpak` pour élargir les sources de logiciels, puis
  nettoyage des paquets inutiles.

### Outils de développement

Installation du JDK et de Git via `apt` avec vérification de chaque
installation, puis installation de NetBeans testée selon trois méthodes
(archive, snap, flatpak) et création de liens symboliques pour simplifier
l'usage des outils.

## Résultats

Le poste est opérationnel : environnement KDE/Plasma configuré, JDK, Git et
NetBeans installés et fonctionnels. Le projet m'a apporté des compétences
concrètes en installation de systèmes Linux, en gestion de paquets et en
configuration d'outils de développement. L'étape suivante serait d'automatiser
l'ensemble de ces installations par un script.
