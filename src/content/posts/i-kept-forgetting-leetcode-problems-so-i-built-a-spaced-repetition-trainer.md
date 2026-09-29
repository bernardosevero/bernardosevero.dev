---
title: "I kept forgetting LeetCode problems, so I built a spaced-repetition trainer"
description: "Why I built dsa-learning, a small local-first web app that tells you which NeetCode 150 problem to re-solve today, and the learning research behind its design."
publishedAt: 2026-09-29
topics: [DSA, Learning, Interview Prep, React, AI]
readingMinutes: 5
---

Most people (me included) prepare for interviews like this: you solve a problem, feel good, and move on to the next one. Three weeks later the same problem shows up and your mind goes blank. You didn't really learn it. You only recognised it once.

I got tired of that, so I built [dsa-learning](https://dsa-learning.bernardosevero.dev/), a small web app based on the [NeetCode 150](https://neetcode.io/practice/practice/neetcode150) problem list. It answers one question each day: which problem should I re-solve today?

## How it works

1. **Today.** The app shows the reviews you're due for, starting with the ones you're most at risk of forgetting. It also shows the next new problem from the NeetCode 150, in topic order. There's no daily quota; you decide how much to do.
2. **Solve.** You open the problem on NeetCode and solve it from a blank editor. On a review, the app hides the pattern and your old notes, so you have to recognise the approach yourself.
3. **Log.** You rate how it felt (Hard, Medium or Easy) and record the time it took, whether you needed help, and the key insight in one sentence, in your own words.
4. **Re-solve.** Your rating schedules the next attempt:

| Felt   | Re-solve in |
| ------ | ----------- |
| Hard   | 2 days      |
| Medium | 7 days      |
| Easy   | 30 days     |

If you rate a problem Easy twice in a row, and the second time comes after the 30-day gap, it counts as mastered and stops coming back. So your daily load shrinks over time instead of growing forever.

## Why this design

I didn't want to guess, so I read learning research first. A few findings shaped the app:

- **We forget skills, not just facts.** Skill decay over time is well documented, so solved problems have to come back.
- **Spacing beats cramming.** Re-solving the same problem days apart makes it stick far better than solving it three times in one evening. Fixed intervals are enough to start with.
- **Retrieval beats re-reading.** A review means solving the problem again from scratch, not rereading your old solution.
- **Mixing topics trains pattern recognition.** New problems come topic by topic, but reviews mix topics, and the pattern stays hidden. In a real interview, nobody tells you it's a "sliding window" problem.
- **We're bad judges of our own learning.** That's why each rating has a clear definition, and the time and help you used are logged next to it.

## Research basis

| Principle | How the app uses it | Sources |
| --- | --- | --- |
| Forgetting and skill decay | Solved problems come back | [Murre & Dros 2015](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0120644), [Arthur et al. 1998](https://www.tandfonline.com/doi/abs/10.1207/s15327043hup1101_3) |
| Spacing | Re-solves are scheduled days apart. Fixed intervals are enough to start | [Cepeda et al. 2008](https://pubmed.ncbi.nlm.nih.gov/19076480/), [Dunlosky et al. 2013](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266), [Karpicke & Bauernschmidt 2011](https://pubmed.ncbi.nlm.nih.gov/21574747/) |
| Retrieval practice | A review is a re-solve from a blank editor, not a re-read | [Roediger & Karpicke 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/) |
| Interleaving | Reviews mix topics, and the pattern is hidden | [Rohrer & Taylor 2007](http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf), [Kornell & Bjork 2008](https://journals.sagepub.com/doi/abs/10.1111/j.1467-9280.2008.02127.x) |
| Blocked first, then mixed | New problems go topic by topic | [Carvalho & Goldstone 2014](https://link.springer.com/article/10.3758/s13421-013-0371-0) |
| Try first, then study the solution | A time-boxed attempt comes before the solution video | [Sinha & Kapur 2021](https://journals.sagepub.com/doi/10.3102/00346543211019105), [Kalyuga 2007](https://link.springer.com/article/10.1007/s10648-007-9054-3) |
| Self-explanation | The "key insight" field | [Bisra et al. 2018](https://link.springer.com/article/10.1007/s10648-018-9434-x) |
| Experts see the deep structure | Every problem is tagged with its pattern | [Chi et al. 1981](https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog0502_2), [Gick & Holyoak 1983](https://www.sciencedirect.com/science/article/abs/pii/0010028583900026) |
| We misjudge our own learning | Ratings have clear definitions, and time and help used are logged too | [Kornell 2009](https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1537), [Koriat & Bjork 2005](https://pubmed.ncbi.nlm.nih.gov/15755238/), [Kirk-Johnson et al. 2019](https://pubmed.ncbi.nlm.nih.gov/31470194/) |
| Scheduling algorithms | 2/7/30 is a 3-box Leitner system. FSRS is the upgrade path | [SM-2](https://www.super-memory.com/english/ol/sm2.htm), [FSRS](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/ABC-of-FSRS), [Settles & Meeder 2016](https://aclanthology.org/P16-1174/) |
| Interview practice | The NeetCode 150 curriculum. UMPIRE's _Match_ step is pattern recognition | [UMPIRE (CodePath)](https://guides.codepath.org/compsci/UMPIRE-Interview-Strategy), [Tech Interview Handbook](https://www.techinterviewhandbook.org/) |

One caveat: spacing helps less on complex tasks ([Donovan & Radosevich 1999](https://www.researchgate.net/publication/232561426_A_Meta-Analytic_Review_of_the_Distribution_of_Practice_Effect_Now_You_See_It_Now_You_Don't)), so every review has to be a full, effortful re-solve. The [repository README](https://github.com/bernardosevero/dsa-learning#-research-basis) keeps this table up to date.

## Local-first, no account

There's no login and no server. Your progress lives in your browser's storage, and you can export and import all of it as JSON. Under the hood, the app keeps an append-only history of attempts and works out each problem's state by replaying that history.

## How it was built

The stack is Vite, React and TypeScript, hosted as a static site on Cloudflare.

I also used this project to try AI-assisted development in an organised way. Every feature started as a GitHub issue with the exact types, function signatures and tests it needed. Coding agents picked up the issues in order and wrote the tests before the code for the core logic. Each pull request got an automated review, but I merged every one myself. The product decisions (intervals, the mastery rule, what stays hidden during a review) stayed with me. The agents did the implementation.

The code is open source: [github.com/bernardosevero/dsa-learning](https://github.com/bernardosevero/dsa-learning).

## What's next

Right now I'm using the app every day and writing down everything that bothers me. After that comes optional login with Google or GitHub, so your progress follows you across devices.

If you're preparing for technical interviews, give it a try: [dsa-learning.bernardosevero.dev](https://dsa-learning.bernardosevero.dev/). I'd really like to hear what works and what doesn't.
