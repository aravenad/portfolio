---
title: "Algorithm comparison"
summary: "Automatic classification of news dispatches using weighted lexicons, built in pairs, then reworked in 2026 to make its evaluation sound and compare it with other machine learning methods."
tags: ["Java", "Algorithms", "Optimization", "Machine learning", "Unit testing"]
status: "termine"
team: "In pairs"
year: 2024
order: 3
cover: algo
featured: true
links:
  repo: "https://github.com/aravenad/comparaison-algorithmique"
role:
  - "Hand-written lexicons for economy and environment-science, and the class that pairs a word with its weight."
  - "Lookup functions on the lexicons: the weight of a word, the category with the best score."
  - "Automatic lexicon generation, with my teammate."
  - "Optimization: binary search with my teammate, then stop words stored in a HashSet and scores computed with a HashMap."
  - "In 2026, a solo rework of the project: fixes, tests, lexicons tuned by cross-validation and a comparison with other methods."
competences: ["realiser", "optimiser"]
learned:
  - "Measuring a program’s running time and reducing the complexity of its algorithms: binary search, hash tables, a suitable sort."
  - "Splitting work across several threads, and waiting for them to finish before using their result."
  - "Evaluating a classifier on data it has never seen, and tuning its parameters by cross-validation."
  - "Implementing classic machine learning methods without a library: naive Bayes, TF-IDF, nearest neighbors, logistic regression."
  - "Reading a confusion matrix to understand where a classifier goes wrong."
  - "Setting up a Java project: Maven, JUnit 5 tests, continuous integration with GitHub Actions."
---

## Context

A first-year project, carried out in pairs from January 15 to 19, 2024 for the
"Comparing algorithmic approaches" course unit. The client, a fictional one, was
a news website that wanted to sort its articles by category automatically to
make archiving easier, relying only on the associated dispatches.

The university provided the program's skeleton in Java and two sets of
dispatches from 2008: 500 for training and 500 for testing, a hundred per
category.

## Goals

- Assign each dispatch to one of five categories: environment-science,
  culture, economy, politics and sports.
- Write a lexicon of weighted words by hand for each category, then generate
  these lexicons automatically from dispatches already classified.
- Analyze the complexity of the algorithms and reduce the running time.

## Implementation

### Phase 1: hand-written lexicons

Each lexicon lists the words typical of a category, with a weight from 1 to 3:
"match" or "player" for sports. A dispatch's score for a category is the sum of
the weights of its words found in the lexicon, and the dispatch goes to the
category with the highest score. We each wrote some of the lexicons, then the
functions that load them, compute the scores and classify the dispatches.

### Phase 2: automatic generation

The program then builds the lexicons on its own. For a category, it collects
the words of its dispatches, leaving out stop words ("the", "of", "with"…).
Each word gains a point every time it appears in a dispatch of the category and
loses one elsewhere, then this score is turned into a weight of 1, 2 or 3.

### Phase 3: efficiency

The brief asked us to measure the running time and improve it. We kept the
lists sorted to search them by binary search, stored the stop words in a
HashSet and computed the scores with a HashMap instead of a nested loop.
Lexicon generation runs in one thread per category.

## 2026 rework

In October 2026, I reworked the project on my own. The version handed in
reported 98% of dispatches correctly classified, but it was evaluated on the
very dispatches used to build its lexicons: on unseen dispatches, it dropped to
74%. Its classification also used the lexicons from the previous run, because
the threads were only started after the lexicons had been read.

- **Reliability**: training and testing on separate dispatches, threads waited
  for before classification, accents read correctly on Windows, errors reported
  instead of being ignored. The code is now a Maven project, covered by about
  thirty JUnit 5 tests and checked by GitHub Actions.
- **Efficiency**: an index of the lexicons and a word list sorted only once
  bring the generation of the five lexicons down from 210 to 15 ms, and the
  computation of the 2,500 scores from 560 to 5 ms, with identical results.
- **Tuning**: the minimum word length and the weight thresholds are chosen by
  cross-validation on the training dispatches only, among 10,140 combinations.
  Keeping three-letter words brings back acronyms (GDP, PSG, GMO). The generated
  lexicons go from 74 to 76% accuracy.
- **Comparison**: I implemented other machine learning methods without a
  library, evaluated with the same protocol. The best one is naive Bayes applied
  to 3 to 6 letter chunks of the words, so that "footballeurs" looks like
  "football": 78%.

## Results

On the 500 test dispatches, the hand-written lexicons classify 58% correctly,
the generated lexicons 76% and naive Bayes 78%. Every method tried ends up
between 75 and 79%: the dispatches are short, 40 words on average, training
relies on only 500 examples, and the categories overlap. A dispatch about GMOs
voted on in the National Assembly, labeled environment-science, is just as much
about politics.

In 2024, the project taught me to make an algorithm faster. The rework taught
me to check a good result before believing it: our 98% came from a flaw in the
protocol, not from the quality of the lexicons.
