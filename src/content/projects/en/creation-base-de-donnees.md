---
title: "Creating a database"
summary: "Entity-relationship modeling, PostgreSQL implementation and querying of a database about the sinking of the Titanic."
tags: ["PostgreSQL", "SQL", "Modeling"]
status: "termine"
team: "In pairs"
year: 2024
order: 6
cover: erd
featured: true
role:
  - "All the work done together, from analyzing the sinking to the queries: ERD, relational schema, creation and population scripts, queries and report."
competences: ["gerer"]
learned:
  - "Turning an entity-relationship diagram into a relational schema, justifying primary keys, foreign keys and cardinalities."
  - "Creating a PostgreSQL database from scripts: tables, integrity constraints, population and checks on the inserted data."
  - "Writing aggregate queries: COUNT and SUM, GROUP BY and HAVING, percentages rounded with ROUND."
  - "Combining queries: correlated subqueries, IN filters, joins across four tables, UNION to group by age range."
  - "Cross-checking a result with a second query and making sure the subtotals add up to the total."
---

## Context

First-year BUT project, carried out in pairs for SAÉ 1.04, "Creating a
database", and handed in over three stages between December 12, 2023 and
January 11, 2024. The topic was the sinking of the Titanic: model, create and
then query a database to analyze the factors that influenced passenger
survival.

The IUT provided the data: 1,309 passengers, the servants and their employers,
the lifeboats with their location on deck and launch time, and the time each was
picked up by the Carpathia.

## Goals

- Analyze and summarize the historical context of the sinking.
- Model the database with an entity-relationship diagram (ERD).
- Implement the database in PostgreSQL and populate it.
- Answer questions about passenger survival with queries.

## Implementation

### Stage 1: analysis and modeling

We explored several sources to understand how the rescue was organized, why so
many people died and which mistakes were made. From this we derived business
rules structuring the data: passengers, ports of embarkation, cabins,
lifeboats. The ERD then modeled these entities and their relationships, with
every modeling choice justified.

### Stage 2: implementation and population

We checked the consistency between the ERD and the derived relational schema,
then wrote a document justifying the origin of the attributes, the primary and
foreign keys, and the cardinalities. Next came the SQL scripts to create and
drop the tables, the integrity constraints, the data population and the
verification of the inserted data.

### Stage 3: querying and analysis

The required queries count survivors and victims by class, then by category:
child under 12, woman or man. Each result is cross-checked by a second query,
class by class. Adding up the three categories left 263 of the 1,309 passengers
unaccounted for: their age was missing. Once the passenger table was corrected,
the categories added up to the 500 survivors and 809 victims.

Next came survival rates by class and by category, then those of the rescued,
the passengers who made it into a lifeboat: by boat, by category and by class.
The additional queries looked at what happened to the servants and their
employers, how the boats' location and their launch or pick-up time affected
survival, and survival by age range.

## Results

Class weighed heavily: 62% of first-class passengers survived, 43% in second
and 26% in third. Gender even more so: 75% of women survived, against 17% of
men, and half of the children. The two add up: 97% of first-class women
survived, but only 36% of third-class children, while every child in second
class was saved. Getting into a lifeboat decided almost everything: 37% of
passengers did, and 97% of them survived.

The project taught me the importance of rigorous modeling upfront: it is what
makes the analyses possible later on. It also taught me to check a result
before interpreting it: totals that did not add up are what revealed the
missing ages.
