/** Snippet composition меняет DOM без изменения parent items; сохраняем прежний focus anchor. */
export function retainCollapseFocus(root: HTMLElement) {
  let previous: HTMLElement | undefined;
  let key: string | undefined;
  let alive = true;

  function remember(element: Element | null) {
    if (!(element instanceof HTMLElement) || !root.contains(element)) return;
    previous = element;
    key = element.closest<HTMLElement>('[data-collapse-key]')?.dataset.collapseKey;
  }

  function enter(event: FocusEvent) {
    remember(event.target as Element);
  }

  function leave(event: FocusEvent) {
    if (event.relatedTarget instanceof Node) {
      if (!root.contains(event.relatedTarget)) previous = undefined;
      return;
    }

    const blurred = previous;
    // DOM move посылает blur до удаления узла. Observer восстанавливает anchor
    // перед очисткой; обычный явный blur не переживает microtask checkpoint.
    queueMicrotask(() => queueMicrotask(() => {
      if (alive && previous === blurred
        && root.ownerDocument.activeElement === root.ownerDocument.body) {
        previous = undefined;
      }
    }));
  }

  remember(root.ownerDocument.activeElement);
  root.addEventListener('focusin', enter);
  root.addEventListener('focusout', leave);
  const observer = new MutationObserver(() => {
    if (!alive || !previous || root.ownerDocument.activeElement !== root.ownerDocument.body) return;

    if (previous.isConnected && previous.getClientRects().length && !previous.matches(':disabled')) {
      previous.focus({ preventScroll: true });
      return;
    }

    const headers = Array.from(root.children).map(item => ({
      key: (item as HTMLElement).dataset.collapseKey,
      button: item.querySelector<HTMLButtonElement>('[data-collapse-trigger]')
    })).filter(item => item.button && !item.button.disabled);
    const target = headers.find(item => item.key === key)
      ?? headers.find(item => item.button?.getAttribute('aria-expanded') === 'true')
      ?? headers[0];
    (target?.button ?? root).focus({ preventScroll: true });
  });
  observer.observe(root, { childList: true, subtree: true });

  return () => {
    alive = false;
    observer.disconnect();
    root.removeEventListener('focusin', enter);
    root.removeEventListener('focusout', leave);
    previous = undefined;
  };
}
