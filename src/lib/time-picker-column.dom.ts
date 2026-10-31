import type { TimePickerOption } from './time-picker.engine';

/** Scroll alignment и delayed selection TimeColumn; каждый вызов владеет listeners/raf/timer. */
export function connectTimePickerColumn(
  column: HTMLUListElement,
  selected: number | 'am' | 'pm' | null,
  options: readonly TimePickerOption[],
  changeOnScroll: () => boolean | undefined,
  onChange: (value: TimePickerOption['value']) => void
): () => void {
  const view = column.ownerDocument.defaultView!;
  let frame = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let scrolling = false;
  let distance: number | null = null;
  let attempts = 0;
  let disposed = false;

  function stopScroll() {
    view.cancelAnimationFrame(frame);
    scrolling = false;
  }

  function clearDelay() {
    clearTimeout(timer);
    timer = undefined;
  }

  const first = column.querySelector<HTMLElement>('li');
  const target = selected === null ? null
    : column.querySelector<HTMLElement>(`[data-value="${selected}"]`);

  function align() {
    stopScroll();
    if (disposed || !first || !target) return;

    scrolling = true;
    attempts++;
    const targetTop = target.offsetTop - first.offsetTop;

    if (target.offsetTop === 0 && target !== first || !column.getClientRects().length) {
      if (attempts <= 5) frame = view.requestAnimationFrame(align);
      return;
    }

    const next = column.scrollTop + (targetTop - column.scrollTop) / 3;
    const nextDistance = Math.abs(targetTop - next);

    if (distance !== null && distance < nextDistance) {
      stopScroll();
      return;
    }

    distance = nextDistance;

    if (nextDistance <= 1) {
      column.scrollTop = targetTop;
      stopScroll();
      return;
    }

    column.scrollTop = next;
    frame = view.requestAnimationFrame(align);
  }

  function handleScroll() {
    clearDelay();
    if (scrolling || !changeOnScroll()) return;

    timer = setTimeout(() => {
      timer = undefined;
      if (disposed) return;

      const items = [...column.querySelectorAll<HTMLElement>('li')];
      const first = items[0];
      if (!first) return;

      let minimum = Number.MAX_SAFE_INTEGER;
      let nearest: TimePickerOption | undefined;

      for (let index = 0; index < items.length; index++) {
        const option = options[index];
        if (!option || option.disabled) continue;

        const distance = Math.abs(items[index].offsetTop - first.offsetTop - column.scrollTop);

        if (distance < minimum) {
          minimum = distance;
          nearest = option;
        }
      }

      if (nearest) onChange(nearest.value);
    }, 300);
  }

  column.addEventListener('scroll', handleScroll);
  align();

  return () => {
    disposed = true;
    stopScroll();
    clearDelay();
    column.removeEventListener('scroll', handleScroll);
  };
}
