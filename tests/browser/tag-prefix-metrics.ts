export function snapshotTagPrefix(host: HTMLElement, sample: {
  kind: 'tag' | 'checkable' | 'group'; prefixCls?: string; color?: string;
}) {
  const root = host.querySelector<HTMLElement>('[data-tag-prefix-root]')!;
  const prefix = sample.prefixCls || 'ant-tag';
  const classes = (node: HTMLElement, value = prefix, checkable = false) => [...node.classList]
    .filter(name => name === value || name.startsWith(`${value}-`))
    .filter(name => name !== 'ant-tag-css-var' && name !== 'ant-tag-dark'
      && !(sample.color === undefined && name === `${value}-default`
        && !node.classList.contains(`${value}-solid`))
      && !(checkable && name === `${value}-rtl`))
    .sort();
  const metric = (node: HTMLElement) => {
    const style = getComputedStyle(node);
    return {
      color: style.color,
      background: style.backgroundColor,
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      borderStyle: style.borderStyle,
      radius: style.borderRadius,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      paddingInline: style.paddingInline,
      opacity: style.opacity,
      fontWeight: style.fontWeight
    };
  };
  const close = root.querySelector<HTMLElement>('.case-close');
  const childLink = root.querySelector<HTMLAnchorElement>('a');
  const style = getComputedStyle(root);
  return {
    classes: classes(root, prefix, sample.kind === 'checkable'),
    metric: sample.kind === 'group' ? null : metric(root),
    layout: sample.kind === 'group'
      ? { display: style.display, wrap: style.flexWrap, gap: style.gap } : null,
    href: root.getAttribute('href'),
    target: root.getAttribute('target'),
    prefixAttribute: root.getAttribute('prefixcls'),
    close: close ? {
      classes: classes(close), color: getComputedStyle(close).color,
      // Native :disabled сохраняет not-allowed; React anticon[tabindex] использует pointer.
      cursor: close.getAttribute('aria-disabled') === 'true'
        ? null : getComputedStyle(close).cursor
    } : null,
    childLink: childLink ? {
      color: getComputedStyle(childLink).color,
      pointerEvents: getComputedStyle(childLink).pointerEvents
    } : null,
    items: sample.kind === 'group' ? [...root.children].map(node => ({
      classes: [
        ...classes(node as HTMLElement, prefix, true),
        ...classes(node as HTMLElement, 'ant-tag', true)
      ]
        .filter((value, index, values) => values.indexOf(value) === index).sort(),
      metric: metric(node as HTMLElement)
    })) : []
  };
}
