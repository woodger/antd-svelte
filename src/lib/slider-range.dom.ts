/** Pointer listeners экземпляра; отмена и уничтожение не вызывают завершение действия. */
export function connectSliderRangeDrag(
  node: HTMLElement,
  start: PointerEvent,
  move: (event: PointerEvent) => void,
  finish: (event: PointerEvent) => void,
  cancel: () => void
) {
  const document = node.ownerDocument;
  let active = true;
  function cleanup() {
    if (!active) return;
    active = false;
    document.removeEventListener('pointermove', handleMove);
    document.removeEventListener('pointerup', handleEnd);
    document.removeEventListener('pointercancel', handleCancel);
    if (node.hasPointerCapture(start.pointerId)) node.releasePointerCapture(start.pointerId);
  }
  function handleMove(event: PointerEvent) {
    if (event.pointerId !== start.pointerId) return;
    event.preventDefault();
    move(event);
  }
  function handleEnd(event: PointerEvent) {
    if (event.pointerId !== start.pointerId) return;
    event.preventDefault();
    cleanup();
    finish(event);
  }
  function handleCancel(event: PointerEvent) {
    if (event.pointerId !== start.pointerId) return;
    cleanup();
    cancel();
  }
  document.addEventListener('pointermove', handleMove, { passive: false });
  document.addEventListener('pointerup', handleEnd);
  document.addEventListener('pointercancel', handleCancel);
  // DispatchEvent не создаёт активный native pointer для setPointerCapture.
  if (start.isTrusted) node.setPointerCapture(start.pointerId);
  return cleanup;
}

/** Нативный range даёт semantics/forms; touch-геометрией управляет общий drag, как у rc-slider. */
export function connectSliderRangeInput(
  node: HTMLInputElement,
  handlers: {
    start: (event: TouchEvent & { currentTarget: HTMLInputElement; }) => void;
    move: (event: TouchEvent & { currentTarget: HTMLInputElement; }) => void;
  }
) {
  function handleStart(event: TouchEvent) {
    handlers.start(event as TouchEvent & { currentTarget: HTMLInputElement; });
    event.preventDefault();
  }
  function handleMove(event: TouchEvent) {
    handlers.move(event as TouchEvent & { currentTarget: HTMLInputElement; });
    event.preventDefault();
  }
  node.addEventListener('touchstart', handleStart, { passive: false });
  node.addEventListener('touchmove', handleMove, { passive: false });
  return () => {
    node.removeEventListener('touchstart', handleStart);
    node.removeEventListener('touchmove', handleMove);
  };
}
