export interface TypographySnippetContent {
  text: string;
  plain: boolean;
  copy: string;
}

/** Только children: actions, ellipsis и suffix не попадают в исходный текст snippet. */
export function connectTypographyContent(
  element: HTMLElement,
  publish: (content: TypographySnippetContent) => void
) {
  function update() {
    const nodes = [...element.childNodes].filter(node => node.nodeType !== 8);
    const plain = nodes.every(node => node.nodeType === 3);
    const text = element.textContent ?? '';
    const copy = nodes.map(node => node.nodeType === 3 ? node.textContent : '[object Object]').join('');
    publish({ text, plain, copy });
  }
  const Observer = element.ownerDocument.defaultView?.MutationObserver;
  const observer = Observer ? new Observer(update) : undefined;
  observer?.observe(element, { childList: true, characterData: true, subtree: true });
  update();
  return () => observer?.disconnect();
}

export function isTypographyNativeEllipsis(element: HTMLElement) {
  const probe = element.ownerDocument.createElement('em');
  element.appendChild(probe);
  try {
    const bounds = element.getBoundingClientRect();
    const content = probe.getBoundingClientRect();
    return bounds.left > content.left || content.right > bounds.right
      || bounds.top > content.top || content.bottom > bounds.bottom;
  } finally {
    probe.remove();
  }
}
