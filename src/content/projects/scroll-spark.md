---
title: "Scroll Spark: capture ideas while you scroll"
summary: "A web app and Chrome extension, built on the Buffer API for the Buffer Commit contest, that captures a post you like while scrolling, checks how it fits each of your channels, and turns it into a Buffer Idea and post."
role: "Solo creator and developer"
technologies:
  - TypeScript
  - Next.js
  - React
  - PostgreSQL
  - Buffer API
  - Claude API
  - Chrome extension
  - Claude Code
outcomes:
  - "Live on Vercel, where any Buffer user can connect their account."
  - "Open source under the MIT License."
featured: false
draft: false
publishedAt: 2026-11-12
repositoryUrl: "https://github.com/bernardosevero/scroll-spark"
liveUrl: "https://scroll-spark-app.vercel.app/"
links:
  - label: "Open the app"
    url: "https://scroll-spark-app.vercel.app/"
  - label: "Repository"
    url: "https://github.com/bernardosevero/scroll-spark"
problem: "Inspiration shows up while scrolling, then gets lost. Even when it is saved, there is no quick way to judge whether it is worth posting, and turning it into a post means switching apps. One account can also run very different channels, so a topic that fits one may have no place on another."
constraints:
  - "Built solo within the contest's build window, from October 28 to November 13, 2026."
  - "The contest required an OAuth app client that any Buffer user can connect, live at a public URL throughout judging."
  - "Buffer's API gives app clients no post metrics, so the app cannot honestly predict how a post will perform."
  - "Buffer refresh tokens are single-use, and reusing one revokes the whole grant."
decisions:
  - "Check fit per channel, not per account, and show counts and dates of matching posts instead of a predicted score. The model returns post IDs and cluster names; code validates every ID and computes the numbers, so they cannot be hallucinated."
  - "Draft posts from the angle and a short summary only, never the captured text, so the app cannot act as a content spinner."
  - "Make the website the complete product and the Chrome extension a thin client on the same API, so the core capture, idea and post flow works without an install."
  - "Lock each user's token row during a refresh and ask the user to reconnect when the result is unclear, rather than risk reusing a spent refresh token."
  - "Save to Buffer only on an explicit click, with Save as draft as the primary action and Add to queue as a second button that names the channel."
contribution: "Solo entry: defined the product and its decisions, designed its Riso Print visual style, and built the Next.js website, the Chrome side-panel extension and the backend that connects Buffer, Claude and Postgres, using Claude Code as the coding agent."
lessons: []
---

Scroll Spark is my entry for Buffer Commit, Buffer's developer contest for apps that make creating and publishing content noticeably better with the Buffer API.

Capture a post from the website or from a Chrome side panel. Claude suggests a topic and an angle, the app checks the topic against what each of your channels has already posted, and Google Trends links help you judge demand yourself. One click saves it as a Buffer Idea, and the draft editor ships it as a Buffer post linked to that idea.

You can [open the live application](https://scroll-spark-app.vercel.app/) or read the [source on GitHub](https://github.com/bernardosevero/scroll-spark).
