export function snapshotAlertSource(prefix = 'ant-alert') {
  const root = document.querySelector('[data-alert-source-frame]')!
    .querySelector<HTMLElement>(`.${prefix}`)!;
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-alert-css-var$|^alert-source-scope$/.test(name)
  ).sort();
  const style = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key =>
    [key, getComputedStyle(node).getPropertyValue(key)]
  ));
  const slot = (name: string) => {
    const node = root.querySelector<HTMLElement>(`.${prefix}-${name}`);
    const keys = ['font-size', 'padding-top', 'background-color',
      'margin-top', 'margin-inline-start', 'margin-inline-end'];
    if (name !== 'close-icon' || node?.style.color) keys.push('color');

    return node ? {
      classes: classes(node),
      text: (name === 'section' ? [...node.children].map(child => child.textContent).join('|')
        : node.textContent!).trim().replace(/\s+/g, ' '),
      style: style(node, keys)
    } : null;
  };
  const close = root.querySelector<HTMLButtonElement>(`.${prefix}-close-icon`);
  const icon = root.querySelector(`.${prefix}-icon`);
  const svg = icon?.querySelector('svg');

  return {
    root: {
      classes: classes(root), role: root.getAttribute('role'), data: root.getAttribute('data-owner'),
      style: style(root, ['color', 'background-color', 'border-color', 'border-radius',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'direction'])
    },
    icon: slot('icon'), section: slot('section'), title: slot('title'),
    description: slot('description'), actions: slot('actions'), close: slot('close-icon'),
    closeState: close ? {
      disabled: close.disabled, hasSvg: Boolean(close.querySelector('svg')),
      owner: close.getAttribute('data-owner'),
      labelledby: close.getAttribute('aria-labelledby'),
      description: close.getAttribute('aria-describedby')
    } : null,
    svg: svg ? {
      size: style(svg, ['width', 'height']), viewBox: svg.getAttribute('viewBox'),
      paths: [...svg.querySelectorAll('path')].map(node => getComputedStyle(node).getPropertyValue('d'))
    } : null
  };
}
