export function snapshotTreeSelectPrefix() {
  const root = document.querySelector<HTMLElement>('.fixture-tree-select-prefix')!;
  const prefix = root.dataset.antSelectPrefix ?? [...root.classList]
    .find(value => !/^(?:css-|svelte-|s-|fixture-)/.test(value))!;
  const part = (suffix: string) => root.querySelector(`[class~="${prefix}${suffix}"]`);
  const popup = document.querySelector<HTMLElement>(`[class~="${prefix}-dropdown"]`);
  const surface = popup?.querySelector<HTMLElement>('[role="tree"]');
  const tree = surface?.dataset.antTreePrefix ? surface : surface?.parentElement;
  const treePrefix = tree?.dataset.antTreePrefix ?? tree?.classList[0];
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  const border = ['border-top-width', 'border-top-color', 'border-radius'];
  function css(node: Element | null | undefined, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const nodePart = (node: Element, suffix: string) =>
    node.querySelector(`[class~="${treePrefix}${suffix}"]`);

  return {
    root: css(root, [...font, ...padding, ...border, 'height', 'background-color', 'direction']),
    input: css(root.querySelector('input:not([type="hidden"])'), font),
    tag: css(part('-selection-item'), [...font, ...padding, ...border, 'background-color']),
    clear: css(part('-clear'), ['font-size', 'width', 'height', 'color']),
    suffix: css(part('-suffix'), ['font-size', 'line-height', 'color']),
    popup: css(popup, [...font, ...padding, 'background-color', 'border-radius']),
    tree: css(tree, [...font, 'height', 'background-color', 'border-radius']),
    nodes: tree ? [...tree.querySelectorAll(`[class~="${treePrefix}-treenode"]`)]
      .filter(node => nodePart(node, '-title'))
      .map(node => ({
        title: nodePart(node, '-title')?.textContent,
        row: css(node, ['height', ...padding, 'color']),
        content: css(nodePart(node, '-node-content-wrapper'),
          [...font, ...padding, 'min-height', 'background-color']),
        switcher: css(nodePart(node, '-switcher'), ['width', 'height', 'color']),
        checkbox: css(nodePart(node, '-checkbox'), ['width', 'height', 'background-color', ...border])
      })) : []
  };
}
