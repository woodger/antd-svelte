export function snapshotCascaderPrefix() {
  const root = document.querySelector<HTMLElement>('.fixture-cascader-prefix')!;
  const input = root.querySelector<HTMLElement>('input:not([type="hidden"])');
  const panelClass = [...root.classList].find(name => name.endsWith('-panel'));
  const panel = Boolean(panelClass);
  const selectPrefix = root.dataset.antSelectPrefix ?? [...input?.classList ?? []]
    .find(name => name.endsWith('-input'))?.slice(0, -6);
  const prefix = root.dataset.antCascaderPrefix ?? (panelClass ? panelClass.slice(0, -6)
    : [...root.classList].find(name => name.endsWith('-cascader')) ?? selectPrefix)!;
  const popup = panel ? root
    : document.querySelector(`[class~="${selectPrefix}-dropdown"]`);
  const part = (suffix: string) => root.querySelector(`[class~="${selectPrefix}${suffix}"]`);
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  const border = ['border-top-width', 'border-top-color', 'border-radius'];
  function css(node: Element | null | undefined, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const nodePart = (node: Element, suffix: string) =>
    node.querySelector(`[class~="${prefix}${suffix}"]`);

  return {
    root: css(root, [...font, ...padding, ...border, 'height', 'background-color', 'direction']),
    input: css(input, font),
    tag: css(part('-selection-item'), [...font, ...padding, ...border, 'background-color']),
    clear: css(part('-clear'), ['font-size', 'width', 'height', 'color']),
    suffix: css(part('-suffix'), ['font-size', 'line-height', 'color']),
    popup: css(popup, [...font, ...padding, 'background-color', 'border-radius']),
    columns: popup ? [...popup.querySelectorAll(`[class~="${prefix}-menu"]`)]
      .map(menu => ({
        menu: css(menu, [...font, ...padding, 'width', 'height', 'border-right-width']),
        rows: [...menu.querySelectorAll(`[class~="${prefix}-menu-item"]`)].map(node => ({
          label: (nodePart(node, '-menu-item-content') ?? node).textContent
            ?.replace(/\s+/g, ' ').trim(),
          row: css(node, [...font, ...padding, 'min-height', 'background-color', 'font-weight']),
          checkbox: css(nodePart(node, '-checkbox'), ['width', 'height', 'background-color', ...border]),
          keyword: css(nodePart(node, '-menu-item-keyword'), ['color', 'font-weight'])
        }))
      })) : []
  };
}
