export function snapshotOverlayPrefixTriggers(component: string) {
  const selector = component === 'slider' ? '#config-case .ant-slider-handle'
    : component === 'avatar-group' ? '#config-case .ant-avatar-group-more, #config-case .ant-avatar-group>.ant-avatar:last-child'
    : '#config-case [data-config-anchor]';

  return [...document.querySelectorAll(selector)].map(node => [...node.classList]
    .filter(name => component === 'slider' || component === 'avatar-group' || component === 'typography'
      ? name.endsWith('-open') : true).sort());
}

export function snapshotOverlayPrefix(sample: { component: string; prefixCls?: string }) {
  const tooltip = sample.component === 'tooltip' || sample.component === 'slider'
    || sample.component === 'typography';
  const prefix = sample.component === 'popconfirm' ? 'ant-popover'
    : sample.prefixCls || (tooltip ? 'ant-tooltip' : 'ant-popover');
  const confirm = sample.prefixCls || 'ant-popconfirm';
  const roots = [...document.querySelectorAll<HTMLElement>(`.${CSS.escape(prefix)}`)]
    .filter(node => getComputedStyle(node).display !== 'none' && node.getClientRects().length);
  if (!roots.length) return null;

  const classes = (node: HTMLElement | null) => node ? [...node.classList]
    .filter(name => (name === prefix || name.startsWith(`${prefix}-`)
      || sample.component === 'popconfirm' && (name === confirm || name.startsWith(`${confirm}-`)))
      && !name.endsWith('-css-var')).sort() : null;
  const paint = (node: HTMLElement | null) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return {
      color: style.color, background: style.backgroundColor, image: style.backgroundImage,
      fontSize: style.fontSize, lineHeight: style.lineHeight, padding: style.padding,
      radius: style.borderTopLeftRadius, direction: style.direction
    };
  };
  const rect = (node: HTMLElement) => {
    const value = node.getBoundingClientRect();
    return { x: value.x, y: value.y, width: value.width, height: value.height };
  };

  return roots.map(root => {
    const slot = (name: string) => root.querySelector<HTMLElement>(`.${CSS.escape(`${prefix}-${name}`)}`);
    const title = sample.component === 'popconfirm'
      ? root.querySelector<HTMLElement>(`.${CSS.escape(`${confirm}-title`)}`) : slot('title');
    const content = sample.component === 'popconfirm'
      ? root.querySelector<HTMLElement>(`.${CSS.escape(`${confirm}-description`)}`) : slot('content');
    const arrow = slot('arrow');
    const arrowStyle = arrow && getComputedStyle(arrow);
    const before = arrow && getComputedStyle(arrow, '::before');

    return {
      classes: classes(root), rect: rect(root), root: paint(root),
      container: { classes: classes(slot('container')), paint: paint(slot('container')) },
      title: { classes: classes(title), paint: paint(title) },
      content: { classes: classes(content), paint: paint(content) },
      icon: classes(root.querySelector(`.${CSS.escape(`${confirm}-message-icon`)}`)),
      arrow: arrow && {
        classes: classes(arrow), x: arrowStyle!.left, y: arrowStyle!.top,
        width: arrowStyle!.width, height: arrowStyle!.height, transform: arrowStyle!.transform,
        background: before!.backgroundColor, image: before!.backgroundImage
      },
      prefixAttribute: root.getAttribute('prefixcls')
    };
  });
}
