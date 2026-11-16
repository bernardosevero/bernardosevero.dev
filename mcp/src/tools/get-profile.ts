import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { ServerDependencies } from '../server';
import { profileSchema } from '../snapshot-schema';
import { snapshotFailure } from './failures';

export function registerGetProfile(server: McpServer, { loadSnapshot }: ServerDependencies): void {
  server.registerTool(
    'get_profile',
    {
      title: "Bernardo Severo's profile",
      description:
        "Returns Bernardo Severo's professional profile: headline, summary, location, focus areas, work experience with highlights and technologies, education, skills, and public contact links. Call this first for questions about who he is, where he has worked, or how to reach him.",
      inputSchema: z.object({}),
      outputSchema: profileSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const { profile } = await loadSnapshot();
        return {
          content: [{ type: 'text', text: JSON.stringify(profile) }],
          structuredContent: profile,
        };
      } catch (error) {
        return snapshotFailure(error);
      }
    },
  );
}
