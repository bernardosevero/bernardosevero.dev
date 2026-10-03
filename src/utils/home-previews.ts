// Pure selectors for the Home notice board. Callers pass entries already filtered
// with isVisibleContent, so drafts never reach these functions.

interface DatedPost {
  data: { publishedAt: Date };
}

interface ProjectOrder {
  data: { publishedAt?: Date | undefined; featured: boolean };
}

type BookStatus = 'reading' | 'finished' | 'wishlist';

interface DeskBook {
  id: string;
  data: { status: BookStatus; finishedAt?: Date | undefined };
}

export interface ReadingDesk<Book extends DeskBook> {
  current?: Book;
  finished: Array<{ book: Book; hasReview: boolean }>;
}

const RECENTLY_FINISHED_COUNT = 2;

/** The newest posts first, limited to `count`. */
export function latestPosts<Post extends DatedPost>(posts: Post[], count: number): Post[] {
  return [...posts]
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .slice(0, count);
}

function compareProjects(a: ProjectOrder, b: ProjectOrder): number {
  const aTime = a.data.publishedAt?.valueOf();
  const bTime = b.data.publishedAt?.valueOf();
  if (aTime !== bTime) {
    // Undated projects sort after dated ones.
    if (aTime === undefined) return 1;
    if (bTime === undefined) return -1;
    return bTime - aTime;
  }
  return Number(b.data.featured) - Number(a.data.featured);
}

/** The newest project by `publishedAt`; undated entries come last and ties favor `featured`. */
export function latestProject<Project extends ProjectOrder>(
  projects: Project[],
): Project | undefined {
  return [...projects].sort(compareProjects)[0];
}

/** The first book being read, and the most recently finished books with review availability. */
export function readingDesk<Book extends DeskBook>(
  books: Book[],
  reviewIds: ReadonlySet<string>,
): ReadingDesk<Book> {
  const current = books.find((book) => book.data.status === 'reading');
  const finished = books
    .filter((book) => book.data.status === 'finished' && book.data.finishedAt !== undefined)
    .sort((a, b) => (b.data.finishedAt?.valueOf() ?? 0) - (a.data.finishedAt?.valueOf() ?? 0))
    .slice(0, RECENTLY_FINISHED_COUNT)
    .map((book) => ({ book, hasReview: reviewIds.has(book.id) }));
  return current ? { current, finished } : { finished };
}
