import type { Snapshot } from '../../src/snapshot-schema';

// Invented sample data: tests must not depend on the real portfolio content.
export const snapshotFixture: Snapshot = {
  schemaVersion: 1,
  generatedAt: '2026-01-02T03:04:05.000Z',
  site: 'https://example.dev/',
  profile: {
    url: 'https://example.dev/about/',
    name: 'Sample Person',
    title: 'Engineer',
    location: 'Somewhere (Remote)',
    headline: 'Engineer · 5 years',
    summary: 'Builds **useful** things.',
    description: 'A sample profile.',
    focus: ['Web'],
    strengths: ['Backend'],
    specializations: ['Go'],
    tools: ['Docker'],
    experience: [
      {
        company: 'Example Co',
        role: 'Engineer',
        period: 'January 2020 — Present',
        location: 'Remote',
        description: 'A sample company.',
        highlights: ['Shipped a sample thing.'],
        technologies: ['Go'],
      },
    ],
    education: [
      { degree: 'B.Sc.', school: 'Sample University', location: 'Town', period: '2015 — 2019' },
    ],
    skills: [{ group: 'Languages', items: ['Go'] }],
    links: [{ label: 'Website', url: 'https://example.dev/' }],
  },
};

export const snapshotBody = JSON.stringify(snapshotFixture);
