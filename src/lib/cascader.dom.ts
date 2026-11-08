import { connectSelectTagOverflow } from './select-tag-overflow.dom';
export { measureSelectInput as measureCascaderInput } from './select-tag-overflow.dom';

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
  return connectSelectTagOverflow(host, update, {
    tag: '[data-cascader-tag]', rest: '[data-cascader-rest]'
  });
}
