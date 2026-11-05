export function snapshotCollapseSource(prefix = 'ant-collapse') {
  const root = document.querySelector('[data-collapse-source-frame]')!
    .querySelector<HTMLElement>(`.${prefix}`)!;
  const classes = (node: Element, all = false) => [...node.classList].filter(name => all
    ? !/^svelte-|^s-[\w-]{12}$|^css-|^ant-collapse-css-var$|^collapse-source-scope$/.test(name)
    : /^(provider-|local-|item-|flag-)/.test(name)).sort();
  const style = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key =>
    [key, getComputedStyle(node).getPropertyValue(key)]
  ));
  const slot = (node: Element | null) => node ? {
    classes: classes(node), text: node.textContent!.trim().replace(/\s+/g, ' '),
    style: style(node, ['color', 'font-size', 'line-height', 'padding-top', 'padding-right',
      'padding-bottom', 'padding-left', 'background-color'])
  } : null;

  return {
    root: {
      classes: classes(root, true), data: root.getAttribute('data-owner'),
      style: style(root, ['color', 'font-size', 'line-height', 'background-color', 'border-color',
        'border-radius', 'border-top-width', 'padding-top', 'direction'])
    },
    items: [...root.children].filter(node => node.classList.contains(`${prefix}-item`)).map(node => {
      const header = node.querySelector(`.${prefix}-header`)!;
      const trigger = header.querySelector('[data-collapse-trigger]') ?? header;

      return {
        classes: classes(node, true), id: node.getAttribute('id'),
        data: node.getAttribute('data-item'),
        style: style(node, ['background-color', 'padding-top']),
        header: { classes: [...new Set([...classes(trigger), ...classes(header)])].sort(), style: slot(trigger)!.style },
        title: slot(node.querySelector(`.${prefix}-title`)),
        body: slot(node.querySelector(`.${prefix}-body`)),
        panel: node.querySelector(`.${prefix}-body`) ? style(
          node.querySelector(`.${prefix}-body`)!.parentElement!,
          ['color', 'background-color', 'border-top-width']
        ) : null,
        icon: slot(node.querySelector(`.${prefix}-expand-icon`)),
        extra: node.querySelector(`.${prefix}-extra`)?.textContent?.trim() ?? null
      };
    })
  };
}
