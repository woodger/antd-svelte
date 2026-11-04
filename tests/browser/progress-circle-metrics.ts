export function snapshotProgressCircle(prefix = 'ant-progress') {
  const root = document.querySelector('[data-progress-circle]')!
    .querySelector<HTMLElement>(`.${prefix}`)!;
  const body = root.querySelector(`.${prefix}-body`)!;
  const svg = body.querySelector('svg')!;
  const indicator = body.querySelector(`.${prefix}-indicator`);
  const icon = indicator?.querySelector('svg');
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-progress-css-var$|^progress-circle-source-scope$/.test(name)
  ).sort();
  const css = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key => {
    const value = getComputedStyle(node).getPropertyValue(key);
    return [key, value.startsWith('url(') ? 'url(#gradient)' : value];
  }));
  const paths = [...svg.querySelectorAll('circle')];

  return {
    root: { classes: classes(root), style: css(root, ['width', 'height', 'font-size',
      'line-height', 'direction', 'padding-top']) },
    body: { classes: classes(body), style: css(body, ['width', 'height', 'font-size',
      'line-height', 'padding-left']) },
    svg: { classes: classes(svg), viewBox: svg.getAttribute('viewBox'),
      style: css(svg, ['display', 'width', 'height']) },
    paths: paths.map(path => ({
      classes: classes(path), radius: path.getAttribute('r'),
      style: css(path, ['stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray',
        'stroke-dashoffset', 'transform', 'transform-origin', 'fill-opacity', 'opacity'])
    })),
    gradients: [...svg.querySelectorAll('foreignObject')].map(node => ({
      width: node.getAttribute('width'), height: node.getAttribute('height'),
      backgrounds: [...node.querySelectorAll('div')].map(div => getComputedStyle(div).backgroundImage),
      maskResolves: Boolean(svg.querySelector(`[id="${node.getAttribute('mask')!.slice(5, -1)}"]`))
    })),
    indicator: indicator && { classes: classes(indicator), text: indicator.textContent,
      style: css(indicator, ['color', 'font-size', 'line-height', 'width', 'height']) },
    icon: icon ? { viewBox: icon.getAttribute('viewBox'), path: icon.querySelector('path')!.getAttribute('d') }
      : null
  };
}
