import { listyTag } from './listy.engine';
import type { ListyScrollToConfig } from './listy.types';
export { measureVirtualListRow as measureListyRow } from './virtual-list.dom';

export function scrollRawListy(
  holder: HTMLDivElement,
  config: ListyScrollToConfig | undefined,
  prefix: string,
  stickyGroup: boolean
) {
  if (config == null) return;
  if (typeof config === 'number') {
    holder.scrollTop = config;
    return;
  }

  if ('key' in config || 'groupKey' in config) {
    const isItem = 'key' in config;
    const key = isItem ? listyTag(config.key, 'item') : listyTag(config.groupKey, 'group');
    const css = holder.ownerDocument.defaultView?.CSS;
    if (!css) return;
    const target = holder.querySelector<HTMLElement>(`[data-key="${css.escape(key)}"]`);
    if (!target) return;

    const { align = 'auto', offset = 0 } = config;
    let headerHeight = 0;
    if (stickyGroup && isItem && align !== 'bottom') {
      const section = target.closest(`.${css.escape(`${prefix}-group-section`)}`);
      const header = section?.querySelector<HTMLElement>(
        `.${css.escape(`${prefix}-group-header`)}`
      );
      if (header) {
        const rect = header.getBoundingClientRect();
        const height = rect.height || rect.bottom - rect.top || header.offsetHeight;
        if (Number.isFinite(height)) headerHeight = height;
      }
    }

    const top = target.style.scrollMarginTop;
    const bottom = target.style.scrollMarginBottom;
    target.style.scrollMarginTop = `${headerHeight + offset}px`;
    target.style.scrollMarginBottom = `${offset}px`;
    try {
      target.scrollIntoView({
        block: align === 'bottom' ? 'end' : align === 'auto' ? 'nearest' : 'start',
        inline: 'nearest'
      });
    } finally {
      target.style.scrollMarginTop = top;
      target.style.scrollMarginBottom = bottom;
    }
    return;
  }

  if (config.left !== undefined) holder.scrollLeft = config.left;
  if (config.top !== undefined) holder.scrollTop = config.top;
}

/** Перемещение keyed DOM может сбросить native focus; React восстанавливает его при commit. */
export function captureListyFocus(root: HTMLDivElement) {
  const document = root.ownerDocument;
  const view = document.defaultView;
  const focused = document.activeElement;
  if (!view || !(focused instanceof view.HTMLElement) || !root.contains(focused)) return;
  const input = focused instanceof view.HTMLInputElement || focused instanceof view.HTMLTextAreaElement
    ? focused : undefined;
  const start = input?.selectionStart;
  const end = input?.selectionEnd;
  const direction = input?.selectionDirection;
  const selection = focused.isContentEditable ? document.getSelection() : undefined;
  const range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : undefined;

  return () => {
    if (!focused.isConnected || !root.contains(focused)
      || document.activeElement !== document.body && document.activeElement !== focused) return;
    focused.focus({ preventScroll: true });
    if (input && start != null && end != null) input.setSelectionRange(start, end, direction ?? undefined);
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };
}
