import type { CallToolResult } from '@modelcontextprotocol/server';
import { SnapshotUnavailableError } from '../snapshot';

/**
 * Turns a failed snapshot load into a tool error the client can act on.
 * Anything else is a bug and is rethrown for the MCP layer to report.
 */
export function snapshotFailure(error: unknown): CallToolResult {
  if (!(error instanceof SnapshotUnavailableError)) throw error;
  console.error(error.message);
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: 'The portfolio data is temporarily unavailable. Retry in a minute, or read https://bernardosevero.dev directly.',
      },
    ],
  };
}
