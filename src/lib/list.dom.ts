/** Измеряет только диапазон children; actions и extra не влияют на mixed-text layout. */
export function connectListItemText(element: HTMLElement, publish: (mixed: boolean) => void) {
  function update() {
    let active = false;
    let count = 0;
    let text = false;
    for (const node of element.childNodes) {
      if (node.nodeType === 8 && node.textContent === 'ant-list-children-start') {
        active = true;
        continue;
      }
      if (node.nodeType === 8 && node.textContent === 'ant-list-children-end') break;
      if (!active || node.nodeType === 8) continue;
      if (node.nodeType === 3 && !node.textContent) continue;
      count++;
      text ||= node.nodeType === 3;
    }
    publish(text && count > 1);
  }

  const Observer = element.ownerDocument.defaultView?.MutationObserver;
  const observer = Observer ? new Observer(update) : undefined;
  observer?.observe(element, { childList: true, characterData: true, subtree: true });
  update();
  return () => observer?.disconnect();
}
