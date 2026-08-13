# Navfolio Main Site Agent Workspace

Only `astro-navfolio`'s own current working memory is kept here. Cross-repository ownership, dependency graph, and change ordering are maintained by the upper-level `../../.agents/`, to avoid two ecosystem maps drifting apart.

Reading order:

1. `../AGENT.md`
2. `context/current-design.md`
3. `context/current-progress.md`
4. For cross-repository tasks, additionally read the upper-level `../../.agents/context/ecosystem-map.md` and the corresponding workflows

Maintenance rules:

- `current-design.md` only records the current product shape and the real implementation boundary.
- `current-progress.md` only records landed, in-transition, and not-yet-integrated states; it does not keep a list of historical tasks.
- Current source code, manifests, lockfiles, and workflows take precedence over these documents; fix drift when you find it.
- Do not store secrets, generated data, caches, build artifacts, or large completed plans.
- Docs content belongs to the `src/docs` submodule; operate on it per the upper-level cross-repository workflows.
