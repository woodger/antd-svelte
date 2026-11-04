export function snapshotSkeletonMain(prefix = 'ant-skeleton') {
  const root = document.querySelector('[data-skeleton-main-frame]')!
    .querySelector<HTMLElement>(`.${prefix}`);
  if (!root) return null;

  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-skeleton-css-var$|^skeleton-main-source-scope$/.test(name)
  ).sort();
  const style = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key =>
    [key, getComputedStyle(node).getPropertyValue(key)]
  ));
  const part = (name: string) => {
    const marker = root.querySelector(`[data-ant-skeleton-part="${name}"]`);
    const selected = marker ?? root.querySelector(`.${prefix}-${name}, .nested-${name}`);
    if (!selected) return null;
    return {
      classes: classes(selected),
      style: style(selected, ['background-color', 'border-radius', 'color', 'padding-top',
        ...(['avatar', 'title'].includes(name) ? ['height'] : [])])
    };
  };
  const paragraph = root.querySelector('[data-ant-skeleton-part="paragraph"]')
    ?? root.querySelector(`.${prefix}-paragraph, .nested-paragraph`);

  return {
    root: { classes: classes(root),
      style: style(root, ['padding-top', 'background-color', 'color', 'font-size']) },
    header: part('header'), section: part('section'), avatar: part('avatar'),
    title: part('title'), paragraph: part('paragraph'),
    rows: paragraph ? [...paragraph.querySelectorAll('li')].map(li =>
      style(li, ['height', 'background-color', 'border-radius'])) : []
  };
}
