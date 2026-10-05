---
title: "Algorithm comparison"
summary: "Automatic classification of news dispatches using weighted lexicons, followed by performance optimization."
tags: ["Java", "Algorithms", "Optimization"]
status: "termine"
team: "In pairs"
year: 2024
order: 3
cover: algo
featured: true
---

## Context

First-year project of my computer science degree, carried out in pairs for a
fictional client: a news website wanting to sort its articles by category
automatically (science, economy, politics…). The software had to classify the
articles based only on their associated dispatches, to make archiving easier.

## Goals

- Build lexicons, first by hand, then automatically generated.
- Sort the dispatches into five categories: environment-science, culture,
  economy, politics and sports.
- Reduce the program's execution time.

## Implementation

We started by writing the lexicons by hand. Each lexicon lists the words
typical of a category, each with a weight reflecting its importance. The
"sports" lexicon, for example, contained "match" and "player". The program
loads these lexicons into memory, computes a score for each dispatch from the
words it contains, and assigns it the category with the highest score.

The second part of the project was to automate this generation. We set up a
learning method that analyzes the dispatches, extracts the most representative
words of each category and gives them a weight computed from their frequency
and specificity.

Optimization came last: better sorting algorithms, and multithreading of both
lexicon generation and classification.

## Results

The automatic lexicons improved both the speed and the accuracy of the
classification. The optimized version processes the dispatches in **350 ms on
average over ten runs**, close to the goal we had set ourselves.

There is still room for improvement: searching and sorting could be optimized
further, and the manual lexicons would benefit from being larger (80 to 100
lines) for better results.
