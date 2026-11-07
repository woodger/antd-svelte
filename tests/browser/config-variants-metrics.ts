export function snapshotConfigVariants(kinds: readonly {
  id: string;
  prefix: string;
  selector: string;
}[]) {
  return Object.fromEntries(kinds.map(({ id, prefix, selector }) => {
    const host = document.querySelector(`[data-variant-kind="${id}"]`)!;
    const node = host.querySelector(selector)!;
    const css = getComputedStyle(node);
    const metrics: {
      variants: string[];
      styles: Record<string, string>;
      bordered?: boolean;
      buttonVariants?: string[];
    } = {
      variants: ['outlined', 'filled', 'borderless', 'underlined'].filter(variant =>
        node.classList.contains(`${prefix}-${variant}`)),
      styles: Object.fromEntries(['background-color', 'border-top-width', 'border-top-color',
        'border-bottom-width', 'border-bottom-color'].map(name => [name, css.getPropertyValue(name)]))
    };
    if (id === 'card') metrics.bordered = node.classList.contains('ant-card-bordered');
    if (id === 'search') metrics.buttonVariants = [...host.querySelector('button')!.classList]
      .filter(name => /^ant-input-search-btn-(outlined|filled|borderless|underlined)$/.test(name));

    return [id, metrics];
  }));
}
