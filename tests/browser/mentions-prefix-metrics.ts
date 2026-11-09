export function snapshotMentionsPrefix() {
  // page.evaluate переносит в браузер только эту функцию; helper должен оставаться внутри.
  /** Сравнивает CSS control и popup, не привязываясь к React/Svelte DOM-обёрткам. */
  function snapshotMentionsPart(host: HTMLElement) {
    const root = host.querySelector<HTMLElement>('.fixture-mentions-prefix');
    if (!root) throw new Error('Mentions root is missing');

    const prefix = root.classList[0];
    const css = (node: Element | null, keys: readonly string[]) => {
      if (!node) return null;
      const style = getComputedStyle(node);

      return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
    };
    const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
    const box = [
      'width', 'height', 'min-height', 'padding-top', 'padding-right', 'padding-bottom',
      'padding-left', 'border-top-width', 'border-top-color', 'border-radius',
      'background-color', 'box-shadow'
    ];
    const popup = document.querySelector<HTMLElement>(
      `.fixture-${host.dataset.mentionsPrefixScope}-mentions-popup`
    );
    const visiblePopup = popup && getComputedStyle(popup).display !== 'none' ? popup : null;

    return {
      root: css(root, [...typography, ...box]),
      textarea: css(root.querySelector('textarea'), [
        ...typography, ...box, 'resize', 'overflow-x', 'overflow-y'
      ]),
      placeholder: (() => {
        const input = root.querySelector('textarea');
        return input ? getComputedStyle(input, '::placeholder').color : null;
      })(),
      popup: css(visiblePopup, [
        ...typography, ...box, 'z-index', 'font-variant', 'direction'
      ]),
      menu: css(visiblePopup?.querySelector(`.${prefix}-dropdown-menu`) ?? null, [
        'max-height', 'overflow-x', 'overflow-y', 'padding-left'
      ]),
      items: [...(visiblePopup?.querySelectorAll(`.${prefix}-dropdown-menu-item`) ?? [])]
        .map(node => css(node, [...typography, ...box, 'min-width', 'cursor']))
    };
  }

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-mentions-prefix-scope]')].map(host => [
      host.dataset.mentionsPrefixScope!, snapshotMentionsPart(host)
    ])
  );
}
