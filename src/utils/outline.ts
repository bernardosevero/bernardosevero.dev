export interface OutlineSection {
  slug: string;
  text: string;
  words: number;
}

interface MarkdownHeading {
  depth: number;
  slug: string;
  text: string;
}

const FENCE = /^\s{0,3}(```|~~~)/;
const SECTION_HEADING = /^## /;

function countWords(lines: ReadonlyArray<string>): number {
  return lines.join(' ').match(/\S+/g)?.length ?? 0;
}

/**
 * Pairs each `##` section of a Markdown body with Astro's rendered h2 heading and
 * counts the words in its body. Content before the first h2 is not a section.
 */
export function outlineSections(
  markdown: string,
  headings: ReadonlyArray<MarkdownHeading>,
): OutlineSection[] {
  const sectionBodies: string[][] = [];
  let insideFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (FENCE.test(line)) insideFence = !insideFence;
    if (!insideFence && SECTION_HEADING.test(line)) {
      sectionBodies.push([]);
      continue;
    }
    sectionBodies.at(-1)?.push(line);
  }

  const sectionHeadings = headings.filter((heading) => heading.depth === 2);
  if (sectionHeadings.length !== sectionBodies.length) {
    throw new Error(
      `Outline mismatch: the Markdown has ${sectionBodies.length} "## " sections but Astro rendered ${sectionHeadings.length} h2 headings.`,
    );
  }

  return sectionHeadings.map((heading, index) => ({
    slug: heading.slug,
    text: heading.text,
    words: countWords(sectionBodies[index]),
  }));
}

export interface ReadingProgress {
  /** Word-weighted share of the post already read, rounded to a whole percent. */
  percent: number;
  minutesLeft: number;
  /** Index of the section being read, or undefined before the first section starts. */
  current: number | undefined;
}

/**
 * Summarizes per-section progress (each clamped to 0–1) into the chapter bar's labels.
 * Sections without words fall back to equal weights so an empty outline cannot divide by zero.
 */
export function summarizeReading(
  words: ReadonlyArray<number>,
  progress: ReadonlyArray<number>,
  readingMinutes: number,
): ReadingProgress {
  if (words.length !== progress.length) {
    throw new Error(
      `Expected ${words.length} section progress values, received ${progress.length}.`,
    );
  }
  const clamped = progress.map((value) => Math.min(Math.max(value, 0), 1));
  const totalWords = words.reduce((sum, count) => sum + count, 0);
  const weights = totalWords > 0 ? words : words.map(() => 1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const overall =
    totalWeight > 0
      ? clamped.reduce((sum, value, index) => sum + value * weights[index], 0) / totalWeight
      : 0;
  const lastStarted = clamped.findLastIndex((value) => value > 0);

  return {
    percent: Math.round(overall * 100),
    minutesLeft: Math.ceil(readingMinutes * (1 - overall)),
    current: lastStarted === -1 ? undefined : lastStarted,
  };
}

export interface ChapterLabels {
  of: string;
  minLeft: string;
  finished: string;
}

/** Formats the strip's position (`· 2 of 6`) and remaining (`30% · 4 min left`) labels. */
export function chapterStatusText(
  reading: ReadingProgress,
  sectionCount: number,
  labels: ChapterLabels,
): { position: string; remaining: string } {
  const position = reading.current === undefined ? 0 : reading.current + 1;
  const remaining =
    reading.percent >= 100
      ? `100% · ${labels.finished}`
      : `${reading.percent}% · ${reading.minutesLeft} ${labels.minLeft}`;
  return { position: `· ${position} ${labels.of} ${sectionCount}`, remaining };
}
