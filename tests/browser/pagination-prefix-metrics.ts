export function snapshotPaginationPrefix() {
  const root = document.querySelector<HTMLElement>('.fixture-pagination-prefix')!;
  const prefix = [...root.classList].find(value => !/^(?:css-|svelte-|s-|fixture-)/.test(value))!;
  const font = ['font-family', 'font-size', 'line-height', 'color'];
  const box = ['height', 'min-width', 'padding', 'margin-inline-end', 'background-color',
    'border-color', 'border-width', 'border-radius'];
  function css(node: Element | null, keys: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  }
  const part = (suffix: string) => root.querySelector(`[class~="${prefix}${suffix}"]`);
  const control = (node: Element | null) => node?.querySelector('button,a') ?? null;
  const select = root.querySelector('[role="combobox"]');
  let selectRoot: Element | null = select ?? null;
  while (selectRoot && ![...selectRoot.classList].some(value => value.endsWith('-select')))
    selectRoot = selectRoot.parentElement;

  return {
    root: css(root, [...font, 'padding', 'direction', 'justify-content']),
    page: css(part('-item-4'), [...font, ...box]),
    pageControl: css(control(part('-item-4')), [...font, 'padding', 'background-color']),
    active: css(part('-item-active'), [...font, ...box]),
    activeControl: css(control(part('-item-active')), [...font, 'padding', 'background-color']),
    previous: css(part('-prev'), [...font, ...box]),
    previousControl: css(control(part('-prev')), [...font, ...box]),
    next: css(part('-next'), [...font, ...box]),
    simple: css(part('-simple-pager'), [...font, ...box]),
    simpleInput: css(part('-simple-pager')?.querySelector('input') ?? null, [...font, ...box]),
    quick: css(part('-options-quick-jumper'), [...font, 'height']),
    quickInput: css(part('-options-quick-jumper')?.querySelector('input') ?? null, [...font, ...box]),
    select: css(selectRoot, [...font, 'height', 'min-width'])
  };
}
