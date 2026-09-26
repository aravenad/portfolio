---
title: "Setting up network services"
summary: "Writing an installation guide in English for a Debian 12 server running Apache, PostgreSQL and PHP, validated from the host machine."
tags: ["Linux", "Apache", "PostgreSQL", "PHP"]
status: "en-cours"
team: "Solo"
year: 2025
order: 6
---

## Context

Individual project: write, in English, an installation guide for a Debian 12
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

Installation of QEMU/KVM for emulation, download of the Debian 12 ISO and
integrity check, then graphical installation: language, locale, keyboard,
hostname, root password and user creation. Partitioning was followed by the
installation of the standard system utilities, without a desktop environment,
and of the GRUB boot loader.

### Phase 2: installing the services

- **Apache**: installation with `apt-get install apache2`, start-up, service
  status check and port forwarding setup to reach it from the host.
- **PostgreSQL**: installation with `apt-get install postgresql`, creation of a
  user and a database, then opening of external connections by editing
  `postgresql.conf` and `pg_hba.conf`.
- **PHP**: installation of `php`, `libapache2-mod-php` and `php-pgsql`, then
  creation of an `info.php` file to validate the configuration.

### Phase 3: validation

Access to the Apache server from the host at `http://localhost:8080`,
connection to PostgreSQL from the host and query execution, then database
management through the phpPgAdmin web interface. Every step was documented
with screenshots and written in English.

## Results

The guide makes it possible to rebuild a complete Debian 12 server step by
step, and the resulting server serves dynamic pages that query the database.
Beyond system administration, this project made me practice technical writing
in English, where the slightest imprecision makes a step impossible to
reproduce.
