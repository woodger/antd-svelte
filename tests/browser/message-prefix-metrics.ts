/** Native viewport и перенос длинных слов проверяются отдельно от общих Source CSS metrics. */
export function snapshotMessagePrefix() {
  const notice = document.querySelector<HTMLElement>('.fixture-message-prefix')!;
  const prefix = [...notice.classList].find(value => value.endsWith('-notice'))!.slice(0, -7);
  const root = notice.closest('[data-ant-message-root]')
    ?? notice.closest(`[class~="${prefix}-list"]`)!;
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-top-color', 'border-radius', 'background-color', 'box-shadow'];
  function css(node: Element | null, keys: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  }
  const part = (suffix: string) => notice.querySelector(`[class~="${prefix}${suffix}"]`);

  return {
    root: css(root, [...typography, 'z-index', 'direction']),
    notice: css(notice, [...typography, ...box]),
    wrapper: css(part('-notice-wrapper'), [...typography, 'width', 'height', 'gap', 'align-items']),
    title: css(part('-notice-title'), [...typography, 'width', 'height']),
    icon: css(part('-notice-icon'), [...typography, 'width', 'height']),
    svg: css(part('-notice-icon')?.querySelector('svg') ?? null, ['width', 'height', 'color'])
  };
}
