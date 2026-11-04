/** Добавляет open classes без замены caller class; cleanup удаляет только собственные tokens. */
export function connectTooltipOpenClass(element: Element, className: string): () => void {
  const hadClass = element.hasAttribute('class');
  const requested = className.split(/\s+/).filter(Boolean);
  const owned = new Set<string>();

  function merge() {
    for (const token of requested) {
      if (!element.classList.contains(token)) {
        owned.add(token);
        element.classList.add(token);
      }
    }
  }

  merge();
  const observer = new MutationObserver(merge);
  observer.observe(element, { attributes: true, attributeFilter: ['class'] });

  return () => {
    observer.disconnect();
    for (const token of owned) element.classList.remove(token);
    if (!hadClass && !element.getAttribute('class')) element.removeAttribute('class');
  };
}

export function connectTooltipDescription(element: Element, id: string): () => void {
  function merge() {
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    if (!tokens.includes(id))
      element.setAttribute('aria-describedby', [...tokens, id].join(' '));
  }

  merge();
  const observer = new MutationObserver(merge);
  observer.observe(element, { attributes: true, attributeFilter: ['aria-describedby'] });

  return () => {
    observer.disconnect();
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(
      (token) => token && token !== id
    );

    if (tokens.length)
      element.setAttribute('aria-describedby', tokens.join(' '));
    else element.removeAttribute('aria-describedby');
  };
}
