export function snapshotSelectVariants() {
  const root = document.querySelector<HTMLElement>('#select-variant-control .ant-select')!;
  const css = getComputedStyle(root);
  const properties = ['background-color', 'border-top-width', 'border-top-style',
    'border-top-color', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
    'box-shadow', 'border-radius'];

  return {
    variants: ['outlined', 'filled', 'borderless', 'underlined'].filter(name =>
      root.classList.contains(`ant-select-${name}`)),
    disabled: root.querySelector('input')!.disabled,
    styles: Object.fromEntries(properties.map(name => [name, css.getPropertyValue(name)]))
  };
}
