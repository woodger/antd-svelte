export function snapshotTagStyle(host: HTMLElement) {
  const root = host.querySelector<HTMLElement>('.ant-tag')!;
  const classes = (node: HTMLElement | null) => node
    ? [...node.classList].filter(name => /^(?:case-|ctx-|local-)/.test(name)).sort() : [];
  const metric = (node: HTMLElement | null, slot = false) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    const common = {
      color: style.color,
      background: style.backgroundColor,
      fontWeight: style.fontWeight,
      opacity: style.opacity,
      letterSpacing: style.letterSpacing,
      outline: style.outline,
      shadow: style.boxShadow
    };
    return slot ? common : {
      ...common,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      borderStyle: style.borderStyle,
      radius: style.borderRadius,
      paddingInline: style.paddingInline
    };
  };
  const icon = root.querySelector<HTMLElement>('.case-icon,.ctx-icon');
  const content = root.querySelector<HTMLElement>('.case-content,.ctx-content');
  const close = root.querySelector<HTMLElement>('.case-close,.ctx-close');
  return {
    root: metric(root),
    icon: metric(icon, true),
    content: metric(content, true),
    close: metric(close, true),
    classes: {
      root: classes(root),
      icon: classes(icon),
      content: classes(content),
      close: classes(close)
    },
    variant: ['filled', 'outlined', 'solid'].find(value => root.classList.contains(`ant-tag-${value}`))
      ?? null,
    disabled: root.classList.contains('ant-tag-disabled')
      || root.classList.contains('ant-tag-checkable-disabled')
  };
}
