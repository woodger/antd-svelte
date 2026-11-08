export function snapshotPopupPrefix() {
  function textNodes(node: Node): string[] {
    return [...node.childNodes].flatMap(child => {
      if (child.nodeType !== Node.TEXT_NODE) return textNodes(child);
      const text = child.textContent?.trim();
      return text ? [text] : [];
    });
  }
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^(css-|s-[\w-]{12}$)/.test(name) && !name.endsWith('-css-var')
      && !name.endsWith('-source-theme') && name !== 'range-root').sort();
  const paint = (node: Element) => {
    const css = getComputedStyle(node);
    return {
      color: css.color,
      background: css.backgroundColor,
      fontSize: css.fontSize,
      lineHeight: css.lineHeight,
      direction: css.direction,
      padding: css.padding,
      radius: css.borderTopLeftRadius
    };
  };
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-popup-prefix-scope]')].map(scope => {
      const host = scope.querySelector<HTMLElement>('[data-prefix-widget]')!;
      const slider = host.dataset.prefixWidget === 'single' || host.dataset.prefixWidget === 'range';
      const roots = [...scope.querySelectorAll('[data-prefix-portal] *')].filter(node =>
        [...node.classList].some(name => /-(tooltip|popover)$/.test(name))
          && getComputedStyle(node).display !== 'none' && node.getClientRects().length);
      return [scope.dataset.popupPrefixScope, {
        control: slider ? {
          classes: classes(host.firstElementChild!),
          paint: paint(host.firstElementChild!)
        } : null,
        popups: roots.map(root => ({
          classes: classes(root),
          paint: paint(root),
          container: paint(root.querySelector('[class*="-container"]')!),
          textNodes: textNodes(root)
        })),
        trigger: slider ? null : [...host.querySelector('[data-prefix-anchor]')!.classList]
          .filter(name => name.endsWith('-open')).sort()
      }];
    }));
}
