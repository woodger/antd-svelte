export function snapshotDividerConfig(prefix: string) {
  const frame = document.querySelector('[data-divider-config-case]')!;
  const root = frame.firstElementChild!;
  const css = (node: Element, keys: string[]) => {
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^css-(?:dev-only-do-not-override-)?[a-z0-9]+$/.test(name)
      && !name.startsWith('css-var-') && name !== 'divider-config-scope'
      && name !== 'ant-divider-css-var' && name !== `${prefix}-css-var`).sort();
  const content = root.querySelector(`.${CSS.escape(`${prefix}-inner-text`)}`);

  return {
    defaultClass: root.classList.contains('ant-divider'),
    classes: classes(root),
    role: root.getAttribute('role'),
    root: css(root, ['width', 'height', 'margin-block-start', 'margin-block-end',
      'margin-inline-start', 'margin-inline-end', 'font-size', 'line-height', 'font-weight',
      'color', 'opacity', 'direction', 'border-top-width', 'border-top-style', 'border-top-color',
      'border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color']),
    content: content ? { text: content.textContent, classes: classes(content),
      style: css(content, ['padding-inline-start', 'padding-inline-end', 'margin-inline-start',
        'margin-inline-end', 'color', 'font-style']) } : null,
    rails: [...root.querySelectorAll(`.${CSS.escape(`${prefix}-rail`)}`)].map(node => ({
      classes: classes(node),
      style: css(node, ['width', 'border-top-width', 'border-top-style', 'border-top-color'])
    }))
  };
}
