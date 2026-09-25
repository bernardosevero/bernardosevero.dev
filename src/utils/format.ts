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
