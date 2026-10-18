---
title: "Developing an application"
summary: "A Java desktop application for organizing a music festival, which I led as project manager of a team of six, then reworked and finished in 2026."
tags: ["Java", "JavaFX", "UML", "Unit testing", "Project management"]
status: "termine"
team: "Team of 6"
year: 2024
order: 3
cover: uml
featured: true
links:
  repo: "https://github.com/aravenad/musigma"
role:
  - "Project manager: split the work among the six members, tracked the deliverables, signed off on the design document, the math report and the application."
  - "Project charter, with three teammates: requirements, risk analysis and roles."
  - "Domain class diagram and an analysis of task scheduling with graph theory, each with a teammate."
  - "User interfaces, with a teammate: main window and workspace menu, concert schedule, stock and ticket screens, validated input fields."
  - "Took part in the persona, the logo, the Lean Canvas and the pitches in French and English."
  - "In 2026, a solo rework of the whole application: code audit, fixes, use cases completed, tests and usability."
competences: ["realiser", "optimiser", "conduire", "collaborer"]
learned:
  - "Modeling software in UML before coding it: detailed use cases, class, sequence and object diagrams."
  - "Building a desktop application in Java and JavaFX with an MVC architecture."
  - "Framing a project: risks scored and ranked in a criticality matrix, roles assigned with the RACI method."
  - "Splitting a team’s work to limit the dependencies between its members."
  - "Turning a business problem into a linear program and solving it."
  - "Taking over existing code: a test written before each fix, static analysis with SpotBugs and PMD."
---

## Context

An end-of-first-year project, run from April to June 2024. This "Mega SAÉ"
combined four course projects: developing an application, exploring a problem
through algorithms, running a project and organizing teamwork. It also drew on
design, user interfaces, graph theory, mathematics, communication and English,
for about 100 hours of work per student, six deliverables and three
presentations.

The brief: design and build a desktop application that helps event organizers
run their project. We chose music festivals and named the application
**Musigma**.

## Goals

- Create a festival: dates, venue, area, rental price and stages.
- Book artists and schedule their performances without overlaps.
- Define ticket types, with their prices and perks.
- Work out the stock needed from the perks of the tickets sold.
- Simulate revenue and find the most profitable ticket sales.

## Implementation

### Phase 1: framing

The [project charter](https://github.com/aravenad/musigma/blob/master/conception/note-de-cadrage.pdf) set out the functional requirements, as use cases ranked by
priority, and the non-functional ones. We analyzed twelve risks in it, from
disagreements within the team to a tool going down, each scored before and
after mitigation, then ranked in a criticality matrix. Roles were assigned with
the RACI method. The team talked on Discord, planned on Asana and shared the
code on the university's GitLab.

### Phase 2: design

The [design document](https://github.com/aravenad/musigma/blob/master/conception/dossier-de-conception.pdf) described each use case in detail, then the architecture in
UML: class, sequence and object diagrams. The [user interface document](https://github.com/aravenad/musigma/blob/master/conception/conception-des-interfaces.pdf) went from
personas to mockups, checked against usability criteria. In parallel, we
modeled ticket sales as a [linear program](https://github.com/aravenad/musigma/blob/master/conception/optimisation-des-ventes.pdf): in our example, selling 2,000 VIP and
3,000 standard tickets brings in at most €205,000, a result found graphically
and then confirmed in R.

### Phase 3: development

The application is written in Java with JavaFX, following MVC, and the schedule
relies on the CalendarFX library. We first split the work by layer: two
teammates on the data model, another one and I on the user interfaces. Each part
kept waiting for the other, which caused delays, on top of a GitLab outage and
libraries incompatible with our setup. Pair programming then gave us a shared
view of the code. The project ended on June 21, 2024 with a demo, a pitch in
English and the presentation of our Lean Canvas.

## 2026 rework

In October 2026, I reworked the application on my own to match our design
document. The version handed in in 2024 did not actually run any of its tests,
had no screen for artists, and its sales optimization gave a wrong result.

- **Reliability**: the tests finally run, every bug found is first reproduced
  by a test, and SpotBugs and PMD analyze the code. The project has more than
  80 tests.
- **Features**: the priority use cases are complete. The festival has its
  stages and an end date, artists have their own screen, and the schedule
  refuses two concerts at the same time on the same stage. The forecast screen
  shows a full balance sheet, and the optimization finds the €205,000 of our
  model.
- **Usability**: dark theme, zoom, contextual help, tooltips, keyboard
  shortcuts and a rewritten user guide. The distributable application, which
  did not start, now runs on Windows, Linux and macOS.

## Results

Musigma now covers every priority use case of our design, from creating the
festival to forecasting revenue. As project manager, the lesson I kept is our
organizational mistake: splitting the work by complete module, with model,
controller and interface together, would have kept everyone from waiting on the
others. The rework taught me to work on code I had not entirely written, making
it safe with tests before changing it.
