export function snapshotAvatarApi(host: HTMLElement, group = false) {
  const root = host.querySelector<HTMLElement>(group ? '.ant-avatar-group' : '.ant-avatar')!;
  const classes = (node: HTMLElement) => [...node.classList]
    .filter(name => name.startsWith('case-')).sort();
  const metric = (node: HTMLElement) => {
    const style = getComputedStyle(node);
    return {
      classes: classes(node),
      width: style.width,
      height: style.height,
      fontSize: style.fontSize,
      color: style.color,
      background: style.backgroundColor,
      radius: style.borderRadius,
      opacity: style.opacity,
      direction: style.direction,
      title: node.getAttribute('title'),
      lang: node.getAttribute('lang'),
      marker: node.getAttribute('data-marker') ?? node.getAttribute('data-member'),
      tabindex: node.getAttribute('tabindex'),
      key: node.getAttribute('key'),
      labelAttribute: node.getAttribute('label'),
      textAttribute: node.getAttribute('text'),
      image: Boolean(node.querySelector('img')),
      callerInput: node.querySelector('input')?.value ?? null
    };
  };

  return group ? {
    classes: classes(root),
    background: getComputedStyle(root).backgroundColor,
    opacity: getComputedStyle(root).opacity,
    members: [...root.querySelectorAll<HTMLElement>('.ant-avatar')].map(metric)
  } : metric(root);
}
