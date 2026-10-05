---
title: "Setting up a workstation"
summary: "Complete installation and configuration of a Debian development workstation, from the system to the tools."
tags: ["Linux", "Debian", "System"]
status: "termine"
team: "Solo"
year: 2024
order: 8
cover: terminal
---

## Context

Individual project of my computer science degree: install and configure a
Debian workstation for software development. It covered setting up the
operating system, installing the development tools and managing packages.

## Goals

- Install and configure a Debian workstation.
- Set up the KDE/Plasma desktop environment.
- Install and configure the JDK, Git and the NetBeans IDE.
- Optimize the system for daily development use.

## Implementation

### Preparation

Download of the Debian ISO image and integrity check with `sha512sum`, then
creation of the virtual machine's disk image and start of the installation.

### System installation

Initial configuration (language, locale, keyboard, root password, user
accounts), disk partitioning and installation of the essential packages,
including the KDE/Plasma desktop environment.

### System improvements

- Configuration of the `apt` package manager for updates.
- Installation and configuration of `sudo` for administrative commands.
- Addition of `snapd` and `flatpak` to broaden software sources, then removal
  of unneeded packages.

### Development tools

Installation of the JDK and Git through `apt`, checking each installation, then
installation of NetBeans tested with three methods (archive, snap, flatpak),
and creation of symbolic links to make the tools easier to use.

## Results

The workstation is operational: KDE/Plasma configured, JDK, Git and NetBeans
installed and working. The project gave me hands-on skills in installing Linux
systems, managing packages and configuring development tools. The next step
would be to automate all these installations with a script.
