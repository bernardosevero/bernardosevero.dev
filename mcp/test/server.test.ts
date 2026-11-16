import { describe, expect, it } from 'vitest';
import { createServer } from '../src/server';
import { SnapshotUnavailableError } from '../src/snapshot';
import { snapshotFixture } from './fixtures/snapshot';
import { callMcp } from './mcp-client';

const healthy = () => createServer({ loadSnapshot: () => Promise.resolve(snapshotFixture) });
const siteDown = () =>
  createServer({
    loadSnapshot: () => Promise.reject(new SnapshotUnavailableError('the site answered HTTP 503')),
  });

interface ListedTool {
  name: string;
  annotations?: { readOnlyHint?: boolean };
  outputSchema?: unknown;
  inputSchema?: { properties?: Record<string, unknown> };
}

async function listTools(): Promise<ListedTool[]> {
  const { result } = await callMcp(healthy, 'tools/list');
  return (result as { tools: ListedTool[] }).tools;
}

describe('tool surface', () => {
  it('exposes exactly the agreed tools', async () => {
    expect((await listTools()).map((tool) => tool.name)).toEqual(['get_profile']);
  });

  it('marks every tool read-only and gives it an output schema', async () => {
    const tools = await listTools();
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
      expect(tool.outputSchema, tool.name).toBeTypeOf('object');
    }
  });
});

describe('get_profile', () => {
  it('returns the profile as structured content with its canonical URL', async () => {
    const { result } = await callMcp(healthy, 'tools/call', { name: 'get_profile', arguments: {} });
    const { structuredContent, content, isError } = result as {
      structuredContent: unknown;
      content: { type: string; text: string }[];
      isError?: boolean;
    };

    expect(isError).not.toBe(true);
    expect(structuredContent).toEqual(snapshotFixture.profile);
    expect(JSON.parse(content[0]?.text ?? '')).toEqual(snapshotFixture.profile);
    expect(snapshotFixture.profile.url).toBe('https://example.dev/about/');
  });

  it('answers with an actionable error when the snapshot is unavailable', async () => {
    const { result } = await callMcp(siteDown, 'tools/call', {
      name: 'get_profile',
      arguments: {},
    });
    const { isError, content, structuredContent } = result as {
      isError?: boolean;
      content: { text: string }[];
      structuredContent?: unknown;
    };

    expect(isError).toBe(true);
    expect(structuredContent).toBeUndefined();
    expect(content[0]?.text).toContain('Retry in a minute');
    expect(content[0]?.text).toContain('https://bernardosevero.dev');
  });
});

describe('unknown tools', () => {
  it('are rejected rather than answered', async () => {
    const message = await callMcp(healthy, 'tools/call', { name: 'delete_profile', arguments: {} });
    const failed =
      message.error !== undefined || (message.result as { isError?: boolean }).isError === true;
    expect(failed).toBe(true);
  });
});
