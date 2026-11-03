import type { Page } from '@playwright/test';

export async function snapshotBadgeApi(page: Page, includeText = false, prefixDetails = false) {
  const ref = await page.getByLabel('Badge API ref', { exact: true }).textContent();
  return page.locator('#badge-api-surface').evaluate((host, { ref, includeText, prefixDetails }) => {
    const root = host.querySelector<HTMLElement>('[data-api-root]')!;
    const prefix = root.dataset.apiPrefix || 'ant-badge';
    const numberPrefix = root.dataset.apiNumberPrefix || 'ant-scroll-number';
    const children = [...root.children].filter((node): node is HTMLElement =>
      node instanceof HTMLElement);
    const indicator = root.querySelector<HTMLElement>(
      'sup, [data-api-custom]'
    ) ?? children.find(node => node.classList.contains(`${prefix}-status-dot`)) ?? null;
    const text = children.find(node => node.classList.contains(`${prefix}-status-text`)) ?? null;
    const base = root.getBoundingClientRect();
    const metric = (node: HTMLElement | null) => {
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const round = (value: number) => Math.round(value * 1000) / 1000;

      return {
        x: round(rect.x - base.x), y: round(rect.y - base.y),
        width: round(rect.width), height: round(rect.height),
        fontSize: style.fontSize, lineHeight: style.lineHeight, weight: style.fontWeight,
        color: style.color, background: style.backgroundColor,
        backgroundImage: style.backgroundImage, padding: style.padding,
        opacity: style.opacity, radius: style.borderRadius, shadow: style.boxShadow,
        outline: style.outline, marginTop: style.marginTop,
        insetInlineEnd: style.insetInlineEnd, borderColor: style.borderColor,
        ...(prefixDetails ? {
          boxSizing: style.boxSizing, display: style.display, position: style.position,
          fontFamily: style.fontFamily, overflow: style.overflow, transform: style.transform,
          transitionDuration: style.transitionDuration
        } : {})
      };
    };
    const classes = (node: HTMLElement | null) => node
      ? [...node.classList].filter(name => name.startsWith('case-')).sort() : [];

    return {
      root: metric(root), indicator: metric(indicator), text: metric(text),
      classes: { root: classes(root), indicator: classes(indicator) },
      kind: indicator?.tagName === 'SUP' ? 'number'
        : indicator?.hasAttribute('data-api-custom') ? 'custom' : indicator ? 'status' : null,
      preset: indicator ? [...indicator.classList]
        .find(name => name.startsWith(`${prefix}-color-`))?.slice(prefix.length + 7) ?? null : null,
      content: indicator?.textContent ?? null,
      ref: ref === 'SPAN',
      ...(includeText ? { statusText: text?.textContent ?? null } : {}),
      ...(prefixDetails ? {
        prefixClasses: {
          root: [prefix, `${prefix}-status`, `${prefix}-not-a-wrapper`, `${prefix}-rtl`]
            .filter(name => root.classList.contains(name)),
          indicator: [numberPrefix, `${numberPrefix}-custom-component`, `${prefix}-count`,
            `${prefix}-dot`, `${prefix}-status-dot`, `${prefix}-count-sm`, `${prefix}-multiple-words`,
            ...['success', 'processing', 'default', 'error', 'warning']
              .map(status => `${prefix}-status-${status}`),
            ...['blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange',
              'yellow', 'volcano', 'geekblue', 'lime', 'gold'].map(color => `${prefix}-color-${color}`)]
            .filter(name => indicator?.classList.contains(name)),
          text: text?.classList.contains(`${prefix}-status-text`) ? [`${prefix}-status-text`] : []
        },
        digits: [...root.querySelectorAll<HTMLElement>('bdi > span')].map(node => ({
          class: node.classList.contains(`${numberPrefix}-only`) ? `${numberPrefix}-only` : null,
          ...metric(node)
        }))
      } : {})
    };
  }, { ref, includeText, prefixDetails });
}
