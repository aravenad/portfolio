---
title: "A Debian web server: Apache, PostgreSQL, PHP"
summary: "Writing an installation guide in English for a Debian 12 server running Apache, PostgreSQL and PHP, validated from the host machine."
tags: ["Linux", "Debian", "QEMU/KVM", "Apache", "PHP", "PostgreSQL"]
kind: "systems"
status: "termine"
team: "Solo"
year: 2025
order: 10
cover: network
sae: ["2.03"]
ac: ["AC13.01", "AC13.02", "AC13.03", "AC13.04"]
---

## Context

An individual project: writing, in English, an installation guide for a Debian 12
server running Apache, PostgreSQL and PHP. The server had to be working and
reachable from the host machine. The exercise combined system administration
and technical writing.

## Goals

- Install and configure Apache to serve web pages.
- Install and configure PostgreSQL to manage databases.
- Install and configure PHP to query the database from web pages.
- Check that the server is reachable from the host machine.
- Document every step in a guide written in English.

## Implementation

### Phase 1: preparation

I installed QEMU/KVM for emulation, downloaded the Debian 12 ISO and checked
its integrity, then ran the graphical installer: language, locale, keyboard,
hostname, root password and user creation. After partitioning, I installed the
standard system utilities, without a desktop environment, and the GRUB boot
loader.

### Phase 2: installing the services

- **Apache**: installed it with `apt-get install apache2`, started it, checked
  the service status and set up port forwarding to reach it from the host.
- **PostgreSQL**: installed it with `apt-get install postgresql`, created a user
  and a database, then opened external connections by editing
  `postgresql.conf` and `pg_hba.conf`.
- **PHP**: installed `php`, `libapache2-mod-php` and `php-pgsql`, then created
  an `info.php` file to validate the configuration.

### Phase 3: validation

From the host, I reached the Apache server at `http://localhost:8080`,
connected to PostgreSQL and ran queries, then managed the database through the
phpPgAdmin web interface. Every step was documented in English, with
screenshots.

## Results

The guide makes it possible to rebuild a complete Debian 12 server step by
step, and the resulting server serves dynamic pages that query the database.
Beyond system administration, this project made me practice technical writing
in English, where the slightest imprecision makes a step impossible to
reproduce.
