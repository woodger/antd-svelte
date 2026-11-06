export function snapshotTransferTheme() {
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
        const root = panel.querySelector('.ant-transfer')!;
        const mode = panel.dataset.transferPanel;
        return [panel.dataset.transferPanel!, {
          root: css(root, [...font, 'direction']),
          ...(mode === 'basic' || mode === 'one-way' ? {
            actions: css(root.querySelector('.ant-transfer-actions'),
              ['margin-left', 'margin-right', 'gap']),
            button: css(root.querySelector('.ant-transfer-actions .ant-btn'),
              ['font-size', 'height', 'color', 'background-color', ...border])
          } : {}),
          sections: [...root.querySelectorAll('.ant-transfer-section')].map(section => ({
            section: css(section, ['width', 'height', 'min-height', ...border]),
            ...(mode === 'basic' ? {
              header: css(section.querySelector('.ant-transfer-list-header'),
                ['height', 'color', 'background-color', ...padding,
                  'border-bottom-width', 'border-bottom-color']),
              body: css(section.querySelector('.ant-transfer-list-body'), ['font-size']),
              searchWrapper: css(section.querySelector('.ant-transfer-list-body-search-wrapper'),
                padding),
              search: css(section.querySelector('.ant-input-affix-wrapper'),
                [...font, 'height', ...padding, ...border]),
              searchInput: css(section.querySelector('input.ant-input'), font),
              item: css(section.querySelector('.ant-transfer-list-content-item'),
                [...font, 'min-height', 'background-color', ...padding]),
              disabledItem: css(section.querySelector('.ant-transfer-list-content-item-disabled'),
                [...font, 'min-height', 'background-color', ...padding]),
              checkbox: css(section.querySelector('.ant-checkbox'),
                [...font, 'width', 'height', 'background-color', ...border]),
              footer: css(section.querySelector('.ant-transfer-list-footer'),
                ['border-top-width', 'border-top-color'])
            } : {}),
            ...(mode === 'one-way' ? {
              item: css(section.querySelector('.ant-transfer-list-content-item'),
                [...font, 'min-height', 'background-color', ...padding]),
              remove: css(section.querySelector('.ant-transfer-list-content-item-remove'),
                ['font-size', 'color', 'cursor'])
            } : {}),
            ...(mode === 'pagination' ? {
              pagination: css(section.querySelector('.ant-pagination'),
                [...font, ...padding, ...border]),
              pager: css(section.querySelector('.ant-pagination-simple-pager input'),
                [...font, 'width', 'height', 'background-color', ...border])
            } : {}),
            ...(mode === 'empty' ? {
              empty: css(section.querySelector('.ant-transfer-list-body-not-found'), font)
            } : {}),
            ...(mode === 'custom' ? {
              custom: css(section.querySelector('[data-transfer-custom]'), font)
            } : {})
          }))
        }];
      })
    )]));
}
