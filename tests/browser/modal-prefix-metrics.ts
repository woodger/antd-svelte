/** Общие метрики панели; native centering и резерв title под close остаются отдельным contract. */
export function snapshotModalPrefix() {
  const host = document.querySelector<HTMLElement>('.fixture-modal-prefix')!;
  const root = host.querySelector<HTMLElement>('[data-ant-modal-panel]') ?? host;
  const container = root.querySelector('[data-ant-modal-container], [class$="-container"]')!;
  const prefix = [...container.classList].find(value => value.endsWith('-container'))!.slice(0, -10);
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
  const header = part('-header');
  const hasHeader = header && getComputedStyle(header).display !== 'none';
  const mask = document.querySelector(`[class~="${prefix}-mask"]`);
  const backdrop = mask ? getComputedStyle(mask) : getComputedStyle(host, '::backdrop');

  return {
    root: css(root, [...typography, 'width', 'direction']),
    mask: { background: backdrop.backgroundColor },
    container: css(part('-container'), [...typography, ...box]),
    header: css(hasHeader ? header : null, [...typography, ...box, 'margin-bottom']),
    title: css(hasHeader ? part('-title') : null, [...typography, 'margin-top', 'margin-bottom']),
    close: css(part('-close'), [...typography, ...box, 'top', 'inset-inline-end']),
    body: css(part('-body'), [...typography, ...box]),
    input: css(root.querySelector('[aria-label="Modal prefix draft"]'), [...typography, ...box]),
    footer: css(part('-footer'), [...typography, ...box, 'margin-top']),
    buttons: [...root.querySelectorAll('button')].filter(node => !node.classList.contains(`${prefix}-close`))
      .map(node => css(node, [...typography, ...box, 'margin-inline-start'])),
    confirmBody: css(part('-confirm-body'), [...typography, ...box, 'display', 'align-items']),
    confirmTitle: css(part('-confirm-title'), typography),
    confirmContent: css(part('-confirm-content'), [...typography, ...box]),
    confirmButtons: css(part('-confirm-btns'), [...typography, ...box, 'margin-top'])
  };
}
