export function snapshotOverlayCorner(component: string) {
  const prefix = component === 'tooltip' || component === 'slider' ? 'ant-tooltip' : 'ant-popover';
  const popup = [...document.querySelectorAll<HTMLElement>(`.${prefix}`)]
    .find(node => getComputedStyle(node).display !== 'none' && node.getClientRects().length);
  if (!popup) return null;

  const anchor = document.querySelector<HTMLElement>('[data-corner-anchor]')!;
  const rect = (node: HTMLElement) => {
    const value = node.getBoundingClientRect();
    return { x: value.x, y: value.y, width: value.width, height: value.height };
  };
  const arrow = popup.querySelector<HTMLElement>(`.${prefix}-arrow`);
  const style = getComputedStyle(popup);

  return {
    anchor: rect(anchor),
    popup: rect(popup),
    placement: [...popup.classList].find(name => name.startsWith(`${prefix}-placement-`))!
      .replace(`${prefix}-placement-`, ''),
    arrow: arrow ? {
      x: getComputedStyle(arrow).left,
      y: getComputedStyle(arrow).top,
      width: getComputedStyle(arrow).width,
      height: getComputedStyle(arrow).height,
      transform: getComputedStyle(arrow).transform
    } : null,
    arrowX: parseFloat(style.getPropertyValue('--arrow-x')),
    arrowY: parseFloat(style.getPropertyValue('--arrow-y')),
    input: popup.querySelector<HTMLInputElement>('[aria-label="Corner draft"]')?.value ?? null
  };
}
