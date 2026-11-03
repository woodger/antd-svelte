export function snapshotAvatarPrefix(host: HTMLElement, sample: {
  prefixCls?: string; itemPrefix?: string; group?: boolean;
}) {
  const root = host.firstElementChild as HTMLElement;
  const prefix = sample.prefixCls || 'ant-avatar';
  const classes = (node: Element, value: string) => [...node.classList]
    .filter(name => name === value || name.startsWith(`${value}-`))
    .filter(name => name !== `${value}-css-var` && name !== 'ant-avatar-css-var')
    .sort();
  const metric = (node: HTMLElement, value: string) => {
    const style = getComputedStyle(node);
    const text = node.querySelector(`.${CSS.escape(`${value}-string`)}`);
    const image = node.querySelector('img');
    return {
      classes: classes(node, value),
      stringClasses: text ? classes(text, value) : null,
      width: style.width,
      height: style.height,
      fontSize: style.fontSize,
      color: style.color,
      background: style.backgroundColor,
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      radius: style.borderRadius,
      direction: style.direction,
      image: image ? {
        display: getComputedStyle(image).display,
        fit: getComputedStyle(image).objectFit,
        width: getComputedStyle(image).width,
        height: getComputedStyle(image).height
      } : null,
      callerInput: node.querySelector('input')?.value ?? null,
      prefixAttribute: node.getAttribute('prefixcls')
    };
  };

  if (!sample.group) return { root: metric(root, prefix), members: [] };

  const alpha = root.querySelector<HTMLElement>('[data-member="alpha"]')!;
  const beta = root.querySelector<HTMLElement>('.case-beta')!;
  const counter = [...root.querySelectorAll<HTMLElement>('.ant-avatar')]
    .find(node => node !== alpha && node !== beta)!;
  return {
    root: { classes: classes(root, prefix), prefixAttribute: root.getAttribute('prefixcls') },
    members: [metric(alpha, sample.itemPrefix || 'ant-avatar'),
      metric(beta, sample.itemPrefix || 'ant-avatar'), metric(counter, 'ant-avatar')]
  };
}
