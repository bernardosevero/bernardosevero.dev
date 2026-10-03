const CHARACTER_DELAY_MS = 28;
const SKIP_LABEL = 'Skip ▸▸';

interface DialogueLine {
  text: string;
  typed: HTMLElement;
}

// HomeDialogue.astro renders this markup. Failing before any enhancement leaves the
// complete server-rendered text and links in place instead of a half-typed dialogue.
function requireElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Home dialogue markup is missing ${selector}.`);
  return element;
}

function createLine(line: HTMLElement): DialogueLine {
  const full = requireElement(line, '.home-dialogue__full');
  const typed = document.createElement('span');
  typed.className = 'home-dialogue__typed';
  typed.setAttribute('aria-hidden', 'true');
  line.append(typed);
  return { text: full.textContent ?? '', typed };
}

function renderTypedText(lines: DialogueLine[], caret: HTMLElement, count: number): void {
  let remaining = count;
  for (const line of lines) {
    const shown = line.text.slice(0, Math.max(0, remaining));
    line.typed.textContent = shown;
    // The caret follows the line currently being typed.
    if (remaining >= 0 && remaining <= line.text.length) line.typed.append(caret);
    remaining -= line.text.length;
  }
}

function enhanceHomeDialogue(root: HTMLElement): void {
  const parchment = requireElement(root, '.home-dialogue__parchment');
  const choices = requireElement(root, '[data-dialogue-choices]');
  const lineElements = [...root.querySelectorAll<HTMLElement>('[data-dialogue-line]')];
  if (lineElements.length === 0) throw new Error('Home dialogue markup has no text lines.');

  const lines = lineElements.map(createLine);
  const totalCharacters = lines.reduce((sum, line) => sum + line.text.length, 0);
  const caret = document.createElement('span');
  caret.className = 'home-dialogue__caret';
  caret.setAttribute('aria-hidden', 'true');
  caret.textContent = '▼';
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'home-dialogue__skip';
  skip.textContent = SKIP_LABEL;

  let frame = 0;
  let start: number | undefined;

  const complete = () => {
    cancelAnimationFrame(frame);
    root.removeEventListener('keydown', complete);
    root.removeEventListener('click', complete);
    // Removing the focused Skip button would drop focus to the page; keep it in the dialogue.
    const skipHadFocus = document.activeElement === skip;
    for (const line of lines) line.typed.remove();
    skip.remove();
    delete root.dataset.typing;
    if (skipHadFocus) choices.querySelector<HTMLElement>('a')?.focus();
  };

  const tick = (now: number) => {
    start ??= now;
    const count = Math.floor((now - start) / CHARACTER_DELAY_MS);
    if (count >= totalCharacters) {
      complete();
      return;
    }
    renderTypedText(lines, caret, count);
    frame = requestAnimationFrame(tick);
  };

  root.dataset.typing = 'true';
  renderTypedText(lines, caret, 0);
  parchment.append(skip);
  // Listening on the dialogue, not the document, keeps key handling scoped to it.
  root.addEventListener('keydown', complete);
  root.addEventListener('click', complete);
  frame = requestAnimationFrame(tick);
}

export function enhanceHomeDialogues(): void {
  // Reduced motion keeps the complete server-rendered text and choices, with no Skip button.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (const root of document.querySelectorAll<HTMLElement>('[data-home-dialogue]')) {
    enhanceHomeDialogue(root);
  }
}
