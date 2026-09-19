class ReadingCodex extends HTMLElement {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    const shelves = [...this.querySelectorAll<HTMLElement>('[data-shelf]')];
    const tabs = [...this.querySelectorAll<HTMLAnchorElement>('[data-shelf-link]')];
    const tiles = [...this.querySelectorAll<HTMLAnchorElement>('[data-book]')];
    const details = [...this.querySelectorAll<HTMLElement>('[data-detail]')];
    const empty = this.querySelector<HTMLElement>('[data-empty-detail]')!;
    const announcement = this.querySelector<HTMLElement>('[data-announcement]')!;
    const remembered = new Map<string, string>();

    const selectBook = (bookId?: string, focus = false) => {
      const selected = details.find((detail) => detail.dataset.detail === bookId);
      for (const detail of details) detail.hidden = detail !== selected;
      for (const tile of tiles) {
        if (tile.dataset.book === bookId) tile.setAttribute('aria-current', 'true');
        else tile.removeAttribute('aria-current');
      }
      empty.hidden = Boolean(selected);
      if (selected) {
        remembered.set(selected.dataset.status!, bookId!);
        if (focus) {
          window.posthog?.capture('reading_book_selected', {
            book_status: selected.dataset.status,
          });
          selected.focus({ preventScroll: true });
        }
        if (focus && this.clientWidth <= 650) selected.scrollIntoView({ block: 'nearest' });
      }
    };
    const selectShelf = (shelf: string, announce = true) => {
      for (const section of shelves) section.hidden = section.dataset.shelf !== shelf;
      for (const tab of tabs) {
        const active = tab.dataset.shelfLink === shelf;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      }
      const available = details.filter((detail) => detail.dataset.status === shelf);
      selectBook(remembered.get(shelf) ?? available[0]?.dataset.detail);
      if (announce) {
        announcement.textContent = `${shelf}: ${available.length} books`;
        window.posthog?.capture('reading_shelf_selected', {
          shelf,
          available_book_count: available.length,
        });
      }
    };

    this.querySelector('.codex-tabs')!.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.id = `${this.id}-tab-${tab.dataset.shelfLink}`;
      tab.setAttribute('aria-controls', `${this.id}-${tab.dataset.shelfLink}`);
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        selectShelf(tab.dataset.shelfLink!);
      });
      tab.addEventListener('keydown', (event) => {
        if (event.key === ' ') { event.preventDefault(); selectShelf(tab.dataset.shelfLink!); return; }
        const destination = event.key === 'ArrowRight' ? (index + 1) % tabs.length
          : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : undefined;
        if (destination === undefined) return;
        event.preventDefault();
        tabs[destination].focus();
        selectShelf(tabs[destination].dataset.shelfLink!);
      });
    });
    shelves.forEach((shelf) => {
      shelf.setAttribute('role', 'tabpanel');
      shelf.setAttribute('aria-labelledby', `${this.id}-tab-${shelf.dataset.shelf}`);
    });
    tiles.forEach((tile) => tile.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectBook(tile.dataset.book, true);
    }));
    // Native fragments keep every shelf and book readable without JavaScript.
    const fragment = details.find((detail) => `#${detail.id}` === location.hash);
    const initialShelf = fragment?.dataset.status
      ?? shelves.find((shelf) => `#${shelf.id}` === location.hash)?.dataset.shelf
      ?? details[0]?.dataset.status ?? 'reading';
    this.dataset.enhanced = 'true';
    selectShelf(initialShelf, false);
    if (fragment) selectBook(fragment.dataset.detail);
  }
}
if (!customElements.get('reading-codex')) customElements.define('reading-codex', ReadingCodex);
