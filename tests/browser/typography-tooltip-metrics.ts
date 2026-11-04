export function snapshotTypographyTooltip(prefix = 'ant-tooltip') {
  const popup = document.querySelector<HTMLElement>(`.${CSS.escape(prefix)}`);
  if (!popup || getComputedStyle(popup).display === 'none' || !popup.getClientRects().length) return null;
  const container = popup.querySelector<HTMLElement>(`.${CSS.escape(`${prefix}-container`)}`)!;
  const style = getComputedStyle(container);

  return {
    classes: [...popup.classList].filter(name => /^(cb-|ctx-|local-)/.test(name)).sort(),
    color: style.color,
    background: style.backgroundColor,
    padding: style.padding,
    arrow: Boolean(popup.querySelector(`.${CSS.escape(`${prefix}-arrow`)}`)),
    input: popup.querySelector<HTMLInputElement>('[aria-label="Config draft"]')?.value ?? null
  };
}
