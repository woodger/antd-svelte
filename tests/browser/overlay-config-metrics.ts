export function snapshotOverlayConfig(component: string) {
  const prefix = component === 'tooltip' || component === 'slider' ? 'ant-tooltip' : 'ant-popover';
  const popup = document.querySelector<HTMLElement>(`.${prefix}`);
  if (!popup || getComputedStyle(popup).display === 'none' || !popup.getClientRects().length) return null;
  const rect = popup.getBoundingClientRect();
  const slot = (node: HTMLElement | null) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return {
      classes: [...node.classList].filter(name => /^(ctx-|local-|outer-|inner-|cb-)/.test(name)).sort(),
      color: style.color,
      background: style.backgroundColor,
      opacity: style.opacity,
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
      radius: style.borderTopLeftRadius,
      layer: style.getPropertyValue('--layer').trim(),
      callback: style.getPropertyValue('--callback-enter').trim()
    };
  };
  const title = component === 'popconfirm' ? '.ant-popconfirm-title' : '.ant-popover-title';
  const content = component === 'popconfirm' ? '.ant-popconfirm-description' : '.ant-popover-content';

  return {
    popup: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    placement: [...popup.classList].find(name => name.startsWith(`${prefix}-placement-`))!
      .replace(`${prefix}-placement-`, ''),
    slots: {
      root: slot(popup),
      container: slot(popup.querySelector(`.${prefix}-container`)),
      arrow: slot(popup.querySelector(`.${prefix}-arrow`)),
      title: slot(prefix === 'ant-tooltip' ? null : popup.querySelector(title)),
      content: slot(prefix === 'ant-tooltip' ? null : popup.querySelector(content)),
      icon: slot(popup.querySelector('.ant-popconfirm-message-icon'))
    },
    input: popup.querySelector<HTMLInputElement>('[aria-label="Config draft"]')?.value ?? null
  };
}
