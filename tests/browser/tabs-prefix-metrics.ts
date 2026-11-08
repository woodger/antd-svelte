export function snapshotTabsPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !name.startsWith('svelte-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')
      && name !== 'ant-tabs-add-in-operations').sort();
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-tabs-prefix-scope]')].map(host => {
      const scope = host.dataset.tabsPrefixScope!;
      const prefix = host.dataset.tabsPrefixBase!;
      const root = host.querySelector('.fixture-tabs-prefix')!;
      const nav = root.querySelector(`.${prefix}-nav`)!;
      const list = root.querySelector(`.${prefix}-nav-list`)!;
      const panel = root.querySelector('[role="tabpanel"][aria-hidden="false"]')!;
      const popup = document.querySelector<HTMLElement>(`.fixture-tabs-popup-${scope}`);
      const menu = popup?.querySelector(`.${prefix}-dropdown-menu`);

      return [scope, {
        classes: classes(root),
        root: style(root, ['font-size', 'line-height', 'color', 'direction']),
        nav: style(nav, ['display', 'margin', 'flex-direction']),
        tabs: [...list.querySelectorAll('.fixture-tab-label')].map(label => {
          const cell = label.closest(`.${prefix}-tab`)!;

          return {
            text: label.textContent,
            classes: classes(cell),
            label: style(label, ['font-size', 'font-weight', 'color']),
            cell: style(cell, ['padding-top', 'padding-bottom', 'padding-inline-start',
              'padding-inline-end', 'margin-inline-start', 'margin-inline-end', 'border-top-width'])
          };
        }),
        panel: { classes: classes(panel), style: style(panel, ['display', 'font-size', 'color']) },
        add: root.querySelector(`.${prefix}-nav-add`)
          ? style(root.querySelector(`.${prefix}-nav-add`)!, ['width', 'height', 'color']) : null,
        popup: popup?.getClientRects().length && menu ? {
          classes: classes(popup),
          root: style(popup, ['font-size', 'line-height', 'color', 'z-index']),
          menu: style(menu, ['background-color', 'border-radius', 'padding-top', 'padding-bottom']),
          items: [...menu.querySelectorAll(`.${prefix}-dropdown-menu-item`)].map(item => ({
            text: item.querySelector('.fixture-tab-label')!.textContent,
            classes: classes(item),
            style: style(item, ['font-size', 'color', 'padding-top', 'padding-inline-start'])
          }))
        } : null
      }];
    })
  );
}
