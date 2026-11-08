export function formTooltipMetrics() {
  const host = document.querySelector('[data-tooltip-case]')!;
  const label = host.querySelector('.ant-form-item-label > label');
  const icon = host.querySelector<HTMLElement>('.ant-form-item-tooltip');
  const css = icon ? getComputedStyle(icon) : null;
  const iconBox = icon?.getBoundingClientRect();
  const labelBox = label?.getBoundingClientRect();
  const popup = document.querySelector('[data-ant-tooltip]:popover-open');
  const content = popup?.querySelector('.ant-tooltip-container');
  const round = (value: number) => Math.round(value * 100) / 100;

  return {
    label: label ? {
      text: label.textContent, title: label.getAttribute('title'), height: round(labelBox!.height)
    } : null,
    icon: icon ? {
      text: icon.textContent, tabIndex: icon.tabIndex,
      kind: icon.querySelector('svg') ? 'default'
        : icon.querySelector('[data-tooltip-icon]')?.getAttribute('data-tooltip-icon') ?? 'children',
      css: { color: css!.color, cursor: css!.cursor, marginInlineStart: css!.marginInlineStart },
      width: round(iconBox!.width), height: round(iconBox!.height),
      offset: round(iconBox!.left - labelBox!.left)
    } : null,
    popup: content ? {
      text: content.textContent, background: getComputedStyle(content).backgroundColor,
      placement: [...popup!.classList].find((name) => name.startsWith('ant-tooltip-placement-'))
        ?.replace('ant-tooltip-placement-', '')
    } : null
  };
}
