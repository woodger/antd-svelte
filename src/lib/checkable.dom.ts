/** Label создаёт второй input click; bubble lock rc-checkbox оставляет один внешний click. */
export function createCheckableClickLock() {
  let view: Window | null = null;
  let frame: number | undefined;

  function clear() {
    if (frame !== undefined) view?.cancelAnimationFrame(frame);
    frame = undefined;
  }

  return {
    label(event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement; }) {
      clear();
      view = event.currentTarget.ownerDocument.defaultView;
      frame = view?.requestAnimationFrame(() => { frame = undefined; });
    },
    input(event: MouseEvent) {
      if (frame === undefined) return;

      event.stopPropagation();
      clear();
    },
    destroy: clear
  };
}
