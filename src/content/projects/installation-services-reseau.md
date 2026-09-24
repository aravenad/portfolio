---
title: "Installation de services réseau"
summary: "Rédaction d'un guide d'installation en anglais pour un serveur Debian 12 équipé d'Apache, PostgreSQL et PHP, validé depuis la machine hôte."
tags: ["Linux", "Apache", "PostgreSQL", "PHP"]
status: "en-cours"
team: "Seul"
year: 2025
order: 6
---

## Contexte

Projet individuel consistant à rédiger, en anglais, un guide d'installation
d'un serveur Debian 12 équipé d'Apache, PostgreSQL et PHP. Le serveur devait être
fonctionnel et interrogeable depuis la machine hôte. L'exercice associait
administration système et rédaction technique.

## Objectifs

- Installer et configurer Apache pour servir des pages web.
- Installer et configurer PostgreSQL pour la gestion des bases de données.
- Installer et configurer PHP pour interroger la base depuis les pages web.
- Vérifier que le serveur est accessible depuis la machine hôte.
- Documenter chaque étape dans un guide rédigé en anglais.

## Réalisation

### Phase 1 : préparation

Installation de QEMU/KVM pour l'émulation, téléchargement de l'ISO de
Debian 12 et vérification de son intégrité, puis installation en mode
graphique : langue, localisation, clavier, hostname, mot de passe root et
création de l'utilisateur. Le partitionnement a été suivi de l'installation des
utilitaires système standards, sans environnement graphique, et du
chargeur de démarrage GRUB.

### Phase 2 : installation des services

- **Apache** : installation via `apt-get install apache2`, démarrage,
  vérification du statut du service et configuration de la redirection de port
  pour y accéder depuis l'hôte.
- **PostgreSQL** : installation via `apt-get install postgresql`, création d'un
  utilisateur et d'une base, puis ouverture des connexions externes en
  modifiant `postgresql.conf` et `pg_hba.conf`.
- **PHP** : installation de `php`, `libapache2-mod-php` et `php-pgsql`, puis
  création d'un fichier `info.php` pour valider la configuration.

### Phase 3 : validation

Accès au serveur Apache depuis l'hôte via `http://localhost:8080`, connexion à
PostgreSQL depuis l'hôte et exécution de requêtes, puis gestion des bases via
l'interface web phpPgAdmin. Chaque étape a été documentée par des captures
d'écran et rédigée en anglais.

## Résultats

Le guide permet de reconstituer pas à pas un serveur Debian 12 complet, et le
serveur obtenu sert des pages dynamiques interrogeant la base. Au-delà de
l'administration système, ce projet m'a fait travailler la rédaction technique
en anglais, où la moindre imprécision rend une étape irreproductible.
