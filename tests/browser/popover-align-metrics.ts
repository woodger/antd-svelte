import type { PopoverAlignmentHost } from './fixtures/popover-align.types';

export function snapshotPopoverAlignment() {
  const root = document.querySelector<PopoverAlignmentHost>('#popover-align-case');
  const popup = document.querySelector<HTMLElement>('[data-ant-popover]:not([hidden])');
  if (!root || !popup) return null;
  const anchor = root.querySelector<HTMLElement>('[data-alignment-anchor],.ant-avatar-group-more')!;
  const rect = (node: Element) => {
    const value = node.getBoundingClientRect();
    return { x: value.x, y: value.y, width: value.width, height: value.height };
  };
  const arrow = popup.querySelector<HTMLElement>('.ant-popover-arrow')!;
  const css = getComputedStyle(popup);
  const arrowCss = getComputedStyle(arrow);

  return {
    anchor: rect(anchor),
    popup: rect(popup),
    placement: [...popup.classList].find(name => name.startsWith('ant-popover-placement-'))
      ?.slice('ant-popover-placement-'.length) ?? null,
    arrowX: parseFloat(css.getPropertyValue('--arrow-x')),
    arrowY: parseFloat(css.getPropertyValue('--arrow-y')),
    arrow: {
      left: arrowCss.left, top: arrowCss.top, right: arrowCss.right,
      bottom: arrowCss.bottom, transform: arrowCss.transform
    },
    callback: { nodeMatches: root.callbackElement === popup, align: root.lastAlign }
  };
}
