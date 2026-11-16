import { describe, expect, it } from 'vitest';
import {
  SnapshotUnavailableError,
  freshForMs,
  loadSnapshot,
  type SnapshotSource,
  type SnapshotStore,
  type StoredSnapshot,
} from '../src/snapshot';
import { snapshotSchema } from '../src/snapshot-schema';
import { snapshotBody, snapshotFixture } from './fixtures/snapshot';

const startedAt = 1_000_000;

function memoryStore(initial?: StoredSnapshot): SnapshotStore & { stored?: StoredSnapshot } {
  return {
    stored: initial,
    async read() {
      return this.stored;
    },
    async write(stored) {
      this.stored = stored;
    },
  };
}

function sourceWith(
  respond: () => Promise<Response>,
  store: SnapshotStore,
  now = startedAt,
): SnapshotSource & { requests: string[] } {
  const requests: string[] = [];
  return {
    url: 'https://example.dev/api/v1/content.json',
    requests,
    fetch(url) {
      requests.push(url);
      return respond();
    },
    store,
    now: () => now,
  };
}

const ok = () => Promise.resolve(new Response(snapshotBody));
const older = { ...snapshotFixture, generatedAt: '2025-01-01T00:00:00.000Z' };

describe('snapshot schema', () => {
  it('accepts the contract and strips fields it does not name', () => {
    const parsed = snapshotSchema.parse({ ...snapshotFixture, notionId: 'private' });
    expect(parsed).toEqual(snapshotFixture);
  });

  it('rejects a snapshot from another schema version', () => {
    expect(snapshotSchema.safeParse({ ...snapshotFixture, schemaVersion: 2 }).success).toBe(false);
  });
});

describe('loadSnapshot', () => {
  it('fetches, validates, and stores when nothing is stored', async () => {
    const store = memoryStore();
    const source = sourceWith(ok, store);

    expect(await loadSnapshot(source)).toEqual(snapshotFixture);
    expect(source.requests).toEqual([source.url]);
    expect(store.stored).toEqual({ body: snapshotBody, fetchedAt: startedAt });
  });

  it('uses a fresh stored copy without asking the site', async () => {
    const store = memoryStore({ body: JSON.stringify(older), fetchedAt: startedAt });
    const source = sourceWith(ok, store, startedAt + freshForMs - 1);

    expect((await loadSnapshot(source)).generatedAt).toBe(older.generatedAt);
    expect(source.requests).toEqual([]);
  });

  it('refetches once the stored copy is no longer fresh', async () => {
    const store = memoryStore({ body: JSON.stringify(older), fetchedAt: startedAt });
    const source = sourceWith(ok, store, startedAt + freshForMs);

    expect((await loadSnapshot(source)).generatedAt).toBe(snapshotFixture.generatedAt);
    expect(store.stored?.fetchedAt).toBe(startedAt + freshForMs);
  });

  it.each([
    ['a network failure', () => Promise.reject(new Error('connection reset'))],
    ['an HTTP error', () => Promise.resolve(new Response('nope', { status: 503 }))],
    ['an invalid body', () => Promise.resolve(new Response('{"schemaVersion":1}'))],
    ['a body that is not JSON', () => Promise.resolve(new Response('<html>'))],
  ])('falls back to the stored copy after %s', async (_label, respond) => {
    const stale = { body: JSON.stringify(older), fetchedAt: startedAt };
    const store = memoryStore(stale);
    const source = sourceWith(respond, store, startedAt + freshForMs * 10);

    expect((await loadSnapshot(source)).generatedAt).toBe(older.generatedAt);
    expect(store.stored).toEqual(stale);
  });

  it('throws instead of answering when the site fails and nothing is stored', async () => {
    const source = sourceWith(
      () => Promise.resolve(new Response('nope', { status: 503 })),
      memoryStore(),
    );

    await expect(loadSnapshot(source)).rejects.toThrow(SnapshotUnavailableError);
    await expect(loadSnapshot(source)).rejects.toThrow('HTTP 503');
  });
});
