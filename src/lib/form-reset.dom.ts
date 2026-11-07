/** Сохраняет native focus связанного контрола при пересоздании Field. */
export function captureFormResetFocus(host: HTMLElement | undefined, id: string) {
  if (!host?.isConnected) return;
  const document = host.ownerDocument;
  const view = document.defaultView;
  const tree = host.getRootNode();
  const active = () => 'activeElement' in tree ? tree.activeElement : document.activeElement;
  const control = () => [...host.querySelectorAll<HTMLElement>('[id]')]
    .find((node) => node.id === id);
  const focused = active();
  const previous = control();
  if (!view || !(focused instanceof view.HTMLElement) || !previous?.contains(focused)) return;

  const path: number[] = [];
  let node: Element = focused;
  while (node !== previous && node.parentElement) {
    path.unshift([...node.parentElement.children].indexOf(node));
    node = node.parentElement;
  }
  const input = focused instanceof view.HTMLInputElement
    || focused instanceof view.HTMLTextAreaElement
    ? focused : undefined;
  const start = input?.selectionStart;
  const end = input?.selectionEnd;
  const direction = input?.selectionDirection;

  return () => {
    const current = active();
    if (!host.isConnected || focused.isConnected
      || current !== null && current !== document.body && current !== focused) {
      return;
    }
    let target: Element | undefined = control();
    for (const index of path) target = target?.children[index];
    if (!(target instanceof view.HTMLElement) || target.tagName !== focused.tagName
      || !target.getClientRects().length || target.matches(':disabled')
      || target.closest('[inert]')) {
      return;
    }

    target.focus({ preventScroll: true });
    if (start != null && end != null
      && (target instanceof view.HTMLInputElement || target instanceof view.HTMLTextAreaElement)
      && target.selectionStart !== null) {
      target.setSelectionRange(start, end, direction ?? undefined);
    }
  };
}
