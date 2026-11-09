export function snapshotDrawerPrefix() {
  const root = document.querySelector<HTMLElement>('.fixture-drawer-prefix')!;
  const prefix = [...root.classList].find(value => !/^(?:css-|svelte-|s-|fixture-)/.test(value))!;
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-top-color', 'border-bottom-width', 'border-bottom-color',
    'border-radius', 'background-color', 'box-shadow'];
  function css(node: Element | null, keys: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  }
  const part = (suffix: string) => root.querySelector(`[class~="${prefix}${suffix}"]`);

  return {
    root: css(root, [...typography, 'z-index', 'direction']),
    mask: css(part('-mask'), ['z-index', 'background-color', 'backdrop-filter']),
    wrapper: css(part('-content-wrapper'), ['width', 'height', 'box-shadow']),
    section: css(part('-section'), [...typography, 'background-color']),
    header: css(part('-header'), [...typography, ...box]),
    title: css(part('-title'), [...typography, 'margin-top', 'margin-bottom']),
    close: css(part('-close'), [...typography, ...box, 'margin-left', 'margin-right']),
    extra: css(part('-extra')?.querySelector('button') ?? null, [...typography, ...box]),
    body: css(part('-body'), [...typography, ...box, 'overflow-y']),
    input: css(root.querySelector('[aria-label="Drawer prefix draft"]'), [...typography, ...box]),
    footer: css(part('-footer'), [...typography, ...box]),
    footerButton: css(part('-footer')?.querySelector('button') ?? null, [...typography, ...box])
  };
}
