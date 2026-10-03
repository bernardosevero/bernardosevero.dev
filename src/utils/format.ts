const calendarDateOptions = {
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  short: { month: 'short', day: 'numeric', year: 'numeric' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type CalendarDateStyle = keyof typeof calendarDateOptions;

export function formatCalendarDate(date: Date, style: CalendarDateStyle): string {
  // Content dates are ISO calendar dates parsed as UTC midnight. Formatting them in the
  // build machine's time zone would show the previous day anywhere west of UTC.
  return date.toLocaleDateString('en-US', { ...calendarDateOptions[style], timeZone: 'UTC' });
}

export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const maxMonogramLetters = 3;

export function companyMonogram(company: string): string {
  return company
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, maxMonogramLetters)
    .map((word) => Array.from(word)[0]?.toUpperCase() ?? '')
    .join('');
}

export interface TextRun {
  text: string;
  strong: boolean;
}

const emphasisMarker = '**';

// Content highlights mark metrics with paired `**…**`. Splitting into runs lets layouts
// render <strong> without set:html. An unpaired marker stays literal text.
export function emphasisRuns(text: string): TextRun[] {
  const segments = text.split(emphasisMarker);
  const hasUnpairedMarker = segments.length % 2 === 0;
  const pairedSegments = hasUnpairedMarker ? segments.slice(0, -2) : segments;
  const runs = pairedSegments.map((segment, index) => ({
    text: segment,
    strong: index % 2 === 1,
  }));

  if (hasUnpairedMarker) {
    // The last marker has no partner, so it rejoins the text on both sides of it.
    runs.push({ text: segments.slice(-2).join(emphasisMarker), strong: false });
  }

  return mergePlainRuns(runs.filter((run) => run.text.length > 0));
}

function mergePlainRuns(runs: TextRun[]): TextRun[] {
  return runs.reduce<TextRun[]>((merged, run) => {
    const previous = merged.at(-1);
    if (previous && !previous.strong && !run.strong) {
      previous.text += run.text;
    } else {
      merged.push({ ...run });
    }
    return merged;
  }, []);
}
