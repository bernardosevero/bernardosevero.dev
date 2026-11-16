---
name: implementing-mcp-tools
description: Workflow for adding or changing a tool on the portfolio's read-only MCP server, from snapshot field to tested tool. Use when touching `mcp/`, `src/pages/api/v1/`, or the snapshot serializer.
---

# Implementing MCP tools

The invariants live in [docs/mcp.md](../../../docs/mcp.md). Read them first; this skill is only the order of work.

Work snapshot-first: a tool can return only what the snapshot already holds.

1. **Confirm the surface.** A new, renamed, or removed tool needs the owner's direction. A change inside an existing tool does not. Done when the tool name and its input are settled.
2. **Extend the snapshot.** Add each new field by name in the serializer, sourced from a published entry, with its canonical URL. Done when `npm run build` emits the field in `dist/api/v1/content.json` and every invariant-3 field is still absent.
3. **Extend the Worker's snapshot schema** to match. Done when the drift check passes against the freshly built snapshot.
4. **Write the tool tests first:** the happy path, each filter, an unknown ID, an empty result, and a failed snapshot fetch. Done when they are red for the right reason.
5. **Implement the tool** with zod input and output schemas and the read-only annotation. Write the description for a model choosing between tools: what it returns and when to call it. Done when the tests are green.
6. **Run the verification rows** in [docs/mcp.md](../../../docs/mcp.md#verification) that match the change. Done when every matching row has a result to report.
7. **Update the tool list** in `docs/mcp.md` if the surface changed.

Report automated results and any manual client check separately.
