export function snapshotTagClose(host: HTMLElement) {
  const root = host.querySelector<HTMLElement>('[data-tag-api-root]');
  if (!root || root.classList.contains('ant-tag-hidden')) return null;

  const close = root.querySelector<HTMLElement>('.ant-tag-close-icon');
  const link = root.querySelector<HTMLAnchorElement>('a');
  const style = getComputedStyle(root);
  const description = close?.getAttribute('aria-describedby') ?? null;
  return {
    tag: root.tagName,
    href: root.getAttribute('href'),
    target: root.getAttribute('target'),
    title: root.getAttribute('title'),
    ariaDisabled: root.getAttribute('aria-disabled'),
    color: style.color,
    cursor: style.cursor,
    decoration: style.textDecorationLine,
    childLink: link ? {
      color: getComputedStyle(link).color,
      pointerEvents: getComputedStyle(link).pointerEvents,
      cursor: getComputedStyle(link).cursor
    } : null,
    close: close ? {
      label: close.getAttribute('aria-label'),
      description: description?.startsWith('ant-tag-content-') ? null : description,
      ariaDisabled: close.getAttribute('aria-disabled'),
      glyph: close.matches('[data-custom-close]') || close.querySelector('[data-custom-close]')
        ? 'snippet'
        : close.querySelector('svg') ? 'default' : 'text',
      text: close.textContent,
      expanded: close.getAttribute('aria-expanded'),
      dataMarker: close.getAttribute('data-marker')
    } : null
  };
}

export function snapshotTagLink(host: HTMLElement) {
  const root = host.querySelector<HTMLElement>('[data-tag-api-root]')!;
  const link = root.tagName === 'A' ? root : root.querySelector<HTMLAnchorElement>('a')!;
  const style = getComputedStyle(link);
  return {
    color: style.color,
    decoration: style.textDecorationLine,
    outline: style.outline,
    outlineOffset: style.outlineOffset,
    cursor: style.cursor,
    pointerEvents: style.pointerEvents,
    focused: link === document.activeElement,
    hovered: link.matches(':hover'),
    active: link.matches(':active')
  };
}
