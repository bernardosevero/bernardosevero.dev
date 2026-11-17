import { z } from 'zod';
import { bookSchema, bookStatusSchema } from '../snapshot-schema';
import type { SnapshotTool } from './define';

const inputSchema = z.object({
  status: bookStatusSchema.optional().describe('Only books on this shelf. Omit for every book.'),
});

const outputSchema = z.object({
  books: z.array(
    bookSchema.omit({ review: true }).extend({
      reviewUrl: z
        .url()
        .optional()
        .describe('Present when Bernardo published a review; read it with get_book_review.'),
    }),
  ),
});

export const getReadingList: SnapshotTool<typeof inputSchema, typeof outputSchema> = {
  name: 'get_reading_list',
  title: 'Reading list',
  description:
    "Lists the books on Bernardo Severo's shelves: what he is reading, has finished, or wants to read, with his rating where he gave one. Optionally filter by shelf. An empty list means that shelf has no books.",
  inputSchema,
  outputSchema,
  run(snapshot, { status }) {
    const books = snapshot.books
      .filter((book) => status === undefined || book.status === status)
      .map(({ review, ...book }) => ({
        ...book,
        ...(review && { reviewUrl: review.url }),
      }));
    return { books };
  },
};
