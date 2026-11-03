import { getPopupPosition, type PopupArea, type PopupFlipCache } from './popup-position.engine';
import type { TabsMoreAlign, TabsMorePlacements, TabsMorePlacement } from './tabs.types';

/** CSS motion меняет client rect; popup выравнивается по исходному border box. */
export function getTabsMoreSize(element: HTMLElement) {
  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  const number = (value: string) => Number.parseFloat(value) || 0;
  const width = Number.parseFloat(style.width);
  const height = Number.parseFloat(style.height);
  const contentBox = style.boxSizing === 'content-box';

  return {
    width: Number.isFinite(width) ? width + (contentBox
      ? number(style.paddingLeft) + number(style.paddingRight)
        + number(style.borderLeftWidth) + number(style.borderRightWidth) : 0) : element.offsetWidth,
    height: Number.isFinite(height) ? height + (contentBox
      ? number(style.paddingTop) + number(style.paddingBottom)
        + number(style.borderTopWidth) + number(style.borderBottomWidth) : 0) : element.offsetHeight
  };
}

function scrollParents(element: HTMLElement) {
  const parents: HTMLElement[] = [];
  const view = element.ownerDocument.defaultView!;
  let current = element.parentElement;
  while (current) {
    const style = view.getComputedStyle(current);
    if ([style.overflow, style.overflowX, style.overflowY]
      .some(value => ['hidden', 'scroll', 'clip', 'auto'].includes(value))) parents.push(current);
    current = current.parentElement;
  }
  return parents;
}

function clipArea(initial: PopupArea, parents: readonly HTMLElement[]) {
  const area = { ...initial };
  for (const parent of parents) {
    const document = parent.ownerDocument;
    if (parent === document.body || parent === document.documentElement) continue;
    const style = document.defaultView!.getComputedStyle(parent);
    const rect = parent.getBoundingClientRect();
    const number = (value: string) => Number.parseFloat(value) || 0;
    const sx = Math.round(rect.width / parent.offsetWidth * 1000) / 1000 || 1;
    const sy = Math.round(rect.height / parent.offsetHeight * 1000) / 1000 || 1;
    const borderX = number(style.borderLeftWidth) + number(style.borderRightWidth);
    const borderY = number(style.borderTopWidth) + number(style.borderBottomWidth);
    const margin = style.overflow === 'clip' ? number(style.overflowClipMargin) : 0;
    const left = rect.x + (number(style.borderLeftWidth) - margin) * sx;
    const top = rect.y + (number(style.borderTopWidth) - margin) * sy;
    const width = rect.width + (2 * margin - borderX) * sx
      - (parent.offsetWidth - parent.clientWidth - borderX) * sx;
    const height = rect.height + (2 * margin - borderY) * sy
      - (parent.offsetHeight - parent.clientHeight - borderY) * sy;
    area.left = Math.max(area.left, left);
    area.top = Math.max(area.top, top);
    area.right = Math.min(area.right, left + width);
    area.bottom = Math.min(area.bottom, top + height);
  }
  return area;
}

/** Размер не зависит от slide-анимации; clipping и scroll region повторяют useAlign. */
export function getTabsMoreArea(popup: HTMLElement) {
  const root = popup.ownerDocument.documentElement;
  const parents = scrollParents(popup);
  return {
    visible: clipArea(
      { left: 0, top: 0, right: root.clientWidth, bottom: root.clientHeight },
      parents
    ),
    scroll: clipArea({
      left: -root.scrollLeft,
      top: -root.scrollTop,
      right: root.scrollWidth - root.scrollLeft,
      bottom: root.scrollHeight - root.scrollTop
    }, parents)
  };
}

export function getTabsMorePosition(
  popup: HTMLElement,
  target: { left: number; top: number; width: number; height: number; },
  options: {
    placement: TabsMorePlacement;
    placements: TabsMorePlacements;
    align?: TabsMoreAlign;
    alignPoint?: boolean;
  },
  flips: PopupFlipCache,
  areas = getTabsMoreArea(popup)
) {
  const saved = ['left', 'top', 'right', 'bottom', 'overflow', 'overflow-x', 'overflow-y']
    .map(name => [name, popup.style.getPropertyValue(name), popup.style.getPropertyPriority(name)]);
  popup.style.left = '0';
  popup.style.top = '0';
  popup.style.right = 'auto';
  popup.style.bottom = 'auto';
  popup.style.overflow = 'hidden';
  const box = popup.getBoundingClientRect();
  const size = getTabsMoreSize(popup);
  const sx = Math.round(box.width / size.width * 1000) / 1000;
  const sy = Math.round(box.height / size.height * 1000) / 1000;
  popup.style.left = 'auto';
  popup.style.top = 'auto';
  popup.style.right = '0';
  popup.style.bottom = '0';
  const mirror = popup.getBoundingClientRect();
  for (const [name, value, priority] of saved) {
    if (value) popup.style.setProperty(name, value, priority);
    else popup.style.removeProperty(name);
  }
  const scaleX = Number.isNaN(sx) ? 1 : sx;
  const scaleY = Number.isNaN(sy) ? 1 : sy;
  if (!scaleX || !scaleY) return;

  return getPopupPosition({
    target,
    popup: box,
    mirror,
    ...areas,
    scaleX,
    scaleY,
    placements: options.placements,
    align: { ...options.placements[options.placement], ...options.align },
    alignPoint: options.alignPoint,
    flips
  });
}

/** Только ancestors/window, как useWatch; прокрутка самого popup не закрывает alignPoint. */
export function watchTabsMoreScroll(
  popup: HTMLElement,
  target: HTMLElement,
  callback: () => void
) {
  const view = popup.ownerDocument.defaultView!;
  const parents = new Set<EventTarget>([view, ...scrollParents(target), ...scrollParents(popup)]);
  for (const parent of parents) parent.addEventListener('scroll', callback, { passive: true });
  view.addEventListener('resize', callback, { passive: true });
  return () => {
    for (const parent of parents) parent.removeEventListener('scroll', callback);
    view.removeEventListener('resize', callback);
  };
}
