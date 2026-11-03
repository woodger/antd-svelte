/** Как SelectInput: scrollWidth при width=0 измеряет текст без остатка flex-контейнера. */
export function measureCascaderInput(input: HTMLInputElement): number {
  const previous = { width: input.style.width, flex: input.style.flex };
  input.style.flex = 'none';
  input.style.width = '0px';
  const width = input.scrollWidth;
  input.style.width = previous.width;
  input.style.flex = previous.flex;
  return Math.max(4, width);
}

/** Ширина trigger живёт в CSS variable, чтобы popup styles могли перекрывать stretch. */
export function connectCascaderWidth(popup: HTMLElement, anchor: Element) {
  const view = anchor.ownerDocument.defaultView!;
  function update() {
    popup.style.setProperty('--cascader-anchor-width', `${anchor.getBoundingClientRect().width}px`);
  }
  const observer = new view.ResizeObserver(update);
  observer.observe(anchor);
  update();
  return () => observer.disconnect();
}

/** Измеряет теги rc-overflow; hidden теги сохраняют ширину, но не участвуют в flow. */
export function connectCascaderTags(host: HTMLElement, update: (count: number) => void) {
  const view = host.ownerDocument.defaultView!;
  let frame = 0;
  const tags = [...host.querySelectorAll<HTMLElement>('[data-cascader-tag]')];
  const rest = host.querySelector<HTMLElement>('[data-cascader-rest]');
  const input = host.querySelector<HTMLInputElement>('input');
  let previous = -1;

  function width(element: HTMLElement) {
    const style = view.getComputedStyle(element);
    return element.getBoundingClientRect().width
      + (parseFloat(style.marginInlineStart) || 0)
      + (parseFloat(style.marginInlineEnd) || 0);
  }
  function measure() {
    frame = 0;
    const available = host.clientWidth - (input ? measureCascaderInput(input) : 4);
    let used = 0;
    let count = tags.length;
    for (let index = 0; index < tags.length; index++) {
      used += width(tags[index]);
      if (used + (index < tags.length - 1 && rest ? width(rest) : 0) > available) {
        count = index;
        break;
      }
    }
    if (count !== previous) {
      previous = count;
      update(count);
    }
  }
  function schedule() {
    if (!frame) frame = view.requestAnimationFrame(measure);
  }
  const observer = new view.ResizeObserver(schedule);
  for (const element of [host, ...tags, rest, input])
    if (element) observer.observe(element);
  measure();
  return () => {
    observer.disconnect();
    if (frame) view.cancelAnimationFrame(frame);
  };
}
