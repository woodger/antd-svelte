export function snapshotTransferPrefix() {
  function css(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const border = ['border-top-width', 'border-top-color', 'border-radius'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-transfer-theme]')]
    .map(host => [host.dataset.transferTheme!, Object.fromEntries(
      [...host.querySelectorAll<HTMLElement>('[data-transfer-panel]')].map(panel => {
        const root = panel.querySelector<HTMLElement>('.fixture-transfer-prefix')!;
        const mode = panel.dataset.transferPanel;
        const prefix = [...root.classList].find(value => !/^(?:css-|svelte-|s-|fixture-)/.test(value))!;
        const selector = (suffix: string) => `[class~="${prefix}${suffix}"]`;
        const part = (suffix: string) => root.querySelector(selector(suffix));
        return [panel.dataset.transferPanel!, {
          root: css(root, [...font, 'direction']),
          ...(mode === 'basic' || mode === 'one-way' ? {
            actions: css(part('-actions'),
              ['margin-left', 'margin-right', 'gap']),
            button: css(part('-actions')?.querySelector('button') ?? null,
              ['font-size', 'height', 'color', 'background-color', ...border])
          } : {}),
          sections: [...root.querySelectorAll(selector('-section'))].map(section => ({
            section: css(section, ['width', 'height', 'min-height', ...border]),
            ...(mode === 'basic' ? {
              header: css(section.querySelector(selector('-list-header')),
                ['height', 'color', 'background-color', ...padding,
                  'border-bottom-width', 'border-bottom-color']),
              body: css(section.querySelector(selector('-list-body')), ['font-size']),
              searchWrapper: css(section.querySelector(selector('-list-body-search-wrapper')),
                padding),
              search: css(section.querySelector('[class*="-input-affix-wrapper"]'),
                [...font, 'height', ...padding, ...border]),
              searchInput: css(section.querySelector('input:not([type="checkbox"])'), font),
              item: css(section.querySelector(selector('-list-content-item')),
                [...font, 'min-height', 'background-color', ...padding]),
              disabledItem: css(section.querySelector(selector('-list-content-item-disabled')),
                [...font, 'min-height', 'background-color', ...padding]),
              checkbox: css(section.querySelector('input[type="checkbox"]')?.parentElement ?? null,
                [...font, 'width', 'height', 'background-color', ...border]),
              footer: css(section.querySelector(selector('-list-footer')),
                ['border-top-width', 'border-top-color'])
            } : {}),
            ...(mode === 'one-way' ? {
              item: css(section.querySelector(selector('-list-content-item')),
                [...font, 'min-height', 'background-color', ...padding]),
              remove: css(section.querySelector(selector('-list-content-item-remove')),
                ['font-size', 'color', 'cursor'])
            } : {}),
            ...(mode === 'pagination' ? {
              pagination: css(section.querySelector('ul[class*="-pagination"]'),
                [...font, ...padding, ...border]),
              pager: css(section.querySelector('li[class*="-pagination-simple-pager"] input'),
                [...font, 'width', 'height', 'background-color', ...border])
            } : {}),
            ...(mode === 'empty' ? {
              empty: css(section.querySelector(selector('-list-body-not-found')), font)
            } : {}),
            ...(mode === 'custom' ? {
              custom: css(section.querySelector('[data-transfer-custom]'), font)
            } : {})
          }))
        }];
      })
    )]));
}
