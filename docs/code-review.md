# Code review

Read with the mandatory Code Review Rules in [AGENTS.md](../AGENTS.md) before changing code, scripts, or tests. Apply the same standards to generated code and inline Astro scripts.

## Choose the clearest representation

Use lookup objects or `Map` when keys select values or handlers; use `if` or `switch` when explicit branches make behavior easier to follow. No construct is mandatory. A ternary should make one simple choice without side effects; never nest ternaries.

For runtime keys, `Map` makes missing values explicit:

```ts
interface Book {
  id: string;
  title: string;
}

function indexBooks(books: Book[]): Map<string, Book> {
  return new Map(books.map((book) => [book.id, book]));
}
```

Build an index once when it serves repeated lookups; use `find` for a single search. A typed handler map is also valid when it makes dispatch clearer.

For key-specific calculations, explicit branches can be clearer:

```ts
function getTabDestination(key: string, index: number, tabCount: number): number | undefined {
  if (tabCount === 0 || index < 0 || index >= tabCount) return undefined;

  switch (key) {
    case 'ArrowRight':
      return (index + 1) % tabCount;
    case 'ArrowLeft':
      return (index + tabCount - 1) % tabCount;
    case 'Home':
      return 0;
    case 'End':
      return tabCount - 1;
    default:
      return undefined;
  }
}
```

The caller checks `destination === undefined` before preventing default behavior or moving focus. Index `0` is valid; unsupported keys retain browser defaults.

Guard missing data without losing valid zero values:

```ts
function formatRating(rating: number | undefined): string {
  if (rating === undefined) return 'Not rated';
  return `${rating} / 5`;
}
```

## Boundaries and review

- Reuse established schemas at external-data boundaries. Narrow uncertain values rather than asserting them away. Avoid speculative guards where invariants are established.
- Name booleans for their conditions; replace unexplained literals and ambiguous abbreviations. Comments should explain reasons, not repeat code.
- Make failures actionable. Fallbacks must be intentional product behavior, not success-shaped substitutes for errors.
- Review the full diff for coherent responsibilities, explicit effects, failure paths, duplication, and unnecessary abstractions. Keep unrelated cleanup out.
- Verify changed behavior and edge cases, including empty collections, zero values, unsupported keys, and focus. Do not mirror implementation details in tests.

Type checking and formatting supplement this review; they do not enforce every rule. Never weaken tests, types, or checks to pass. Report failures and checks that could not run.
