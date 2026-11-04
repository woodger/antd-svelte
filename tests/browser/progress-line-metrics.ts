export function snapshotProgressLine(prefix = 'ant-progress') {
  const root = document.querySelector('[data-progress-line]')!
    .querySelector<HTMLElement>(`.${prefix}`)!;
  const body = root.querySelector(`.${prefix}-body, .${prefix}-steps-body`)!;
  const rail = root.querySelector(`.${prefix}-rail`);
  const tracks = [...root.querySelectorAll(`.${prefix}-track, .${prefix}-steps-item`)];
  const indicator = root.querySelector(`.${prefix}-indicator`);
  const icon = indicator?.querySelector('svg');
  const classes = (node: Element | null) => node && [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-progress-css-var$|^progress-line-source-scope$/.test(name)
  ).sort();
  const css = (node: Element | null, keys: string[]) => node && Object.fromEntries(keys.map(key =>
    [key, getComputedStyle(node).getPropertyValue(key)]
  ));

  return {
    root: {
      classes: classes(root),
      style: css(root, ['display', 'width', 'height', 'color', 'font-size', 'line-height',
        'direction', 'padding-top'])
    },
    body: {
      classes: classes(body),
      style: css(body, ['display', 'width', 'height', 'align-items', 'flex-direction', 'gap'])
    },
    rail: rail && {
      classes: classes(rail),
      style: css(rail, ['width', 'height', 'background-color', 'border-radius'])
    },
    tracks: tracks.map(track => ({
      classes: classes(track),
      style: css(track, ['width', 'height', 'background-color', 'background-image',
        'border-radius', '--progress-line-stroke-color'])
    })),
    indicator: indicator && {
      classes: classes(indicator),
      text: indicator.textContent,
      style: css(indicator, ['color', 'font-size', 'line-height', 'display', 'order',
        'justify-content', 'padding-left', 'width'])
    },
    icon: icon ? {
      viewBox: icon.getAttribute('viewBox'),
      width: icon.querySelector('path')!.getBoundingClientRect().width,
      height: icon.querySelector('path')!.getBoundingClientRect().height
    } : null
  };
}
