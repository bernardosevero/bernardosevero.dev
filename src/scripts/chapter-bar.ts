import { chapterStatusText, summarizeReading, type ChapterLabels } from '../utils/outline';

// Share of the viewport height above the reading line, measured from the top.
const READING_LINE = 0.3;
// Matches the strip's sticky `top` in ChapterBar.astro.
const STICKY_TOP = 12;

// ChapterBar.astro renders this markup. Failing before any enhancement leaves the
// native Contents disclosure usable instead of a half-enhanced strip.
function requireElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Chapter bar markup is missing ${selector}.`);
  return element;
}

function requireAttribute(element: Element, name: string): string {
  const value = element.getAttribute(name);
  if (value === null) throw new Error(`Chapter bar <${element.localName}> is missing ${name}.`);
  return value;
}

function requireNumber(element: Element, name: string): number {
  const value = Number(requireAttribute(element, name));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Chapter bar ${name} must be a non-negative number.`);
  }
  return value;
}

/**
 * Distance from the viewport top to the reading line. It sits at READING_LINE until the last
 * viewport-height of scrolling, then slides to the bottom so the final sections can finish.
 */
function readingLine(pageTop: number): number {
  const viewport = window.innerHeight;
  const scrollLeft = Math.max(document.documentElement.scrollHeight - viewport - pageTop, 0);
  return viewport * Math.max(READING_LINE, 1 - scrollLeft / viewport);
}

function enhance(bar: HTMLDetailsElement) {
  const prose = bar.nextElementSibling;
  if (!(prose instanceof HTMLElement) || !prose.classList.contains('prose')) {
    throw new Error('Chapter bar must be followed by its .prose article body.');
  }
  const summary = requireElement(bar, 'summary');
  const status = requireElement(bar, '[data-chapter-status]');
  const title = requireElement(bar, '[data-chapter-title]');
  const position = requireElement(bar, '[data-chapter-position]');
  const remaining = requireElement(bar, '[data-chapter-remaining]');
  const segmentList = requireElement(bar, '[data-chapter-segments]');
  const segments = [...bar.querySelectorAll<HTMLElement>('[data-chapter-segment]')];
  const readingMinutes = requireNumber(bar, 'data-reading-minutes');
  const labels: ChapterLabels = {
    of: requireAttribute(bar, 'data-label-of'),
    minLeft: requireAttribute(bar, 'data-label-min-left'),
    finished: requireAttribute(bar, 'data-label-finished'),
  };
  const sections = [...bar.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')].map(
    (link) => {
      const id = decodeURIComponent(requireAttribute(link, 'href').replace(/^#/, ''));
      const heading = document.getElementById(id);
      if (!heading || !prose.contains(heading)) {
        throw new Error(`Chapter bar link #${id} has no heading in the article.`);
      }
      const row = link.closest('li');
      if (!row) throw new Error(`Chapter bar link #${id} is not inside a Contents row.`);
      return { link, heading, row, words: requireNumber(link, 'data-words') };
    },
  );
  if (sections.length === 0 || segments.length !== sections.length) {
    throw new Error(
      `Chapter bar has ${sections.length} Contents links and ${segments.length} segments.`,
    );
  }
  const words = sections.map((section) => section.words);

  // Headings reached from Contents must land below the sticky strip, whose height wraps with width.
  const updateHeadingOffset = () => {
    const stripBottom = STICKY_TOP + summary.getBoundingClientRect().height;
    prose.style.setProperty('--chapter-bar-offset', `${Math.ceil(stripBottom)}px`);
  };

  const update = () => {
    const pageTop = window.scrollY;
    const anchor = pageTop + readingLine(pageTop);
    const starts = sections.map((section) => section.heading.getBoundingClientRect().top + pageTop);
    const proseEnd = prose.getBoundingClientRect().bottom + pageTop;
    const progress = starts.map((start, index) => {
      const end = starts[index + 1] ?? proseEnd;
      return end > start ? Math.min(Math.max((anchor - start) / (end - start), 0), 1) : 1;
    });
    const reading = summarizeReading(words, progress, readingMinutes);
    const text = chapterStatusText(reading, sections.length, labels);

    title.textContent = sections[reading.current ?? 0].link.textContent;
    position.textContent = text.position;
    remaining.textContent = text.remaining;
    sections.forEach((section, index) => {
      const isCurrent = index === reading.current;
      segments[index].style.setProperty('--progress', String(progress[index]));
      section.row.style.setProperty('--progress', String(progress[index]));
      segments[index].toggleAttribute('data-current', isCurrent);
      if (isCurrent) section.link.setAttribute('aria-current', 'location');
      else section.link.removeAttribute('aria-current');
    });
  };

  let frame: number | undefined;
  const scheduleUpdate = () => {
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      update();
      updateHeadingOffset();
    });
  };

  for (const section of sections) {
    // Native fragment navigation still jumps to the heading; the open panel should not cover it.
    section.link.addEventListener('click', () => {
      bar.open = false;
    });
  }
  bar.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !bar.open) return;
    event.preventDefault();
    bar.open = false;
    summary.focus();
  });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  status.hidden = false;
  segmentList.hidden = false;
  update();
  updateHeadingOffset();
}

for (const bar of document.querySelectorAll<HTMLDetailsElement>(
  'details[data-chapter-bar]:not([data-preview])',
)) {
  enhance(bar);
}
