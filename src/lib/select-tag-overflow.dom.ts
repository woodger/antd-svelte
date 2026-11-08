import { getResponsiveTagCount } from './select-tag-overflow.engine';

/** Как SelectInput: scrollWidth при width=0 измеряет текст без остатка flex-контейнера. */
export function measureSelectInput(input: HTMLInputElement): number {
  const previous = { width: input.style.width, flex: input.style.flex };
  input.style.flex = 'none';
  input.style.width = '0px';
  const width = input.scrollWidth;
  input.style.width = previous.width;
  input.style.flex = previous.flex;
  return Math.max(4, width);
}

/** Hidden tags измеряются вне flow; observer/RAF принадлежат экземпляру компонента. */
export function connectSelectTagOverflow(
  host: HTMLElement,
  update: (count: number) => void,
  selectors = {
    tag: ':scope > [data-select-tag]',
    rest: ':scope > [data-select-rest]',
    input: ':scope > input'
  }
) {
  const view = host.ownerDocument.defaultView!;
  const tags = [...host.querySelectorAll<HTMLElement>(selectors.tag)];
  const rest = host.querySelector<HTMLElement>(selectors.rest);
  const input = host.querySelector<HTMLInputElement>(selectors.input);
  let frame = 0;
  let previous = -1;

  function width(element: HTMLElement) {
    const style = view.getComputedStyle(element);
    return element.getBoundingClientRect().width
      + (parseFloat(style.marginInlineStart) || 0)
      + (parseFloat(style.marginInlineEnd) || 0);
  }
  function measure() {
    frame = 0;
    const available = host.clientWidth - (input ? measureSelectInput(input) : 4);
    const count = getResponsiveTagCount(tags.map(width), available, rest ? width(rest) : 0);
    if (count !== previous) {
      previous = count;
      update(count);
    }
  }
  function schedule() {
    if (!frame) frame = view.requestAnimationFrame(measure);
  }
  const observer = new view.ResizeObserver(schedule);
  for (const element of [host, ...tags, rest, input]) {
    if (element) observer.observe(element);
  }
  measure();
  return () => {
    observer.disconnect();
    if (frame) view.cancelAnimationFrame(frame);
  };
}
