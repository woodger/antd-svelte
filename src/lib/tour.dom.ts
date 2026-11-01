import { getTourHighlight, type TourHighlight } from './tour.engine';
import { getTourAlignment, type TourArea, type TourFlipCache } from './tour-position.engine';
import type { TourGap, TourPlacement } from './tour.types';

export type TourAlignment = ReturnType<typeof getTourAlignment>;

interface TourLayoutOptions {
  target: HTMLElement | null;
  placement: TourPlacement;
  pointAtCenter: boolean;
  inline: boolean;
  parent?: HTMLElement;
  open?: boolean;
  gap?: TourGap;
  scrollIntoViewOptions: boolean | ScrollIntoViewOptions;
}

function number(value: string) {
  return Number.parseFloat(value) || 0;
}

function scrollParents(element: HTMLElement) {
  const parents: HTMLElement[] = [];
  const view = element.ownerDocument.defaultView!;
  let ancestor = element.parentElement;
  while (ancestor) {
    const style = view.getComputedStyle(ancestor);
    if ([style.overflow, style.overflowX, style.overflowY]
      .some(value => ['hidden', 'scroll', 'clip', 'auto'].includes(value))) {
      parents.push(ancestor);
    }
    ancestor = ancestor.parentElement;
  }
  return parents;
}

function visibleArea(element: HTMLElement): TourArea {
  const document = element.ownerDocument;
  const view = document.defaultView!;
  const result = {
    left: 0,
    top: 0,
    right: document.documentElement.clientWidth,
    bottom: document.documentElement.clientHeight
  };
  let ancestor = element.parentElement;
  while (ancestor) {
    const style = view.getComputedStyle(ancestor);
    if (ancestor !== document.body && ancestor !== document.documentElement
      && [style.overflow, style.overflowX, style.overflowY]
        .some(value => ['hidden', 'scroll', 'clip', 'auto'].includes(value))) {
      const box = ancestor.getBoundingClientRect();
      const scaleX = Math.round(box.width / ancestor.offsetWidth * 1000) / 1000 || 1;
      const scaleY = Math.round(box.height / ancestor.offsetHeight * 1000) / 1000 || 1;
      const borderX = number(style.borderLeftWidth) + number(style.borderRightWidth);
      const borderY = number(style.borderTopWidth) + number(style.borderBottomWidth);
      const scrollbarX = (ancestor.offsetWidth - ancestor.clientWidth - borderX) * scaleX;
      const scrollbarY = (ancestor.offsetHeight - ancestor.clientHeight - borderY) * scaleY;
      const margin = style.overflow === 'clip' ? number(style.overflowClipMargin) : 0;
      const left = box.x + (number(style.borderLeftWidth) - margin) * scaleX;
      const top = box.y + (number(style.borderTopWidth) - margin) * scaleY;
      const right = left + box.width + (margin * 2 - borderX) * scaleX - scrollbarX;
      const bottom = top + box.height + (margin * 2 - borderY) * scaleY - scrollbarY;
      result.left = Math.max(result.left, left);
      result.top = Math.max(result.top, top);
      result.right = Math.min(result.right, right);
      result.bottom = Math.min(result.bottom, bottom);
    }
    ancestor = ancestor.parentElement;
  }
  return result;
}

/** useTarget/useAlign: DOM measurement отделено от числового placement engine. */
export function connectTourLayout(
  popup: HTMLElement,
  placeholder: HTMLElement,
  onHighlight: (position: TourHighlight | null) => void,
  onAlign: (position: TourAlignment) => void
) {
  const view = popup.ownerDocument.defaultView!;
  let options: TourLayoutOptions | undefined;
  let flips: TourFlipCache = {};
  let active = true;
  let queued = false;
  const scrollers = new Set<HTMLElement>();

  function align() {
    if (!active || !options || !popup.isConnected || !placeholder.isConnected) return;
    const style = view.getComputedStyle(popup);
    const saved = ['left', 'top', 'right', 'bottom', 'overflow', 'overflow-x', 'overflow-y']
      .map(name => [
        name,
        popup.style.getPropertyValue(name),
        popup.style.getPropertyPriority(name)
      ]);
    const dummy = popup.ownerDocument.createElement('div');
    dummy.style.cssText = `position:${style.position};left:${popup.offsetLeft}px;top:${popup.offsetTop}px;width:${popup.offsetWidth}px;height:${popup.offsetHeight}px`;
    popup.parentElement?.append(dummy);
    popup.style.left = '0';
    popup.style.top = '0';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
    popup.style.overflow = 'hidden';
    const target = placeholder.getBoundingClientRect();
    const box = popup.getBoundingClientRect();
    const zero = view.getComputedStyle(popup);
    const measuredX = Math.round(box.width / Number.parseFloat(zero.width) * 1000) / 1000;
    const measuredY = Math.round(box.height / Number.parseFloat(zero.height) * 1000) / 1000;
    const scaleX = Number.isNaN(measuredX) ? 1 : measuredX;
    const scaleY = Number.isNaN(measuredY) ? 1 : measuredY;
    const visible = visibleArea(popup);
    popup.style.left = 'auto';
    popup.style.top = 'auto';
    popup.style.right = '0';
    popup.style.bottom = '0';
    const mirror = popup.getBoundingClientRect();
    for (const [name, value, priority] of saved) {
      if (value) popup.style.setProperty(name, value, priority);
      else popup.style.removeProperty(name);
    }
    dummy.remove();
    if (!scaleX || !scaleY || !placeholder.getClientRects().length) return;

    const sourceStyle = view.getComputedStyle(popup);
    function token(name: string, fallback: number) {
      const value = Number.parseFloat(sourceStyle.getPropertyValue(name));
      return Number.isNaN(value) ? fallback : value;
    }
    const result = getTourAlignment({
      target,
      popup: box,
      mirror,
      visible,
      scaleX,
      scaleY,
      placement: options.placement,
      pointAtCenter: options.pointAtCenter,
      arrowWidth: token('--ant-size-popup-arrow', 16),
      offset: token('--ant-margin-xxs', 4),
      radius: token('--ant-border-radius', 6),
      flips
    });
    flips = result.flips;
    onAlign(result);
  }

  function updateTarget() {
    if (!active || !options) return;
    const element = options.target;
    let highlight: TourHighlight | null = null;
    if (element) {
      let box = element.getBoundingClientRect();
      const inView = box.top >= 0 && box.left >= 0
        && box.right <= view.innerWidth && box.bottom <= view.innerHeight;
      if (!options.inline && !inView && options.open) {
        // rc-tour передаёт даже false в native scrollIntoView; defaultOpen не заменяет raw open.
        element.scrollIntoView(options.scrollIntoViewOptions);
        box = element.getBoundingClientRect();
      }
      const parent = options.inline ? options.parent?.getBoundingClientRect() : undefined;
      highlight = getTourHighlight({
        left: box.left - (parent?.left ?? 0),
        top: box.top - (parent?.top ?? 0),
        width: box.width,
        height: box.height
      }, options.gap);
    }
    placeholder.style.position = options.inline ? 'absolute' : 'fixed';
    placeholder.style.pointerEvents = 'none';
    placeholder.style.left = highlight ? `${highlight.left}px` : '50%';
    placeholder.style.top = highlight ? `${highlight.top}px` : '50%';
    placeholder.style.width = `${highlight?.width ?? 1}px`;
    placeholder.style.height = `${highlight?.height ?? 1}px`;
    onHighlight(highlight);
    align();
  }

  function scheduleAlign() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      align();
    });
  }

  function handleWindowChange() {
    updateTarget();
  }

  function watchScrollers() {
    for (const element of scrollers) element.removeEventListener('scroll', scheduleAlign);
    scrollers.clear();
    for (const element of [...scrollParents(popup), ...scrollParents(placeholder)]) {
      if (scrollers.has(element)) continue;
      scrollers.add(element);
      element.addEventListener('scroll', scheduleAlign, { passive: true });
    }
  }

  const observer = new view.ResizeObserver(scheduleAlign);
  observer.observe(popup);
  observer.observe(placeholder);
  view.addEventListener('resize', handleWindowChange);
  view.addEventListener('scroll', handleWindowChange);
  return {
    configure(next: TourLayoutOptions) {
      options = next;
      watchScrollers();
      updateTarget();
    },
    destroy() {
      active = false;
      observer.disconnect();
      for (const element of scrollers) element.removeEventListener('scroll', scheduleAlign);
      scrollers.clear();
      view.removeEventListener('resize', handleWindowChange);
      view.removeEventListener('scroll', handleWindowChange);
    }
  };
}

export function isTourEditableTarget(event: KeyboardEvent) {
  const element = event.target;
  return element instanceof HTMLElement
    && (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable);
}

export function getTourOffsetStyle(position: TourAlignment | undefined) {
  if (!position) return 'left:-1000vw;top:-1000vh;right:auto;bottom:auto';
  const points = position.align.points?.[0];
  const right = position.align.dynamicInset && points?.[1] === 'r';
  const bottom = position.align.dynamicInset && points?.[0] === 'b';
  return `${right ? `right:${position.right}px;left:auto` : `left:${position.x}px;right:auto`};`
    + (bottom ? `bottom:${position.bottom}px;top:auto` : `top:${position.y}px;bottom:auto`);
}

export { getPopupArrowStyle as getTourArrowStyle } from './popup-position.engine';
