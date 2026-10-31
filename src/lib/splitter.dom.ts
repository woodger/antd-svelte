import { getSplitterPreviewOffset } from './splitter.engine';

/** Повторяет округление и microtask delivery @rc-component/resize-observer 1.1.2. */
export function observeSplitterSize(
  root: HTMLDivElement,
  getVertical: () => boolean,
  publish: (size: number) => void
) {
  const view = root.ownerDocument.defaultView!;
  let active = true;
  let previous: number[] = [-1, -1, -1, -1];
  const observer = new view.ResizeObserver(() => {
    if (!active) return;

    const { width, height } = root.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = root;
    const next = [Math.floor(width), Math.floor(height), offsetWidth, offsetHeight];

    if (next.every((value, index) => value === previous[index])) return;

    previous = next;
    const measuredWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
    const measuredHeight = offsetHeight === Math.round(height) ? height : offsetHeight;

    void Promise.resolve().then(() => {
      if (active)
        publish(getVertical() ? measuredHeight : measuredWidth);
    });
  });
  observer.observe(root);

  return () => {
    active = false;
    observer.disconnect();
  };
}

export interface SplitterDragOptions {
  index: number;
  vertical: boolean;
  reverse: boolean;
  lazy: boolean;
  resizable: boolean;
  container: number;
  now: number;
  min: number;
  max: number;
}

export interface SplitterDragCallbacks {
  start: (index: number) => void;
  update: (index: number, offset: number, lazyEnd: boolean) => void;
  end: (lazyEnd: boolean) => void;
  preview: (offset: number) => void;
  doubleClick: (index: number) => void;
}

export function connectSplitterDrag(
  node: HTMLDivElement,
  getOptions: () => SplitterDragOptions,
  callbacks: SplitterDragCallbacks
) {
  const view = node.ownerDocument.defaultView!;
  let active = true;
  let start: readonly [number, number] | undefined;
  let captured: SplitterDragOptions | undefined;
  let preview = 0;
  let lastClick = 0;

  function move(x: number, y: number) {
    if (!active || !start || !captured) return;

    const dx = x - start[0];
    const dy = y - start[1];

    if (captured.lazy) {
      const current = getOptions();
      preview = getSplitterPreviewOffset(
        current.container,
        current.now,
        current.min,
        current.max,
        current.vertical ? dy : dx
      );
      callbacks.preview(preview);
    } else {
      const offset = captured.vertical ? dy : dx;
      callbacks.update(captured.index, captured.reverse ? -offset : offset, false);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    move(event.pageX, event.pageY);
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 1)
      move(event.touches[0].pageX, event.touches[0].pageY);
  }

  function detach() {
    view.removeEventListener('mousemove', handleMouseMove);
    view.removeEventListener('mouseup', finish);
    view.removeEventListener('touchmove', handleTouchMove);
    view.removeEventListener('touchend', finish);
  }

  function finish() {
    if (!active || !start || !captured) return;

    if (captured.lazy) {
      const current = getOptions();
      callbacks.update(current.index, current.reverse ? -preview : preview, true);
      preview = 0;
      callbacks.preview(0);
      callbacks.end(true);
    } else {
      callbacks.end(false);
    }

    start = undefined;
    detach();
  }

  function attach() {
    captured = { ...getOptions() };
    view.addEventListener('mousemove', handleMouseMove);
    view.addEventListener('mouseup', finish);
    view.addEventListener('touchmove', handleTouchMove);
    view.addEventListener('touchend', finish);
  }

  function begin(x: number, y: number) {
    const options = getOptions();

    if (!active || !options.resizable) return;

    detach();
    start = [x, y];
    callbacks.start(options.index);

    if (active && start)
      attach();
  }

  function handleMouseDown(event: MouseEvent) {
    event.stopPropagation();

    const now = Date.now();
    const gap = now - lastClick;

    if (gap > 0 && gap < 300) return;

    lastClick = now;
    begin(event.pageX, event.pageY);
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1)
      begin(event.touches[0].pageX, event.touches[0].pageY);
  }

  function handleDoubleClick() {
    if (active)
      callbacks.doubleClick(getOptions().index);
  }

  node.addEventListener('mousedown', handleMouseDown);
  node.addEventListener('touchstart', handleTouchStart);
  node.addEventListener('dblclick', handleDoubleClick);

  return {
    sync(index: number, lazy: boolean) {
      if (active && start && captured
        && (captured.index !== index || captured.lazy !== lazy)) {
        detach();
        attach();
      }
    },
    destroy() {
      active = false;
      start = undefined;
      detach();
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('dblclick', handleDoubleClick);
    }
  };
}
