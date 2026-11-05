export function snapshotDescriptionsTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-descriptions-theme]')]
    .map(root => {
      const select = (selector: string) => root.querySelector<HTMLElement>(selector)!;
      const style = (selector: string, pseudo?: string) => getComputedStyle(select(selector), pseudo);
      const label = style('.ant-descriptions-item-label');
      const content = style('.ant-descriptions-item-content');
      const colon = style('.ant-descriptions-item-label', '::after');
      const rows = [...root.querySelectorAll(':scope > .ant-descriptions-view > table > tbody > tr')];
      const first = getComputedStyle(rows[0].firstElementChild!);
      const last = getComputedStyle(rows.at(-1)!.firstElementChild!);

      return [root.dataset.descriptionsTheme, {
        direction: getComputedStyle(root).direction,
        headerMargin: style('.ant-descriptions-header').marginBottom,
        titleColor: style('.ant-descriptions-title').color,
        extraColor: style('.ant-descriptions-extra').color,
        label: { color: label.color, background: label.backgroundColor },
        contentColor: content.color,
        colon: { start: colon.marginInlineStart, end: colon.marginInlineEnd, display: colon.display },
        firstCell: { bottom: first.paddingBottom, end: first.paddingInlineEnd },
        lastCell: { bottom: last.paddingBottom, end: last.paddingInlineEnd },
        spans: rows.map(row => [...row.children].map(cell => Number(cell.getAttribute('colspan') ?? 1)))
      }];
    }));
}
