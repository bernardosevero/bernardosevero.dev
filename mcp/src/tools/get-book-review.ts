import { z } from 'zod';
import { bookSchema, slugSchema } from '../snapshot-schema';
import { ToolInputError, type SnapshotTool } from './define';

const inputSchema = z.object({
  id: slugSchema.describe('A book ID from get_reading_list that has a reviewUrl.'),
});

const outputSchema = bookSchema.required({ review: true });

export const getBookReview: SnapshotTool<typeof inputSchema, typeof outputSchema> = {
  name: 'get_book_review',
  title: 'Read a book review',
  description:
    "Returns Bernardo Severo's review of one book in full, as Markdown in its original language (some are in Portuguese), with his rating and the canonical URL. Call get_reading_list first to find a book with a reviewUrl.",
  inputSchema,
  outputSchema,
  run(snapshot, { id }) {
    const book = snapshot.books.find((candidate) => candidate.id === id);
    if (!book) {
      throw new ToolInputError(
        `No book has the ID "${id}". Call get_reading_list to see the book IDs.`,
      );
    }
    const { review } = book;
    if (!review) {
      throw new ToolInputError(
        `"${book.title}" has no published review. Books with a review have a reviewUrl in get_reading_list.`,
      );
    }
    return { ...book, review };
  },
};
