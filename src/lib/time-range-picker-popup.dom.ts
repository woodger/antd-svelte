/** Range Popup rc-picker: offset узкой time panel и стрелки относительно активного input. */
export function connectTimeRangePopup(
  root: HTMLElement,
  wrapper: HTMLElement,
  container: HTMLElement,
  activeInput: () => HTMLInputElement | undefined,
  rtl: () => boolean,
  onPosition: (arrow: number, offset: number) => void
) {
  const view = root.ownerDocument.defaultView!;
  let frame = 0;
  let disposed = false;
  let previous = '';

  function update() {
    if (disposed) return;
    const input = activeInput();
    if (input) {
      const inputRect = input.parentElement!.getBoundingClientRect();
      const bounds = wrapper.getBoundingClientRect();
      const panelWidth = container.getBoundingClientRect().width;
      const arrowWidth = wrapper.querySelector<HTMLElement>('.ant-picker-range-arrow')!.offsetWidth;
      const selectorWidth = root.getBoundingClientRect().width;
      const rightToLeft = rtl();
      const arrow = (rightToLeft ? inputRect.right - arrowWidth : inputRect.left) - bounds.left;
      const offset = panelWidth && panelWidth < selectorWidth ? Math.max(0, rightToLeft
        ? bounds.right - (inputRect.right - arrowWidth + panelWidth)
        : inputRect.left + arrowWidth - bounds.left - panelWidth) : 0;
      const signature = `${arrow}:${offset}`;

      if (signature !== previous) {
        previous = signature;
        onPosition(arrow, offset);
      }
    }
    frame = view.requestAnimationFrame(update);
  }

  update();
  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
  };
}
