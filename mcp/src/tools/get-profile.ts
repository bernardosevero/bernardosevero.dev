import { z } from 'zod';
import { profileSchema } from '../snapshot-schema';
import type { SnapshotTool } from './define';

const inputSchema = z.object({});

export const getProfile: SnapshotTool<typeof inputSchema, typeof profileSchema> = {
  name: 'get_profile',
  title: "Bernardo Severo's profile",
  description:
    "Returns Bernardo Severo's professional profile: headline, summary, location, focus areas, work experience with highlights and technologies, education, skills, and public contact links. Call this first for questions about who he is, where he has worked, or how to reach him.",
  inputSchema,
  outputSchema: profileSchema,
  run: (snapshot) => snapshot.profile,
};
