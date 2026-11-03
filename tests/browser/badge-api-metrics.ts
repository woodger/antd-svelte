import type { Page } from '@playwright/test';

export async function snapshotBadgeApi(page: Page, includeText = false) {
  const ref = await page.getByLabel('Badge API ref', { exact: true }).textContent();
  return page.locator('#badge-api-surface').evaluate((host, { ref, includeText }) => {
    const root = host.querySelector<HTMLElement>('[data-api-root]')!;
    const indicator = root.querySelector<HTMLElement>(
      'sup, .ant-badge-status-dot, [data-api-custom]'
    );
    const text = root.querySelector<HTMLElement>('.ant-badge-status-text');
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
        insetInlineEnd: style.insetInlineEnd, borderColor: style.borderColor
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
        .find(name => name.startsWith('ant-badge-color-'))?.slice(16) ?? null : null,
      content: indicator?.textContent ?? null,
      ref: ref === 'SPAN',
      ...(includeText ? { statusText: text?.textContent ?? null } : {})
    };
  }, { ref, includeText });
}
