---
title: Event-driven invoicing system
summary: Moved an invoicing system to an event-driven architecture for TAG.
role: Software Engineer
technologies:
  - AWS SQS
  - AWS Lambda
  - Node.js
outcomes:
  - Doubled the resilience of the invoicing system.
featured: false
draft: false
problem: The invoicing system needed greater resilience.
constraints:
  - The work supported a subscription-commerce business.
decisions:
  - Move the invoicing system to an event-driven architecture.
  - Use AWS SQS and Lambda for the implementation.
contribution: Moved the invoicing system to an event-driven architecture using AWS SQS and Lambda.
lessons:
  - Event-driven architecture was a useful fit for improving the resilience of this invoicing workflow.
---

This case study is intentionally concise. It documents the public résumé claim without disclosing internal implementation details.
