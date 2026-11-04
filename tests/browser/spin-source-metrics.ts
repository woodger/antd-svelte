export function snapshotSpinSource(prefix = 'ant-spin') {
  const root = document.querySelector('[data-spin-source]')!
    .querySelector<HTMLElement>(`.${prefix}`)!;
  const section = root.matches(`.${prefix}-section`) ? root : root.querySelector(`.${prefix}-section`);
  const holder = root.querySelector(`.${prefix}-dot-holder`);
  const dot = root.querySelector(`.${prefix}-dot`);
  const progress = root.querySelector(`.${prefix}-dot-progress`);
  const svg = progress?.querySelector('svg');
  const circles = [...(svg?.querySelectorAll('circle') ?? [])];
  const description = root.querySelector(`.${prefix}-description`);
  const container = root.querySelector(`.${prefix}-container`);
  const custom = root.querySelector('[data-spin-custom]');
  const css = (node: Element | null, keys: string[]) => node && Object.fromEntries(
    keys.map(key => [key, getComputedStyle(node).getPropertyValue(key)])
  );
  const classes = (node: Element | null) => node && [...node.classList]
    .filter(name => !/^svelte-|^s-[\w-]{12}$|^css-|^ant-spin-css-var$|^spin-source-scope$/.test(name)).sort();

  return {
    root: {
      classes: classes(root),
      style: css(root, ['position', 'display', 'width', 'height', 'color', 'font-size',
        'line-height', 'background-color', 'z-index', 'opacity', 'pointer-events', 'padding-top'])
    },
    section: section && {
      classes: classes(section),
      style: css(section, ['position', 'display', 'color', 'gap', 'padding-top'])
    },
    holder: holder && {
      classes: classes(holder),
      style: css(holder, ['width', 'height', 'opacity', 'color'])
    },
    dot: dot && { classes: classes(dot), style: css(dot, ['width', 'height', 'color']) },
    progress: progress && {
      style: css(progress, ['width', 'height', 'opacity', 'position', 'left', 'top']),
      now: svg!.getAttribute('aria-valuenow'),
      circles: circles.map(circle => ({
        r: circle.getAttribute('r'), width: circle.getAttribute('stroke-width'),
        style: css(circle, ['stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset',
          'stroke-linecap', 'fill-opacity'])
      }))
    },
    description: description && {
      classes: classes(description), text: description.textContent,
      style: css(description, ['color', 'font-size', 'line-height'])
    },
    container: container && {
      classes: classes(container), text: container.textContent,
      style: css(container, ['opacity', 'position', 'pointer-events', 'background-color'])
    },
    custom: custom && { name: custom.getAttribute('data-spin-custom'),
      percent: custom.getAttribute('data-spin-percent') }
  };
}
