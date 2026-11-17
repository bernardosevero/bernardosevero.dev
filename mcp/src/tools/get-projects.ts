import { z } from 'zod';
import { projectSchema } from '../snapshot-schema';
import type { SnapshotTool } from './define';

const inputSchema = z.object({});
const outputSchema = z.object({ projects: z.array(projectSchema) });

export const getProjects: SnapshotTool<typeof inputSchema, typeof outputSchema> = {
  name: 'get_projects',
  title: "Bernardo Severo's projects",
  description:
    "Returns every project on Bernardo Severo's portfolio: title, summary, and links to the live app, course, or repository. Call this for questions about what he has built outside his jobs. Work history is in get_profile.",
  inputSchema,
  outputSchema,
  run: (snapshot) => ({ projects: snapshot.projects }),
};
