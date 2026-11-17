import { z } from 'zod';
import { postSchema, slugSchema } from '../snapshot-schema';
import { ToolInputError, type SnapshotTool } from './define';

const inputSchema = z.object({
  slug: slugSchema.describe('A post slug from list_posts.'),
});

export const getPost: SnapshotTool<typeof inputSchema, typeof postSchema> = {
  name: 'get_post',
  title: 'Read a blog post',
  description:
    "Returns one of Bernardo Severo's blog posts in full, as Markdown, with its metadata and canonical URL. Call list_posts first to get the slug.",
  inputSchema,
  outputSchema: postSchema,
  run(snapshot, { slug }) {
    const post = snapshot.posts.find((candidate) => candidate.slug === slug);
    if (!post) {
      throw new ToolInputError(
        `No post has the slug "${slug}". Call list_posts to see the published slugs.`,
      );
    }
    return post;
  },
};
