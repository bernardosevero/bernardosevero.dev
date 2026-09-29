---
title: "dsa-learning: spaced repetition for coding interviews"
summary: "A local-first web app that tells you which NeetCode 150 problem to re-solve today, scheduling each review from how hard the last attempt felt."
role: "Creator and developer"
technologies:
  - React
  - TypeScript
  - Vite
  - React Router
  - zod
  - Vitest
  - Playwright
  - Cloudflare
outcomes:
  - "Live as a static site on Cloudflare, with no backend or account."
  - "Open source under the MIT License."
featured: false
draft: false
publishedAt: 2026-09-29
repositoryUrl: "https://github.com/bernardosevero/dsa-learning"
liveUrl: "https://dsa-learning.bernardosevero.dev/"
links:
  - label: "Open the app"
    url: "https://dsa-learning.bernardosevero.dev/"
  - label: "Repository"
    url: "https://github.com/bernardosevero/dsa-learning"
problem: "Interview prep usually means solving a problem once and moving on, so the same problem draws a blank a few weeks later. The app answers one question each day: which problem should I re-solve today?"
constraints:
  - "No login and no server: progress lives in the browser's storage, with JSON export and import."
  - "Reviews must be full re-solves from a blank editor, because spacing helps less on complex tasks."
decisions:
  - "Schedule re-solves at fixed 2, 7 or 30 days after a Hard, Medium or Easy rating, a three-box Leitner system with FSRS as the upgrade path."
  - "Mark a problem as mastered after two Easy ratings in a row, the second after the 30-day gap, so the daily load shrinks over time."
  - "Hide the pattern and old notes during reviews, and mix topics in reviews while new problems follow NeetCode's topic order."
  - "Keep an append-only history of attempts and derive each problem's state by replaying it."
contribution: "Designed the product from learning research and made its product decisions: the intervals, the mastery rule, and what stays hidden during a review. Each feature started as a GitHub issue with exact types, function signatures and tests; coding agents implemented them test-first, and I reviewed and merged every pull request."
lessons: []
---

dsa-learning grew out of my own interview prep: I kept forgetting problems I had already solved. Before designing it, I read research on skill decay, spacing, retrieval practice, interleaving and self-assessment, and each finding maps to a concrete feature.

I wrote more about the design, the research behind it and how it was built in the post [I kept forgetting LeetCode problems, so I built a spaced-repetition trainer](../../posts/i-kept-forgetting-leetcode-problems-so-i-built-a-spaced-repetition-trainer/).
