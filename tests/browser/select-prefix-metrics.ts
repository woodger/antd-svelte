export function snapshotSelectPrefix() {
  const host = document.querySelector<HTMLElement>('.fixture-select-prefix')!;
  const root = host.querySelector<HTMLElement>('[data-ant-select-control]') ?? host;
  const prefix = root.dataset.antSelectPrefix ?? [...root.classList]
    .find(value => !/^(?:css-|svelte-|s-|fixture-)/.test(value))!;
  const part = (suffix: string) => root.querySelector(`[class~="${prefix}${suffix}"]`);
  const popup = document.querySelector(`[class~="${prefix}-dropdown"]`);
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const border = ['border-top-width', 'border-top-style', 'border-top-color', 'border-radius'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  function css(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }

  return {
    root: css(root, [...font, ...border, ...padding, 'height', 'background-color', 'direction']),
    input: css(root.querySelector('input:not([type="hidden"])'), font),
    tag: css(part('-selection-item'), [...font, ...border, ...padding, 'background-color']),
    suffix: css(part('-suffix'), ['font-size', 'line-height', 'color']),
    clear: css(part('-clear'), ['font-size', 'width', 'height', 'color']),
    popup: css(popup, [...font, ...padding, 'background-color', 'border-radius', 'z-index']),
    options: popup ? [...popup.querySelectorAll(`[class~="${prefix}-item-option"]`)]
      .map(node => ({
        label: node.textContent?.trim(),
        css: css(node, [...font, ...padding, 'min-height', 'font-weight', 'background-color'])
      })) : []
  };
}
