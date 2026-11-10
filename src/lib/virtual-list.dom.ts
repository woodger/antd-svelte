/** Фактическая высота rc-virtual-list включает margins, но не скрытые строки. */
export function measureVirtualListRow(element: HTMLElement) {
  if (!element.offsetParent) return undefined;
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const top = Number.parseFloat(style?.marginTop ?? '') || 0;
  const bottom = Number.parseFloat(style?.marginBottom ?? '') || 0;
  return element.offsetHeight + top + bottom;
}
