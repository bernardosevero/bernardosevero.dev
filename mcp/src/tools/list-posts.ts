import { z } from 'zod';
import { postSchema } from '../snapshot-schema';
import { ToolInputError, type SnapshotTool } from './define';

const inputSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .optional()
    .describe('Only posts with this topic, matched case-insensitively. Omit for every post.'),
});

const outputSchema = z.object({
  topics: z.array(z.string()).describe('Every topic used by a published post.'),
  posts: z.array(postSchema.omit({ body: true })).describe('Newest first.'),
});

export const listPosts: SnapshotTool<typeof inputSchema, typeof outputSchema> = {
  name: 'list_posts',
  title: 'Blog posts',
  description:
    "Lists Bernardo Severo's published blog posts, newest first, with slug, title, description, date, topics, and reading time, but not the text. Call this to find a post, then get_post with its slug to read it.",
  inputSchema,
  outputSchema,
  run(snapshot, { topic }) {
    const topics = [...new Set(snapshot.posts.flatMap((post) => post.topics))].sort();
    const summaries = snapshot.posts.map(({ body: _body, ...summary }) => summary);
    if (topic === undefined) return { topics, posts: summaries };

    const wanted = topic.toLowerCase();
    const posts = summaries.filter((post) =>
      post.topics.some((candidate) => candidate.toLowerCase() === wanted),
    );
    if (posts.length === 0) {
      throw new ToolInputError(
        `No posts have the topic "${topic}". Available topics: ${topics.join(', ') || 'none'}.`,
      );
    }
    return { topics, posts };
  },
};
