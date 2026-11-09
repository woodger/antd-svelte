/** Сверяет тему Notification с сохранением native close target и top-layer поверхности. */
export function snapshotNotificationPrefix() {
  const notice = document.querySelector<HTMLElement>('.fixture-notification-prefix')!;
  const prefix = [...notice.classList].find(value => value.endsWith('-notice'))!.slice(0, -7);
  const root = notice.closest(`[class~="${prefix}-list"]`)!;
  const part = (suffix: string) => root.querySelector(`[class~="${prefix}${suffix}"]`);
  const css = (node: Element | null, keys: readonly string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = [
    'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-top-color', 'border-radius', 'background-color', 'box-shadow'
  ];

  return {
    root: css(root, [...typography, 'z-index', 'direction']),
    notice: css(part('-notice'), [...typography, ...box]),
    wrapper: css(part('-notice-wrapper'), [
      ...typography, 'width', 'height', 'gap', 'align-items'
    ]),
    section: css(part('-notice-section'), [
      ...typography, 'width', 'height', 'gap'
    ]),
    title: css(part('-notice-title'), [
      ...typography, 'width', 'height', 'padding-inline-end'
    ]),
    description: css(part('-notice-description'), [
      ...typography, 'width', 'height', 'padding-inline-end'
    ]),
    icon: css(part('-notice-icon'), [
      ...typography, 'width', 'height'
    ]),
    svg: css(part('-notice-icon')?.querySelector('svg') ?? null, ['width', 'height', 'color']),
    close: css(part('-notice-close'), [
      ...typography, ...box, 'top', 'inset-inline-end'
    ]),
    closeIcon: css(part('-notice-close')?.querySelector('svg') ?? null, ['width', 'height', 'color']),
    input: css(root.querySelector('[aria-label="Notification prefix draft"]'), [...typography, ...box]),
    actions: css(part('-notice-actions'), ['width', 'height', 'margin-top']),
    action: css(part('-notice-actions')?.querySelector('button') ?? null, [...typography, ...box])
  };
}
