export function snapshotFlexSource(prefix: string) {
  const frame = document.querySelector('[data-flex-source]')!;
  const root = frame.firstElementChild!;
  const bounds = root.getBoundingClientRect();
  const style = getComputedStyle(root);
  const fields = ['display', 'width', 'height', 'margin-top', 'margin-left', 'padding-top',
    'padding-left', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap',
    'flex', 'direction', 'font-size', 'line-height', 'font-family', 'color', 'opacity'];

  return {
    tag: root.tagName,
    classes: [...root.classList].filter(name =>
      !/^css-(?:dev-only-do-not-override-)?[a-z0-9]+$/.test(name)
        && !name.startsWith('css-var-') && name !== 'flex-source-scope'
        && name !== 'ant-flex-css-var' && name !== `${prefix}-css-var`).sort(),
    attributes: Object.fromEntries(['id', 'role', 'aria-label', 'title', 'data-probe',
      'data-custom-label', 'data-custom-state', 'label'].map(name => [name, root.getAttribute(name)])),
    style: Object.fromEntries(fields.map(field => [field, style.getPropertyValue(field)])),
    children: [...root.children].map(node => {
      const box = node.getBoundingClientRect();
      return { tag: node.tagName, x: box.x - bounds.x, y: box.y - bounds.y,
        width: box.width, height: box.height };
    })
  };
}
