import { snapshotSchema, type Snapshot } from './snapshot-schema';

/** How long a stored snapshot is used without asking the site again. */
export const freshForMs = 5 * 60 * 1000;
/** How long a stored snapshot stays available as a fallback when the site is unreachable. */
export const keepForSeconds = 7 * 24 * 60 * 60;

export interface StoredSnapshot {
  body: string;
  fetchedAt: number;
}

export interface SnapshotStore {
  read(): Promise<StoredSnapshot | undefined>;
  write(stored: StoredSnapshot): Promise<void>;
}

export interface SnapshotSource {
  url: string;
  fetch: (url: string) => Promise<Response>;
  store: SnapshotStore;
  now: () => number;
}

/**
 * The production source: the runtime's `fetch` and clock. `fetch` is wrapped
 * because the Workers runtime rejects it when called as a method of another
 * object ("Illegal invocation"), which is how `loadSnapshot` calls it.
 */
export function runtimeSnapshotSource(url: string, store: SnapshotStore): SnapshotSource {
  return { url, fetch: (target) => fetch(target), store, now: () => Date.now() };
}

export class SnapshotUnavailableError extends Error {
  constructor(reason: string) {
    super(`The portfolio snapshot is unavailable: ${reason}`);
    this.name = 'SnapshotUnavailableError';
  }
}

function parseSnapshot(body: string): Snapshot {
  return snapshotSchema.parse(JSON.parse(body));
}

async function fetchSnapshotBody(source: SnapshotSource): Promise<string> {
  const response = await source.fetch(source.url);
  if (!response.ok) throw new Error(`the site answered HTTP ${response.status}`);
  return response.text();
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Returns the site's snapshot: the stored copy while it is fresh, otherwise a
 * new fetch. A failed or invalid fetch falls back to the stored copy, however
 * old; with no stored copy it throws rather than answering with partial data.
 */
export async function loadSnapshot(source: SnapshotSource): Promise<Snapshot> {
  const stored = await source.store.read();
  if (stored && source.now() - stored.fetchedAt < freshForMs) return parseSnapshot(stored.body);

  try {
    const body = await fetchSnapshotBody(source);
    const snapshot = parseSnapshot(body);
    await source.store.write({ body, fetchedAt: source.now() });
    return snapshot;
  } catch (error) {
    if (!stored) throw new SnapshotUnavailableError(describe(error));
    console.warn(`Serving a stored snapshot; refresh failed: ${describe(error)}`);
    return parseSnapshot(stored.body);
  }
}

const fetchedAtHeader = 'x-snapshot-fetched-at';

/** Stores the snapshot in the Worker's edge cache, keyed by the snapshot URL. */
export function edgeCacheStore(cache: Cache, snapshotUrl: string): SnapshotStore {
  const key = new Request(snapshotUrl);

  return {
    async read() {
      const response = await cache.match(key);
      if (!response) return undefined;
      const fetchedAt = Number(response.headers.get(fetchedAtHeader));
      if (!Number.isFinite(fetchedAt)) return undefined;
      return { body: await response.text(), fetchedAt };
    },
    async write({ body, fetchedAt }) {
      await cache.put(
        key,
        new Response(body, {
          headers: {
            'content-type': 'application/json',
            'cache-control': `public, max-age=${keepForSeconds}`,
            [fetchedAtHeader]: String(fetchedAt),
          },
        }),
      );
    },
  };
}
