interface WheelInput {
  deltaX: number;
  deltaY: number;
  shiftKey?: boolean;
  _virtualHandled?: boolean;
  preventDefault: () => void;
}

interface ListyGestureOptions {
  useVirtual: boolean;
  virtual: boolean;
  top: () => number;
  maximum: () => number;
  scrollBy: (delta: number) => void;
  horizontal?: boolean;
  rtl?: boolean;
  left?: () => number;
  maximumX?: () => number;
  scrollByX?: (delta: number) => void;
}

/** Native wheel/touch нужны для passive:false и передачи жеста внешнему scroll container. */
export function connectListyGestures(holder: HTMLDivElement, options: ListyGestureOptions) {
  const view = holder.ownerDocument.defaultView;
  if (!view) return () => {};
  const document = holder.ownerDocument;
  const firefox = view.navigator.userAgent.includes('Firefox');
  const cleanups: (() => void)[] = [];

  function originScroll() {
    let locked = false;
    let timer: number | undefined;
    cleanups.push(() => view!.clearTimeout(timer));
    return (horizontal: boolean, delta: number, smooth = false) => {
      const horizontalDelta = options.rtl ? -delta : delta;
      const boundary = horizontal
        ? options.horizontal
          ? horizontalDelta < 0 && (options.left?.() ?? 0) <= 0
            || horizontalDelta > 0 && (options.left?.() ?? 0) >= (options.maximumX?.() ?? 0)
          : delta !== 0
        : delta < 0 && options.top() <= 0 || delta > 0 && options.top() >= options.maximum();
      if (smooth && boundary) {
        view!.clearTimeout(timer);
        locked = false;
      } else if (!boundary || locked) {
        view!.clearTimeout(timer);
        locked = true;
        timer = view!.setTimeout(() => { locked = false; }, 50);
      }
      return boundary && !locked;
    };
  }

  const wheelOrigin = originScroll();
  const touchOrigin = originScroll();
  let offset = 0;
  let frame = 0;
  let directionFrame = 0;
  let direction: 'y' | 'x' | 'sx' | undefined;
  let lastWheel: number | undefined;
  let mouseScroll = false;

  function handleWheel(event: WheelInput) {
    if (!options.useVirtual) return;
    view!.cancelAnimationFrame(directionFrame);
    directionFrame = view!.requestAnimationFrame(() => {
      directionFrame = view!.requestAnimationFrame(() => { direction = undefined; });
    });
    const horizontal = direction === 'sx'
      || !direction && event.shiftKey && event.deltaY && !event.deltaX;
    if (horizontal) direction = 'sx';
    direction ??= options.horizontal && Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'x' : 'y';
    if (direction !== 'y') {
      options.scrollByX?.(direction === 'sx' ? event.deltaY : event.deltaX);
      if (!firefox) event.preventDefault();
      return;
    }

    view!.cancelAnimationFrame(frame);
    if (wheelOrigin(false, event.deltaY) || event._virtualHandled) return;
    event._virtualHandled = true;
    offset += event.deltaY;
    lastWheel = event.deltaY;
    if (!firefox) event.preventDefault();
    frame = view!.requestAnimationFrame(() => {
      options.scrollBy(offset * (mouseScroll ? 10 : 1));
      offset = 0;
    });
  }

  function handleFirefox(event: Event) {
    if (options.useVirtual && 'detail' in event) mouseScroll = event.detail === lastWheel;
  }

  function handleMozPixel(event: Event) {
    if (!options.useVirtual || !('detail' in event) || typeof event.detail !== 'number') return;
    const boundary = options.top() <= 0 && event.detail < 0
      || options.top() >= options.maximum() && event.detail > 0;
    if (!boundary) event.preventDefault();
  }

  holder.addEventListener('wheel', handleWheel, { passive: false });
  holder.addEventListener('DOMMouseScroll', handleFirefox, { passive: true });
  holder.addEventListener('MozMousePixelScroll', handleMozPixel, { passive: false });

  let touched = false;
  let touchX = 0;
  let touchY = 0;
  let target: EventTarget | null = null;
  let interval: number | undefined;

  function cleanTouch() {
    target?.removeEventListener('touchmove', handleTouchMove);
    target?.removeEventListener('touchend', handleTouchEnd);
    target?.removeEventListener('touchcancel', handleTouchEnd);
    target = null;
  }

  function moveTouch(horizontal: boolean, delta: number, smooth: boolean, event?: TouchEvent) {
    if (touchOrigin(horizontal, delta, smooth)) return false;
    const marked = event as (TouchEvent & { _virtualHandled?: boolean; }) | undefined;
    if (marked?._virtualHandled) return false;
    if (marked) marked._virtualHandled = true;
    handleWheel({
      deltaX: horizontal ? delta : 0,
      deltaY: horizontal ? 0 : delta,
      preventDefault() {}
    });
    return true;
  }

  function handleTouchMove(raw: Event) {
    const event = raw as TouchEvent;
    if (!touched || !event.touches.length) return;
    const currentX = Math.ceil(event.touches[0].pageX);
    const currentY = Math.ceil(event.touches[0].pageY);
    let deltaX = touchX - currentX;
    let deltaY = touchY - currentY;
    const horizontal = Math.abs(deltaX) > Math.abs(deltaY);
    if (horizontal) touchX = currentX;
    else touchY = currentY;
    const handled = moveTouch(horizontal, horizontal ? deltaX : deltaY, false, event);
    if (handled) event.preventDefault();
    view!.clearInterval(interval);
    if (handled) {
      interval = view!.setInterval(() => {
        if (horizontal) deltaX *= 14 / 15;
        else deltaY *= 14 / 15;
        const delta = Math.floor(horizontal ? deltaX : deltaY);
        if (!moveTouch(horizontal, delta, true) || Math.abs(delta) <= 0.1) {
          view!.clearInterval(interval);
        }
      }, 16);
    }
  }

  function handleTouchEnd() {
    touched = false;
    cleanTouch();
  }

  function handleTouchStart(event: TouchEvent) {
    if (!options.useVirtual) return;
    cleanTouch();
    if (event.touches.length !== 1 || touched) return;
    touched = true;
    touchX = Math.ceil(event.touches[0].pageX);
    touchY = Math.ceil(event.touches[0].pageY);
    target = event.target;
    target?.addEventListener('touchmove', handleTouchMove, { passive: false });
    target?.addEventListener('touchend', handleTouchEnd, { passive: true });
    target?.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  }

  holder.addEventListener('touchstart', handleTouchStart, { passive: true });

  let mouseDown = false;
  let dragFrame = 0;
  let dragOffset = 0;

  function stopDrag() {
    mouseDown = false;
    view!.cancelAnimationFrame(dragFrame);
  }

  function continueDrag() {
    view!.cancelAnimationFrame(dragFrame);
    dragFrame = view!.requestAnimationFrame(() => {
      options.scrollBy(dragOffset);
      continueDrag();
    });
  }

  function handleMouseDown(event: MouseEvent & { _virtualHandled?: boolean; }) {
    const target = event.target;
    if (!options.virtual || event.button !== 0 || event._virtualHandled
      || target instanceof view!.HTMLElement && target.draggable) return;
    event._virtualHandled = true;
    mouseDown = true;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!mouseDown) return;
    const y = event.pageY - view!.scrollY;
    const rect = holder.getBoundingClientRect();
    if (y <= rect.top) {
      dragOffset = -Math.floor(Math.sqrt(rect.top - y));
      continueDrag();
    } else if (y >= rect.bottom) {
      dragOffset = Math.floor(Math.sqrt(y - rect.bottom));
      continueDrag();
    } else view!.cancelAnimationFrame(dragFrame);
  }

  holder.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('dragend', stopDrag);

  return () => {
    holder.removeEventListener('wheel', handleWheel);
    holder.removeEventListener('DOMMouseScroll', handleFirefox);
    holder.removeEventListener('MozMousePixelScroll', handleMozPixel);
    holder.removeEventListener('touchstart', handleTouchStart);
    holder.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('dragend', stopDrag);
    view.cancelAnimationFrame(frame);
    view.cancelAnimationFrame(directionFrame);
    view.clearInterval(interval);
    stopDrag();
    cleanTouch();
    cleanups.forEach(cleanup => cleanup());
  };
}
