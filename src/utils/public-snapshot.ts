// The public data contract served at /api/v1/ and read by the MCP Worker.
// Every emitted field is named here on purpose: never spread a content entry,
// so a new schema field stays private until someone adds it (docs/mcp.md).

export const snapshotSchemaVersion = 1;

/** The subset of the About entry this serializer reads. */
export interface AboutSource {
  name: string;
  title: string;
  location: string;
  headline: string;
  summary: string;
  description: string;
  focus: string[];
  strengths: { label: string }[];
  specializations: string[];
  tools: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    employment?: string;
    description: string;
    highlights: string[];
    tech: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location: string;
    period: string;
    coursework?: string;
  }[];
  skills: { group: string; items: string[] }[];
  links: { label: string; url: string }[];
}

export interface PublicProfile {
  url: string;
  name: string;
  title: string;
  location: string;
  headline: string;
  summary: string;
  description: string;
  focus: string[];
  strengths: string[];
  specializations: string[];
  tools: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    employment?: string;
    description: string;
    highlights: string[];
    technologies: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location: string;
    period: string;
    coursework?: string;
  }[];
  skills: { group: string; items: string[] }[];
  links: { label: string; url: string }[];
}

export interface PublicSnapshot {
  schemaVersion: typeof snapshotSchemaVersion;
  generatedAt: string;
  site: string;
  profile: PublicProfile;
}

export interface PublicIndex {
  schemaVersion: typeof snapshotSchemaVersion;
  generatedAt: string;
  site: string;
  content: string;
  pages: { about: string };
}

/** Absolute URL for a site-relative path, honoring the configured base path. */
export function publicUrl(path: string, site: URL, basePath: string): string {
  return new URL(`${basePath}${path}`, site).href;
}

export interface ProfileUrls {
  site: string;
  about: string;
  /** Absent when no CV document is published. */
  cv?: string;
}

export function toPublicProfile(about: AboutSource, urls: ProfileUrls): PublicProfile {
  const links = [
    ...about.links.map((link) => ({ label: link.label, url: link.url })),
    { label: 'Website', url: urls.site },
  ];
  if (urls.cv !== undefined) links.push({ label: 'CV (PDF)', url: urls.cv });

  return {
    url: urls.about,
    name: about.name,
    title: about.title,
    location: about.location,
    headline: about.headline,
    summary: about.summary,
    description: about.description,
    focus: [...about.focus],
    // Levels are a visual device on the CV page, not a factual claim.
    strengths: about.strengths.map((strength) => strength.label),
    specializations: [...about.specializations],
    tools: [...about.tools],
    experience: about.experience.map((job) => ({
      company: job.company,
      role: job.role,
      period: job.period,
      location: job.location,
      ...(job.employment !== undefined && { employment: job.employment }),
      description: job.description,
      highlights: [...job.highlights],
      technologies: [...job.tech],
    })),
    education: about.education.map((entry) => ({
      degree: entry.degree,
      school: entry.school,
      location: entry.location,
      period: entry.period,
      ...(entry.coursework !== undefined && { coursework: entry.coursework }),
    })),
    skills: about.skills.map((skill) => ({ group: skill.group, items: [...skill.items] })),
    links,
  };
}
