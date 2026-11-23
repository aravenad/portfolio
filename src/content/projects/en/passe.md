---
title: "PASSE"
summary: "A web application that guides new students in Grenoble facing financial hardship to health and food support, which I am leading as project manager of a team of seven."
teaser: "A web application that guides students to health and food support."
tags: ["Symfony", "Twig", "PostgreSQL", "Leaflet", "OpenStreetMap", "Docker", "Figma", "Jira", "Git"]
kind: "web-app"
status: "en-cours"
team: "Team of 7"
year: 2026
order: 2
cover: web
featured: true
role:
  - "Project manager: organizing the team of seven in Scrum sprints on Jira, running the rituals, tracking the schedule and liaising with the mentors."
  - "Project framing: scope prioritized with the MoSCoW method, a register of 21 constraints and risks scored by criticality, a fallback strategy."
  - "Sprint planning: the team’s capacity estimated in story points, and each sprint’s workload checked against it."
  - "The application’s style guide: a palette drawn from the university’s identity, typefaces and a contrast matrix."
sae: ["3.Real.01"]
ac: ["AC21.01", "AC21.02", "AC25.02", "AC25.03", "AC25.04", "AC26.02", "AC26.03", "AC26.04"]
learned:
  - "Framing a product from a pitch: problem, target users, priorities and risks."
  - "Scoring risks by impact and likelihood, and planning a fallback version for each use case."
  - "Designing an accessible style guide, with contrast checked against WCAG 2.2 and the RGAA."
  - "Running a team in sprints: short stand-ups, peer review and a definition of done."
---

## Context

SAÉ 3.01, a second-year BUT course project titled "Developing and deploying
an application", running from October 12, 2026 to January 22, 2027. Starting
from a need described in a few lines, each team must gather and formalize the
requirements, then build a secure client-server application backed by a
database, with attention to usability, software quality and security. Fifteen
teams of six or seven students work on it, each mentored by two teachers: ten
weeks of two half-days a week, then three full-time weeks.

The shared brief: help future students discover university life in Grenoble
through personalized services. The Université Grenoble Alpes welcomes about
57,000 students across some fifteen sites. After a creativity session, we
presented our pitches to the mentors on October 23; the one selected targets
new students facing financial hardship. Support exists, but it is scattered
across the university, the CROUS student services, the family allowance office,
the metropolitan area and local associations: many students find out about it
too late, or never.

Our application is called PASSE, the French acronym for "Access Point to
Student Support Services". It is a guide: it informs students and points them
to the official services, without replacing them.

## Goals

- Bring together the health and food support available in Grenoble; other
  topics (financial aid, housing, transport, sport) link to the official site.
- Let anyone browse without an account: service pages, a map of places and a
  calendar of food distributions. An account, with a short needs questionnaire,
  personalizes the home page.
- Reach any service page in three clicks at most from the home page, on a phone
  first, without ever showing the word "hardship", so that no one feels
  labeled.
- Let local associations manage their own page and publish their food
  distributions, once an administrator has approved their request.
- Provide reliable information: every page cites its source and the date it
  was last checked, and the demo will include at least thirty real ones.
- Comply with GDPR and security practice: only an email address is required,
  the need for psychological support is optional and asks for separate consent,
  passwords are hashed, the site runs over HTTPS and follows the OWASP Top 10.

## Work

### Phase 1: framing and requirements

Delivered on November 18, 2026 as a design report.

The framing draws on two recent national surveys, by the Cop1 association with
Ifop and by the French Observatory of Student Life: one student in three has
already skipped meals for lack of money, over half say they are poorly informed
about psychological support, and fewer than three in ten students in distress
have seen someone. We compared five existing solutions, from the UGA student
portal to the government's MesServices site: none combines filtering by
profile, a map, health and food together, and publishing by local
associations.

The scope of the final version is prioritized with the MoSCoW method. A
register lists 21 constraints and risks, scored by impact and likelihood; once
treated, none exceeds a criticality of 4 out of 9. A fallback strategy sets,
for each use case, the reduced version to deliver if time runs short, rather
than dropping it.

Four personas, from a 17-year-old who has just arrived in Grenoble alone to the
president of a food aid association, lead to 14 user stories. The 27
functional requirements are grouped into 15 use cases for five actors
(visitor, registered student, verified student, association, administrator):
14 Must, 7 Should and 6 Could. The ten non-functional requirements are
measurable, each with its own verification method: a service found in under
two minutes, a SUS usability score of at least 70, WCAG 2.2 level AA, a page
displayed in under 2.5 s on 4G. Signing up, publishing a food distribution and
an association claiming its page are modeled with a flowchart and two BPMN
diagrams.

### Architecture and technical choices

The team knows PHP, but none of us had used Symfony or Twig before. The chosen
stack therefore stays close to what we know: Symfony 7 and Twig for
server-rendered pages that stay light on a modest phone, PostgreSQL 16, Leaflet
and OpenStreetMap for the map, EasyAdmin for the back office. Each developer
will validate it with a proof of concept in sprint 3.

The application will run on two virtual machines at the IUT2. The application
VM is the only one exposed to the Internet, over HTTPS; the data VM only
accepts database connections from the first one, over TLS. Reviews and
suggested content are checked by rules before publication, and a local AI may
be added as an option, without any student's text ever leaving the IUT's
servers. As the VMs have no mail server, decisions are shown in a notification
center on the site.

### Style guide

The style guide follows the Université Grenoble Alpes' current identity, taken
from its website rather than from the 2016 guidelines: orange and night blue,
with the Calistoga and Open Sans typefaces. Designed for phones, it targets
WCAG 2.2 level AA, checked against the RGAA, the French accessibility
framework: a contrast matrix sets which colors each kind of text may use, and
nothing overflows at a width of 320 px. Wireframes for the 27 screens, 24 for
phones and 3 for desktop, are in progress on Figma.

### Organization

The team has five students from the RA track (application development) and two
from the DACS track (deployment and security). It follows Scrum in two-week
sprints tracked on Jira, with Git for code and deliverables and Docker Compose
for the same environment on every machine. Each session opens with a
ten-minute stand-up (done, to do, blockers), and a task is only done once a
peer has reviewed it and it is merged on Git. Each area has an owner and a
backup, assigned by track and then checked against the Belbin test; a RACI
matrix states who does, owns, is consulted on or informed of each work package.

As project manager, I estimated the team's capacity: 28 guaranteed hours a
week, 80% of them planned to absorb absences and the unexpected, or 22
guaranteed story points per sprint. Each sprint's workload is checked against
that capacity, and Should stories only make it into the last sprint if we are
ahead.

## Coming next

- **Phase 2**, due December 18, 2026, still devoted to design: the data model
  (conceptual, then logical) and a test dataset, mockups that follow the style
  guide, technical choices validated by proofs of concept, and environments
  ready for development: two hardened VMs, HTTPS, backups and continuous
  integration.
- **Phase 3**, due January 22, 2027: developing the Must features in January,
  starting with browsing service pages without an account, entering thirty real
  pages, security and user testing, then the final presentation and demo,
  after an oral presentation in English on January 15.

This page will be completed as the project progresses: screenshots of the
application and a review.
