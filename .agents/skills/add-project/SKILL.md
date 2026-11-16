---
name: add-project
description: Scaffold a truthful draft case study in `src/content/projects/`. Use when asked to add, start, or scaffold a portfolio project.
---

# Add project

Create a safe draft through the repository's own generator. Every fact in the entry comes from the user; unknown facts stay as TODOs.

1. Read [docs/content.md](../../../docs/content.md) and the `projects` schema in `src/content.config.ts`. The schema is authoritative.
2. Get a real project title and a lowercase kebab-case slug from the request. Ask only for a missing value. Done when both are confirmed by the user's words.
3. Check that `src/content/projects/<slug>.md` does not exist and that the path has no conflicting uncommitted change. An existing slug stops the task.
4. Run:

   ```sh
   npm run content:add-project -- --slug <slug> --title "<title>"
   ```

5. Replace only the TODO fields and sections the user supplied verified facts for. Keep `draft: true`.
6. Run `npm run check` and inspect the new file. Run `npm run build` too if a route or the schema changed in the same task.
7. Report the created path, every remaining TODO, and the validation result.

## Boundaries

- A client, product, role, technology, metric, date, or outcome is never guessed or inferred.
- Publishing the draft is the owner's separate decision.
- Confidential details stay out of the entry.
