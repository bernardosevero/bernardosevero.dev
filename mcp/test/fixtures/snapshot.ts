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
  projects: [
    {
      slug: 'sample-project',
      url: 'https://example.dev/projects/',
      title: 'Sample Project',
      summary: 'A sample project.',
      links: [{ label: 'Repository', url: 'https://github.com/example/sample' }],
    },
  ],
  posts: [
    {
      slug: 'newer-post',
      url: 'https://example.dev/posts/newer-post/',
      title: 'Newer Post',
      description: 'The newer sample post.',
      publishedAt: '2026-02-01',
      topics: ['Testing', 'Go'],
      readingMinutes: 4,
      body: '# Newer\n\nBody of the newer post.',
    },
    {
      slug: 'older-post',
      url: 'https://example.dev/posts/older-post/',
      title: 'Older Post',
      description: 'The older sample post.',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-15',
      topics: ['Testing'],
      readingMinutes: 2,
      body: 'Body of the older post.',
    },
  ],
  books: [
    {
      id: 'reviewed-book',
      title: 'Reviewed Book',
      author: 'An Author',
      status: 'finished',
      rating: 0,
      review: {
        url: 'https://example.dev/reading/reviewed-book/',
        language: 'pt-BR',
        finishedAt: '2026-01-10',
        body: 'Uma resenha de exemplo.',
      },
    },
    { id: 'current-book', title: 'Current Book', author: 'Another Author', status: 'reading' },
    { id: 'wished-book', title: 'Wished Book', author: 'Third Author', status: 'wishlist' },
  ],
};

export const snapshotBody = JSON.stringify(snapshotFixture);
