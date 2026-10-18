---
title: "Building a website"
summary: "Requirements gathering, then a simple website presenting Capgemini to middle school students, reworked and expanded in 2026."
tags: ["HTML", "CSS", "Responsive design", "Eco-design", "Requirements gathering"]
status: "termine"
team: "Team of 4"
year: 2024
order: 5
cover: web
featured: true
links:
  site: "https://aravenad.github.io/site-capgemini-3e/"
  repo: "https://github.com/aravenad/site-capgemini-3e"
role:
  - "Project lead of the team of four."
  - "Research on Capgemini’s organization, strategy and values for the company fact sheet, then its layout with a teammate."
  - "Mockup of the home page in Whimsical."
  - "HTML structure of the whole site, which I moved ahead on my own so the group could focus on the CSS, then work on the CSS."
  - "In 2026, a solo rework of the whole site: content, responsive layout and a much lighter page weight."
competences: ["conduire", "collaborer"]
learned:
  - "Sorting through a mass of information and explaining it to a non-specialist audience."
  - "Going from a client’s need to a mockup, then to a site that matches it."
  - "Working on the same code as a team with Git, GitHub and Live Share."
  - "Writing a structured document: automatic table of contents, numbered pages, captioned figures, dated list of sources."
  - "Making a site lighter: resized WebP images, a self-hosted font, no external service."
  - "Adapting a site to phones and checking its code with the W3C validator."
---

## Context

A first-year project, run from September 2023 to January 2024 and shared by
two course units: "Requirements gathering" and "Discovering the economic and
ecological environment". Each group picked a digital services company from a
list of eleven; ours took Capgemini.

The brief started from an observation: corporate websites are often
promotional, written for professionals and quick to push the trendy topics of
the day. We had to build one that presents the company to middle school
students (aged 14 to 15) looking for a work placement, who know little about
the working world.

## Goals

- Research and summarize information about the company: business, services,
  organization, competitors, clients, funding, strategy and values.
- Analyze its digital and ecological transition: current situation,
  constraints, expected benefits.
- Explain economics and management vocabulary to middle school students.
- Design a mockup, then build a site that is simple both visually and
  ecologically.

## Implementation

### Phase 1: requirements gathering

Each of us first researched the company as a whole, on its corporate website
and on other sources to keep an objective view, then its ecological
transition. We pooled our notes in a Google Doc. The deliverable was a company
fact sheet written in Word, following the standards of a professional
document: title page, automatic table of contents, numbered pages, captioned
figures and a dated list of sources.

### Phase 2: design

After analyzing the need, each of us made mockups of one or more of the six
pages in Whimsical, and we used Notion to organize the project. The mockup was
handed in mid-December, then reviewed in class: that feedback shaped the design
before development.

### Phase 3: development

The site was built in HTML5 and CSS3 in Visual Studio Code, with the Live Server
extension to see changes live. The start was hard, as we had no method for
working on the same code together. A GitHub repository and the Live Share
extension solved it, including for working from home. The project ended with a
group presentation of the site and an individual talk on our self-assessments.

## 2026 rework

In October 2026, I reworked the site on my own to bring it closer to the brief:
the version handed in in January 2024 loaded 25 MB of images and was not built
for phones.

- **Content**: new pages on the company (figures, history, organization,
  competitors), its climate commitments, its jobs, finding a work placement and
  a glossary of business terms. The values and services pages are rewritten
  with concrete examples, the sectors rebuilt from Capgemini's own, and dead
  sources replaced.
- **Lightness**: images are converted to WebP and resized, from 25 MB down to
  under 1 MB. Font Awesome is gone, the font is self-hosted, and the site no
  longer calls any external service. Every page weighs under 250 KB.
- **Display**: the site now adapts to phones, where students will mostly read
  it, with a dedicated menu. The header and footer are redone, and the code
  passes the W3C validator.

## Results

The site presents Capgemini in an educational way to middle school students,
while highlighting its environmental commitments. In my 2024 self-assessment, I
rated the project management skill as acquired, and teamwork as still in
progress: collaborating on the code had been a problem at first. That is what
this project taught me most, along with turning a client's need into a site
architecture and explaining things to a non-technical audience.
