import { getTabsVisibleRange } from './tabs-overflow.engine';

function sizeOf(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return Math.abs(rect.width - element.offsetWidth) < 1
    ? { width: rect.width, height: rect.height }
    : { width: element.offsetWidth, height: element.offsetHeight };
}

function move(element: HTMLElement, parent: HTMLElement, before: ChildNode | null) {
  if (element.parentNode === parent && element.nextSibling === before) return;

  const focused = element.ownerDocument.activeElement === element;
  if (typeof parent.moveBefore === 'function' && element.isConnected && parent.isConnected) {
    parent.moveBefore(element, before);
  } else {
    parent.insertBefore(element, before);
    if (focused && element.isConnected) element.focus({ preventScroll: true });
  }
}

/** Сохраняет native scroll и единственный Add; placeholder повторяет скрытый inner Add rc-tabs. */
export function connectTabsOverflow(
  viewport: HTMLElement,
  list: HTMLElement,
  operations: HTMLElement,
  add: HTMLButtonElement | undefined,
  options: { vertical: boolean; rtl?: boolean; onChange: (keys: string[]) => void; }
): () => void {
  const document = list.ownerDocument;
  const view = document.defaultView!;
  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
  const cells = tabs.map(tab => tab.closest<HTMLElement>('[data-tabs-cell]') ?? tab);
  const marker = add ? document.createComment('tabs-add') : undefined;
  const placeholder = add ? document.createElement('span') : undefined;
  if (marker && placeholder && add) {
    add.before(marker, placeholder);
    placeholder.hidden = true;
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.inert = true;
  }
  let previous: string[] | undefined;
  let disposed = false;

  function positionAdd(overflow: boolean) {
    if (!add?.isConnected || !marker?.parentElement || !placeholder) return;

    if (overflow && add.parentElement !== operations) {
      const box = sizeOf(add);
      const style = view.getComputedStyle(add);
      placeholder.style.cssText = `display:block;box-sizing:border-box;flex:none;visibility:hidden;width:${options.vertical ? 'auto' : `${box.width}px`};height:${options.vertical ? `${box.height}px` : 'auto'};margin:${style.marginTop} ${style.marginRight} ${style.marginBottom} ${style.marginLeft}`;
      placeholder.hidden = false;
      add.classList.add('ant-tabs-add-in-operations');
      add.setAttribute('data-tabs-add-in-operations', '');
      move(add, operations, null);
    } else if (!overflow && add.parentElement === operations) {
      add.classList.remove('ant-tabs-add-in-operations');
      add.removeAttribute('data-tabs-add-in-operations');
      move(add, marker.parentElement, marker.nextSibling);
      placeholder.hidden = true;
      placeholder.style.display = 'none';
    } else if (overflow) {
      const box = sizeOf(add);
      // Поперечная ось растягивается в list; размеры operations не должны расширять заглушку.
      if (options.vertical) placeholder.style.height = `${box.height}px`;
      else placeholder.style.width = `${box.width}px`;
    }
  }

  function update() {
    if (disposed) return;

    const vertical = options.vertical;
    const unit = vertical ? 'height' : 'width';
    const hidden = operations.hasAttribute('data-tabs-operations-hidden');
    const operationLength = sizeOf(operations)[unit]
      + (add && add.parentElement !== operations ? sizeOf(add)[unit] : 0);
    const available = sizeOf(viewport)[unit] + (hidden ? 0 : sizeOf(operations)[unit]);
    const addLength = add ? sizeOf(add)[unit] : 0;
    const fullLength = sizeOf(list)[unit];
    const contentLength = fullLength - addLength;
    const needScroll = Math.floor(available) < Math.floor(fullLength);
    const visibleLength = available - (needScroll ? operationLength : addLength);
    const rtl = !vertical && (options.rtl ?? view.getComputedStyle(viewport).direction === 'rtl');
    const current = vertical ? viewport.scrollTop : Math.abs(viewport.scrollLeft);
    const scroll = Math.max(0, Math.min(current, contentLength - visibleLength));
    if (scroll !== current) {
      if (vertical) viewport.scrollTop = scroll;
      else viewport.scrollLeft = rtl ? -scroll : scroll;
    }
    const listBox = list.getBoundingClientRect();
    const right = cells[0]?.getBoundingClientRect().right ?? listBox.right;
    const offsets = cells.map((cell, index) => {
      const box = cell.getBoundingClientRect();
      return {
        key: tabs[index].dataset.tabsKey!,
        start: vertical ? box.top - listBox.top
          : rtl ? right - box.right : box.left - listBox.left,
        size: sizeOf(cell)[unit]
      };
    });
    const [start, end] = getTabsVisibleRange(offsets, visibleLength, scroll);
    const keys = offsets.filter((_, index) => index < start || index > end).map(tab => tab.key);
    positionAdd(keys.length > 0);
    if (!previous || keys.length !== previous.length
      || keys.some((key, index) => key !== previous![index])) {
      previous = keys;
      options.onChange(keys);
    }
  }

  update();
  const resize = new view.ResizeObserver(update);
  for (const element of [viewport, list, operations, ...cells, ...(add ? [add] : [])]) {
    resize.observe(element);
  }
  const attributes = new view.MutationObserver(update);
  attributes.observe(list.closest('[data-ant-tabs-root]')!, {
    attributes: true,
    attributeFilter: ['class', 'dir', 'style']
  });
  viewport.addEventListener('scroll', update, { passive: true });

  return () => {
    disposed = true;
    resize.disconnect();
    attributes.disconnect();
    viewport.removeEventListener('scroll', update);
    positionAdd(false);
    placeholder?.remove();
    marker?.remove();
  };
}
