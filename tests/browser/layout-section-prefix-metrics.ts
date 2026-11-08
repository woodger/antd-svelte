export function snapshotLayoutSectionPrefix() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-section-prefix]')]
    .map(host => [host.dataset.sectionPrefix, Object.fromEntries(
      ['header', 'content', 'footer'].map(part => {
        const node = host.querySelector<HTMLElement>(`[data-section-part="${part}"]`)!;
        const css = getComputedStyle(node);

        return [part, {
          display: css.display, boxSizing: css.boxSizing, direction: css.direction,
          color: css.color, background: css.backgroundColor, fontSize: css.fontSize,
          lineHeight: css.lineHeight, padding: css.padding,
          height: node.getBoundingClientRect().height,
          flex: host.dataset.sectionPrefix === 'standalone' ? null : css.flex
        }];
      })
    )]));
}
