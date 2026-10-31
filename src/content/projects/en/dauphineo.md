---
title: "Dauphinéo"
summary: "A booking site for guided tours of the heritage towns of the Dauphiné, which I led as project manager of a team of seven, then reworked and published in 2026."
tags: ["React", "TypeScript", "Laravel", "PostgreSQL", "Project management"]
status: "termine"
team: "Team of 7"
year: 2024
order: 3
cover: map
featured: true
links:
  site: "https://aravenad.github.io/dauphineo/"
  repo: "https://github.com/aravenad/dauphineo"
role:
  - "Project manager of the team of seven: assigned the roles with a RACI matrix, organized the presentations and proofread every report before it was handed in."
  - "Laravel API models and controllers for the sites, photos, reviews and guides, documented for the rest of the team."
  - "The first recommendation service, which sent the questionnaire answers to the OpenAI API, and the average rating of the reviews."
  - "Online payment with PayPal and Stripe, left on a branch that was never merged, and SQL scripts for GDPR compliance."
  - "In 2026, a solo rework of the whole project: every page wired to the API, security, recommendation, content, English version and online demo."
competences: ["realiser", "gerer", "conduire", "collaborer"]
learned:
  - "Splitting a React site from a Laravel API that has the final say on prices, remaining seats and data validation."
  - "Securing an API: short-lived Sanctum tokens, rate limiting, Argon2id password hashing, a content security policy."
  - "Keeping data consistent with a PostgreSQL trigger, even when two bookings arrive at the same time."
  - "Calling a language model from a server without exposing the key, with a local engine that takes over."
  - "Testing an API with Pest, then automating tests, linting and deployment with GitHub Actions."
  - "Coordinating seven people across two design reports, several presentations and a demo."
---

## Context

A second-year BUT project, SAÉ 3.01, run from October 2024 to January 2025 by a
team of seven. The client wanted a web application that would showcase cultural
heritage; we suggested focusing it on the Sites Patrimoniaux Remarquables (SPR),
the French towns and villages whose historic centers are protected, such as
Grenoble or Saint-Antoine-l'Abbaye. We named it **Dauphinéo**.

The project ran in three phases: a scoping report, a design report, then the
code, each one closed by a presentation, plus a pitch and a retrospective in
English.

## Goals

- Give each site a clear, verified page: description, photos, themes, map and
  accessibility.
- Recommend sites from a questionnaire about what the visitor is looking for.
- Book a tour with a local guide, for a given time slot and group size.
- Leave a review and a rating on a site after visiting it.

## Work

### Phase 1: scoping

The first report compared Dauphinéo with TripAdvisor, Airbnb Experiences and
Booking: none of them combined detailed pages, recommendations, guide booking
and reviews. We analyzed the project's constraints and risks, each scored before
and after mitigation, assigned the roles with a RACI matrix and described three
personas: an older person, a family and a person with reduced mobility. The team
talked on Discord, tracked its tasks on a Kanban board in Notion and shared the
code on the university's GitLab.

### Phase 2: design

The second report described nine use cases, mockups of every page in Figma, the
code architecture and the database schema. We chose React and TypeScript with
the MUI library for the site, Laravel for the API and PostgreSQL for the
database, after weighing their strengths and limits.

### Phase 3: development

The code was written in three weeks, in January 2025. Everyone worked on their
own branch: the React site on one side, the Laravel API and the database on the
other. I wrote the models and controllers for several API resources, along with
a first recommendation feature that left the ranking of the sites to an OpenAI
model. The project ended on January 24, 2025 with a presentation and a demo, on
a university server.

## 2026 rework

In October 2026, I took the project over on my own. The version handed in in
January 2025 was not wired to the API on every page, its payment feature had
never been merged, and it only ran on the university's servers, which have since
been shut down.

- **Architecture**: every page goes through the API, which has the final say on
  a booking's price, the remaining seats and whether a review is a duplicate.
  The SQL scripts became migrations, and the database is seeded from CSV files.
  The project moved to Laravel 12, React 19 and MUI 9.
- **Security**: expiring tokens, Argon2id password hashing, rate limiting,
  sign-up confirmed by email, errors that reveal nothing about the server, a
  content security policy. A PostgreSQL trigger stops two simultaneous bookings
  from going over a tour's capacity, and 59 Pest tests cover the API.
- **Recommendation**: a deterministic local engine picks and ranks the sites;
  Claude Haiku only writes the reasons, and the site does without it when no
  key is set.
- **Content**: 46 sites across the whole Dauphiné instead of 19 in Isère, 60
  credited, freely licensed photos, a full English version, sorting by rating or
  by bookings, and a breadcrumb trail.
- **Demo**: a serverless version published on GitHub Pages, which reads the same
  data and keeps the account, bookings and reviews in the browser. GitHub
  Actions runs the tests, the linting and the deployment on every change.

## Results

Dauphinéo covers the main use cases of our design: site pages, browsing, the
questionnaire, booking, reviews and the account. Only payment and the guides'
area are left; the repository lists these gaps against the design report. As
project manager, I learned that splitting the work by layer, the site on one
side and the API on the other, pushed putting it all together back to the last
few days. The rework taught me to secure a web application end to end and to
make it available to anyone, without a server.
