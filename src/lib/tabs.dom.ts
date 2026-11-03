import type { TabsIndicatorOffset } from './tabs-indicator.engine';
import type { TabsScrollInfo } from './tabs.types';

/** Публичный native onTabClick сохраняет MouseEvent и при вызове из custom tab bar. */
export function getTabsClickEvent(
  event: MouseEvent | KeyboardEvent,
  root: HTMLElement | undefined
): MouseEvent | undefined {
  if (!('key' in event)) return event;

  const view = root?.ownerDocument.defaultView;
  if (!view) return undefined;

  const click = new view.MouseEvent('click', {
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    view
  });
  Object.defineProperties(click, {
    target: { get: () => event.target },
    currentTarget: { get: () => event.currentTarget }
  });
  click.getModifierState = event.getModifierState.bind(event);
  // DOM-методам нужен собственный Event receiver; отмена затрагивает и исходную клавиатуру.
  for (const method of ['preventDefault', 'stopPropagation', 'stopImmediatePropagation'] as const) {
    const original = click[method].bind(click);
    click[method] = () => {
      original();
      event[method]();
    };
  }
  if (event.defaultPrevented) click.preventDefault();

  return click;
}

export function revealTab(viewport: HTMLElement, tab: HTMLElement, vertical: boolean) {
  const view = viewport.getBoundingClientRect();
  const bounds = tab.getBoundingClientRect();

  if (vertical) {
    if (bounds.height > view.height || bounds.top < view.top)
      viewport.scrollTop += bounds.top - view.top;
    else if (bounds.bottom > view.bottom)
      viewport.scrollTop += bounds.bottom - view.bottom;
  } else {
    if (bounds.width > view.width) {
      const rtl = viewport
        .ownerDocument
        .defaultView!
        .getComputedStyle(viewport)
        .direction === 'rtl';
      viewport.scrollLeft += rtl ? bounds.right - view.right : bounds.left - view.left;
    } else if (bounds.left < view.left)
      viewport.scrollLeft += bounds.left - view.left;
    else if (bounds.right > view.right)
      viewport.scrollLeft += bounds.right - view.right;
  }
}

export function connectTabsNav(
  root: HTMLElement,
  viewport: HTMLElement,
  list: HTMLElement,
  options: {
    key: string | undefined;
    vertical: boolean;
    measureCells: boolean;
    onIndicatorChange: (offset: TabsIndicatorOffset | undefined) => void;
  }
): () => void {
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const selected = tabs.find((tab) => tab.dataset.tabsKey === options.key);
  let previous: string | undefined;

  function update() {
    let offset: TabsIndicatorOffset | undefined;
    if (selected) {
      const listBox = list.getBoundingClientRect();
      function measure(tab: HTMLElement) {
        const cell = options.measureCells
          ? tab.closest<HTMLElement>('[data-tabs-cell]') ?? tab : tab;
        const box = cell.getBoundingClientRect();
        return Math.abs(box.width - cell.offsetWidth) < 1 ? {
          width: box.width,
          height: box.height,
          left: box.left - listBox.left,
          top: box.top - listBox.top
        } : {
          width: cell.offsetWidth,
          height: cell.offsetHeight,
          left: cell.offsetLeft,
          top: cell.offsetTop
        };
      }
      const first = measure(tabs[0]);
      const current = measure(selected);
      offset = {
        ...current,
        right: first.left + first.width - current.left - current.width
      };
    }

    const next = JSON.stringify(offset ?? null);
    if (next !== previous) {
      previous = next;
      options.onIndicatorChange(offset);
    }
  }

  function reveal() {
    const focused = list.ownerDocument.activeElement;
    let control: HTMLElement | undefined = selected;
    if (focused instanceof list.ownerDocument.defaultView!.HTMLElement
      && list.contains(focused)
      && focused.matches('[role="tab"]:not(:disabled), .ant-tabs-tab-remove, .ant-tabs-nav-add')) {
      control = focused.closest<HTMLElement>('[data-tabs-cell]') ?? focused;
    }
    if (control) revealTab(viewport, control, options.vertical);
  }

  update();
  reveal();
  const resize = new ResizeObserver(() => {
    update();
    reveal();
  });
  resize.observe(viewport);
  resize.observe(list);
  for (const tab of tabs)
    resize.observe(tab);

  const attributes = new MutationObserver(records => {
    // Svelte может повторно записать тот же class при переносе фокуса в More.
    if (!records.some(record => record.oldValue !== root.getAttribute(record.attributeName!)))
      return;

    update();
    reveal();
  });
  attributes.observe(root, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class', 'dir']
  });

  return () => {
    resize.disconnect();
    attributes.disconnect();
  };
}

/** Сохраняет native scroll; React transform имеет противоположный знак на той же физической оси. */
export function connectTabsScroll(
  viewport: HTMLElement,
  vertical: boolean,
  onScroll: (info: TabsScrollInfo) => void
): () => void {
  let previous = vertical ? viewport.scrollTop : viewport.scrollLeft;

  function handleScroll() {
    const next = vertical ? viewport.scrollTop : viewport.scrollLeft;
    if (next === previous) return;

    const direction = vertical ? next > previous ? 'bottom' : 'top'
      : next > previous ? 'right' : 'left';
    previous = next;
    onScroll({ direction });
  }

  viewport.addEventListener('scroll', handleScroll, { passive: true });
  return () => viewport.removeEventListener('scroll', handleScroll);
}
