export function snapshotOverlayColors(component: string) {
  const prefix = component === 'tooltip' || component === 'slider' ? 'ant-tooltip' : 'ant-popover';
  const roots = [...document.querySelectorAll<HTMLElement>(`.${prefix}`)]
    .filter(node => getComputedStyle(node).display !== 'none' && node.getClientRects().length);
  if (!roots.length) return null;

  const paint = (node: HTMLElement, pseudo?: string) => {
    const style = getComputedStyle(node, pseudo);
    return { background: style.backgroundColor, image: style.backgroundImage, color: style.color };
  };
  const color = (node: HTMLElement | null) => node ? getComputedStyle(node).color : null;

  return roots.map(root => {
    const container = root.querySelector<HTMLElement>(`.${prefix}-container`)!;
    const arrow = root.querySelector<HTMLElement>(`.${prefix}-arrow`);

    return {
      colorClass: [...root.classList].find(name => new RegExp(`^${prefix}-(?:blue|purple|cyan|green|magenta|pink|red|orange|yellow|volcano|geekblue|lime|gold)(?:-inverse)?$`).test(name)) ?? null,
      arrowVariable: root.style.getPropertyValue('--ant-tooltip-arrow-background-color'),
      foregroundVariable: container.style.getPropertyValue('--ant-tooltip-overlay-color'),
      container: {
        ...paint(container),
        inlineBackground: container.style.background,
        priority: container.style.getPropertyPriority('background')
      },
      arrow: arrow ? paint(arrow, '::before') : null,
      title: color(root.querySelector(component === 'popconfirm'
        ? '.ant-popconfirm-title' : '.ant-popover-title')),
      content: color(root.querySelector(component === 'popconfirm'
        ? '.ant-popconfirm-description' : '.ant-popover-content'))
    };
  });
}
