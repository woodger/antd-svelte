import type { TooltipAlignmentHost } from './fixtures/tooltip-align.types';

export function snapshotTooltipAlignment() {
  const root = document.querySelector<TooltipAlignmentHost>('#tooltip-align-case')!;
  const popup = root.tooltipRef?.popupElement;
  if (!popup) return null;
  const anchor = document.querySelector<HTMLElement>('[data-alignment-anchor]')!;
  const rect = (node: Element) => {
    const value = node.getBoundingClientRect();
    return { x: value.x, y: value.y, width: value.width, height: value.height };
  };
  const arrow = popup.querySelector<HTMLElement>('.ant-tooltip-arrow')!;
  const css = getComputedStyle(popup);
  const arrowCss = getComputedStyle(arrow);

  return {
    anchor: rect(anchor),
    popup: rect(popup),
    placement: [...popup.classList].find(name => name.startsWith('ant-tooltip-placement-'))
      ?.slice('ant-tooltip-placement-'.length) ?? null,
    arrowX: parseFloat(css.getPropertyValue('--arrow-x')),
    arrowY: parseFloat(css.getPropertyValue('--arrow-y')),
    arrow: {
      left: arrowCss.left, top: arrowCss.top, right: arrowCss.right,
      bottom: arrowCss.bottom, transform: arrowCss.transform
    },
    callback: { nodeMatches: root.callbackElement === popup, align: root.lastAlign }
  };
}
