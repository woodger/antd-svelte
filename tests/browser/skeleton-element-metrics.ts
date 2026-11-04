export function snapshotSkeletonElement(prefix = 'ant-skeleton') {
  const frame = document.querySelector('[data-skeleton-element-frame]')!;
  const root = frame.querySelector<HTMLElement>(`.${prefix}`)!;
  const content = root.firstElementChild!;
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-skeleton-css-var$|^skeleton-element-source-scope$/.test(name)
  ).sort();
  const css = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key => {
    const value = getComputedStyle(node).getPropertyValue(key);
    return [key, key === 'animation-name' && value.endsWith('ant-skeleton-loading')
      ? 'skeleton-loading' : value];
  }));
  const svg = content.querySelector('svg');

  return {
    root: {
      classes: classes(root),
      style: css(root, ['display', 'width', 'height', 'font-size', 'line-height',
        'direction', 'padding-top', 'background-color'])
    },
    content: {
      tag: content.tagName,
      classes: classes(content),
      text: content.textContent,
      style: css(content, ['display', 'width', 'height', 'min-width', 'line-height',
        'border-radius', 'background-color', 'background-image', 'background-size',
        'animation-name', 'animation-duration', 'color', 'padding-left'])
    },
    image: svg ? {
      viewBox: svg.getAttribute('viewBox'),
      path: svg.querySelector('path')!.getAttribute('d'),
      style: css(svg, ['width', 'height', 'line-height', 'fill'])
    } : null
  };
}
