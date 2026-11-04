export function snapshotDividerTheme() {
  const css = (node: Element, fields: string[]) => {
    const style = getComputedStyle(node);
    return Object.fromEntries(fields.map(field => [field, style.getPropertyValue(field)]));
  };

  return Object.fromEntries([...document.querySelectorAll('[data-divider-theme]')].map(frame => {
    const root = frame.querySelector('.ant-divider')!;
    const content = root.querySelector('.ant-divider-inner-text');

    return [frame.getAttribute('data-divider-theme'), {
      root: css(root, ['height', 'margin-block-start', 'margin-block-end', 'margin-inline-start',
        'margin-inline-end', 'font-size', 'line-height', 'font-weight', 'color',
        'border-block-start-width', 'border-block-start-style', 'border-block-start-color',
        'border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color']),
      content: content ? css(content, ['padding-inline-start', 'padding-inline-end',
        'margin-inline-start', 'margin-inline-end']) : null,
      rails: [...root.querySelectorAll('.ant-divider-rail')].map(node =>
        css(node, ['width', 'border-block-start-width', 'border-block-start-style',
          'border-block-start-color']))
    }];
  }));
}
