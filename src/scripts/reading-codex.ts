import { formatCount } from '../utils/format';

// Keep in sync with the stacked-panel container query in reading-codex.css.
const STACKED_LAYOUT_MAX_WIDTH = 650;
const DEFAULT_SHELF = 'finished';

function getTabDestination(key: string, index: number, tabCount: number): number | undefined {
  if (tabCount === 0 || index < 0 || index >= tabCount) return undefined;

  switch (key) {
    case 'ArrowRight':
      return (index + 1) % tabCount;
    case 'ArrowLeft':
      return (index + tabCount - 1) % tabCount;
    case 'Home':
      return 0;
    case 'End':
      return tabCount - 1;
    default:
      return undefined;
  }
}

// ReadingCodex.astro renders this markup. Failing before any enhancement leaves the
// no-JavaScript fragment links usable instead of a half-enhanced widget.
function requireElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Reading Codex markup is missing ${selector}.`);
  return element;
}

function requireAttribute(element: Element, name: string): string {
  const value = element.getAttribute(name);
  if (value === null) throw new Error(`Reading Codex <${element.localName}> is missing ${name}.`);
  return value;
}

class ReadingCodex extends HTMLElement {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    const tabList = requireElement(this, '.codex-tabs');
    const emptyDetail = requireElement(this, '[data-empty-detail]');
    const announcement = requireElement(this, '[data-announcement]');
    const shelves = [...this.querySelectorAll<HTMLElement>('[data-shelf]')].map((element) => ({
      element,
      shelf: requireAttribute(element, 'data-shelf'),
    }));
    const tabs = [...this.querySelectorAll<HTMLElement>('[data-shelf-link]')].map((element) => ({
      element,
      shelf: requireAttribute(element, 'data-shelf-link'),
    }));
    const tiles = [...this.querySelectorAll<HTMLElement>('[data-book]')].map((element) => ({
      element,
      bookId: requireAttribute(element, 'data-book'),
    }));
    const details = [...this.querySelectorAll<HTMLElement>('[data-detail]')].map((element) => ({
      element,
      bookId: requireAttribute(element, 'data-detail'),
      shelf: requireAttribute(element, 'data-status'),
    }));
    const rememberedBooks = new Map<string, string>();

    const selectBook = (bookId: string | undefined, userInitiated = false) => {
      const selected = details.find((detail) => detail.bookId === bookId);
      for (const detail of details) detail.element.hidden = detail !== selected;
      for (const tile of tiles) {
        if (tile.bookId === bookId) tile.element.setAttribute('aria-current', 'true');
        else tile.element.removeAttribute('aria-current');
      }
      emptyDetail.hidden = selected !== undefined;
      if (!selected) return;
      rememberedBooks.set(selected.shelf, selected.bookId);
      if (!userInitiated) return;
      window.posthog?.capture('reading_book_selected', { book_status: selected.shelf });
      selected.element.focus({ preventScroll: true });
      if (this.clientWidth <= STACKED_LAYOUT_MAX_WIDTH) {
        selected.element.scrollIntoView({ block: 'nearest' });
      }
    };
    const selectShelf = (shelf: string, announce = true) => {
      for (const section of shelves) section.element.hidden = section.shelf !== shelf;
      for (const tab of tabs) {
        const active = tab.shelf === shelf;
        tab.element.setAttribute('aria-selected', String(active));
        tab.element.tabIndex = active ? 0 : -1;
      }
      const available = details.filter((detail) => detail.shelf === shelf);
      selectBook(rememberedBooks.get(shelf) ?? available[0]?.bookId);
      if (!announce) return;
      announcement.textContent = `${shelf}: ${formatCount(available.length, 'book')}`;
      window.posthog?.capture('reading_shelf_selected', {
        shelf,
        available_book_count: available.length,
      });
    };

    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.element.setAttribute('role', 'tab');
      tab.element.id = `${this.id}-tab-${tab.shelf}`;
      tab.element.setAttribute('aria-controls', `${this.id}-${tab.shelf}`);
      tab.element.addEventListener('click', (event) => {
        event.preventDefault();
        selectShelf(tab.shelf);
      });
      tab.element.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
          event.preventDefault();
          selectShelf(tab.shelf);
          return;
        }
        const destination = getTabDestination(event.key, index, tabs.length);
        if (destination === undefined) return;
        event.preventDefault();
        tabs[destination].element.focus();
        selectShelf(tabs[destination].shelf);
      });
    });
    for (const section of shelves) {
      section.element.setAttribute('role', 'tabpanel');
      section.element.setAttribute('aria-labelledby', `${this.id}-tab-${section.shelf}`);
    }
    for (const tile of tiles) {
      tile.element.addEventListener('click', (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        selectBook(tile.bookId, true);
      });
    }
    // Native fragments keep every shelf and book readable without JavaScript.
    const fragmentDetail = details.find((detail) => `#${detail.element.id}` === location.hash);
    const fragmentShelf = shelves.find((section) => `#${section.element.id}` === location.hash);
    this.dataset.enhanced = 'true';
    selectShelf(fragmentDetail?.shelf ?? fragmentShelf?.shelf ?? DEFAULT_SHELF, false);
    if (fragmentDetail) selectBook(fragmentDetail.bookId);
  }
}
if (!customElements.get('reading-codex')) customElements.define('reading-codex', ReadingCodex);
