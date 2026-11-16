import { z } from 'zod';

// The Worker's view of the site's /api/v1/content.json. Objects strip unknown
// keys, so the site may add fields (the v1 contract is additive) while the
// Worker only ever returns the fields named here.

export const profileSchema = z.object({
  url: z.url().describe('Canonical page for this profile on bernardosevero.dev.'),
  name: z.string(),
  title: z.string(),
  location: z.string(),
  headline: z.string(),
  summary: z.string().describe('Markdown; **bold** marks emphasis.'),
  description: z.string(),
  focus: z.array(z.string()),
  strengths: z.array(z.string()),
  specializations: z.array(z.string()),
  tools: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      location: z.string(),
      employment: z.string().optional(),
      description: z.string(),
      highlights: z.array(z.string()).describe('Markdown; **bold** marks emphasis.'),
      technologies: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      location: z.string(),
      period: z.string(),
      coursework: z.string().optional(),
    }),
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
  links: z
    .array(z.object({ label: z.string(), url: z.url() }))
    .describe('Public contact and profile links.'),
});

export const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.iso.datetime(),
  site: z.url(),
  profile: profileSchema,
});

export type Profile = z.infer<typeof profileSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
