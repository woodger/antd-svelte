import { getPopupActiveElement } from './popup.dom';

export function connectPopoverTrigger(
  element: Element,
  id: string,
  expanded: boolean,
  kind: 'dialog' | 'menu' = 'dialog'
): () => void {
  const values = { 'aria-haspopup': kind, 'aria-expanded': String(expanded) };
  const previous = new Map<string, string | null>();
  const requested = id.split(/\s+/).filter(Boolean);
  const owned = new Set<string>();

  for (const attribute of Object.keys(values))
    previous.set(attribute, element.getAttribute(attribute));

  function update() {
    for (const [attribute, value] of Object.entries(values)) {
      const current = element.getAttribute(attribute);

      if (current !== value) {
        previous.set(attribute, current);
        element.setAttribute(attribute, value);
      }
    }
    const tokens = (element.getAttribute('aria-controls') ?? '').split(/\s+/).filter(Boolean);

    let changed = false;
    for (const token of requested) {
      if (!tokens.includes(token)) {
        owned.add(token);
        tokens.push(token);
        changed = true;
      }
    }
    if (changed) element.setAttribute('aria-controls', tokens.join(' '));
  }

  update();
  const observer = new MutationObserver(update);
  observer.observe(
    element,
    { attributes: true, attributeFilter: ['aria-controls', 'aria-haspopup', 'aria-expanded'] }
  );

  return () => {
    observer.disconnect();
    for (const [attribute, value] of Object.entries(values)) {
      if (element.getAttribute(attribute) !== value)
        continue;

      const original = previous.get(attribute);

      if (original === null || original === undefined)
        element.removeAttribute(attribute);
      else element.setAttribute(attribute, original);
    }
    if (!owned.size) return;
    const tokens = (element.getAttribute('aria-controls') ?? '').split(/\s+/).filter(
      (token) => token && !owned.has(token)
    );

    if (tokens.length)
      element.setAttribute('aria-controls', tokens.join(' '));
    else element.removeAttribute('aria-controls');
  };
}

export function focusPopover(popup: HTMLElement): void {
  const candidates = popup.querySelectorAll<HTMLElement>(
    'button, input, select, textarea, a[href], [tabindex], [contenteditable="true"]'
  );

  for (const element of candidates) {
    if (element.tabIndex < 0
      || element.matches(':disabled')
      || element.closest('[inert]')
      || !element.getClientRects().length)
      continue;

    element.focus({ preventScroll: true });
    if (getPopupActiveElement(popup) === element) return;
  }
  popup.focus({ preventScroll: true });
}
