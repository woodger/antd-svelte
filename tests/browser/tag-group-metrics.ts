export function snapshotTagGroup(host: HTMLElement) {
  const root = host.querySelector<HTMLElement>('[data-tag-group-root]')!;
  const style = getComputedStyle(root);
  const classes = (node: Element) => [...node.classList].filter(name =>
    name.startsWith('case-') || name.startsWith('ant-tag-checkable-group')
  ).sort();

  return {
    id: root.id,
    role: root.getAttribute('role'),
    label: root.getAttribute('aria-label'),
    describedBy: root.getAttribute('aria-describedby'),
    marker: root.getAttribute('data-marker'),
    title: root.getAttribute('title'),
    classes: classes(root),
    display: style.display,
    wrap: style.flexWrap,
    gap: style.gap,
    padding: style.padding,
    opacity: style.opacity,
    items: [...root.querySelectorAll<HTMLElement>('.ant-tag-checkable')].map(node => {
      const itemStyle = getComputedStyle(node);
      return {
        label: node.textContent,
        checked: node.classList.contains('ant-tag-checkable-checked'),
        disabled: node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true',
        classes: classes(node),
        color: itemStyle.color,
        background: itemStyle.backgroundColor,
        borderColor: itemStyle.borderColor,
        borderRadius: itemStyle.borderRadius,
        fontSize: itemStyle.fontSize,
        lineHeight: itemStyle.lineHeight,
        fontWeight: itemStyle.fontWeight,
        padding: itemStyle.padding,
        opacity: itemStyle.opacity
      };
    }),
    events: JSON.parse(host.querySelector('[aria-label="Tag group events"]')!.textContent!)
  };
}
