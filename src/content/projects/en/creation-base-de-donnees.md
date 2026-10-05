---
title: "Creating a database"
summary: "Entity-relationship modeling, PostgreSQL implementation and querying of a database about the sinking of the Titanic."
tags: ["PostgreSQL", "SQL", "Modeling"]
status: "termine"
team: "In pairs"
year: 2024
order: 5
cover: erd
featured: true
---

## Context

Pair project about the sinking of the Titanic: model, create and then query a
database to analyze the factors that influenced passenger survival. The work
went from collecting the data to exploiting it through queries.

## Goals

- Analyze and summarize the historical context of the sinking.
- Model the database with an entity-relationship diagram (ERD).
- Implement the database in PostgreSQL and populate it.
- Answer questions about passenger survival with queries.

## Implementation

### Analysis and modeling

We explored several sources to understand how the rescue was organized, why so
many people died and which mistakes were made. From this we derived business
rules structuring the data: passengers, ports of embarkation, cabins,
lifeboats. The ERD then modeled these entities and their relationships, with
every modeling choice justified.

### Implementation and population

We checked the consistency between the ERD and the derived relational schema,
then wrote a document justifying the origin of the attributes, the primary and
foreign keys, and the cardinalities. Next came the SQL scripts to create and
drop the tables, the integrity constraints, the data population and the
verification of the inserted data.

### Querying and analysis

Queries counting survivors and victims by class and by category (child, woman,
man), correction of erroneous data and re-execution, and finally additional
queries on the influence of the lifeboats and the age distribution of
survivors.

## Results

The queries revealed clear trends, in particular the influence of class and
gender on survival rates. The project taught me the importance of rigorous
modeling upfront: it is what makes the analyses possible later on.
