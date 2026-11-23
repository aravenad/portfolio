---
title: "A Debian development workstation"
summary: "Complete installation and configuration of a Debian development workstation, from the system to the tools."
teaser: "Installing and configuring a Debian development machine."
tags: ["Linux", "Debian", "KDE Plasma", "JDK", "Git", "NetBeans"]
kind: "systems"
status: "termine"
team: "Solo"
year: 2024
order: 11
cover: terminal
sae: ["1.03"]
ac: ["AC13.01", "AC13.02", "AC13.03"]
---

## Context

An individual project in my computer science degree: installing and configuring a
Debian workstation for software development. It covered setting up the
operating system, installing the development tools and managing packages.

## Goals

- Install and configure a Debian workstation.
- Set up the KDE/Plasma desktop environment.
- Install and configure the JDK, Git and the NetBeans IDE.
- Optimize the system for daily development use.

## Implementation

### Preparation

I downloaded the Debian ISO image and checked its integrity with `sha512sum`,
then created the virtual machine's disk image and started the installation.

### System installation

I set the initial configuration (language, locale, keyboard, root password,
user accounts), partitioned the disk and installed the essential packages,
including the KDE/Plasma desktop environment.

### System improvements

- Configured the `apt` package manager for updates.
- Installed and configured `sudo` for administrative commands.
- Added `snapd` and `flatpak` to broaden the software sources, then removed
  unneeded packages.

### Development tools

I installed the JDK and Git through `apt`, checking each installation, then
installed NetBeans with three methods (archive, snap, flatpak) to compare them,
and created symbolic links to make the tools easier to use.

## Results

The workstation is operational: KDE/Plasma configured, JDK, Git and NetBeans
installed and working. The project gave me hands-on skills in installing Linux
systems, managing packages and configuring development tools. The next step
would be to automate all these installations with a script.
