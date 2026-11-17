import type { CallToolResult, McpServer } from '@modelcontextprotocol/server';
import type { z } from 'zod';
import { SnapshotUnavailableError } from '../snapshot';
import type { Snapshot } from '../snapshot-schema';

/** A request the tool understood but cannot satisfy, such as an unknown slug. */
export class ToolInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolInputError';
  }
}

/** A read-only tool: a pure function from the snapshot and validated input to its output. */
export interface SnapshotTool<Input extends z.ZodObject, Output extends z.ZodObject> {
  name: string;
  title: string;
  /** Written for a model choosing between tools: what it returns and when to call it. */
  description: string;
  inputSchema: Input;
  outputSchema: Output;
  run(snapshot: Snapshot, input: z.infer<Input>): z.infer<Output>;
}

export interface ToolDependencies {
  loadSnapshot: () => Promise<Snapshot>;
}

function errorResult(text: string): CallToolResult {
  return { isError: true, content: [{ type: 'text', text }] };
}

/**
 * Turns expected failures into tool errors the client can act on. Anything
 * else is a bug and is rethrown for the MCP layer to report.
 */
function failure(error: unknown): CallToolResult {
  if (error instanceof ToolInputError) return errorResult(error.message);
  if (error instanceof SnapshotUnavailableError) {
    console.error(error.message);
    return errorResult(
      'The portfolio data is temporarily unavailable. Retry in a minute, or read https://bernardosevero.dev directly.',
    );
  }
  throw error;
}

/** Registers a tool with the annotations and schemas every tool must carry (docs/mcp.md). */
export function registerSnapshotTool<Input extends z.ZodObject, Output extends z.ZodObject>(
  server: McpServer,
  { loadSnapshot }: ToolDependencies,
  tool: SnapshotTool<Input, Output>,
): void {
  // The SDK's callback type cannot be resolved for a generic schema, so it
  // sees plain object schemas; the tool's own schemas recover the exact types.
  const inputSchema: z.ZodObject = tool.inputSchema;
  const outputSchema: z.ZodObject = tool.outputSchema;

  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async (rawInput) => {
      try {
        const input = tool.inputSchema.parse(rawInput);
        // Parsing the output strips any field its schema does not name.
        const output = outputSchema.parse(tool.run(await loadSnapshot(), input));
        return {
          content: [{ type: 'text', text: JSON.stringify(output) }],
          structuredContent: output,
        };
      } catch (error) {
        return failure(error);
      }
    },
  );
}
