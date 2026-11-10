/** Видимые DOM tags Source/Native без measurement-only overflow nodes. */
export function readTreeTags(prefix: string) {
  const host = document.querySelector('[data-tree-tag-control]')!;
  const input = host.querySelector<HTMLInputElement>('[role="combobox"]')!;
  const visible = (node: Element) => {
    for (let current: Element | null = node; current && current !== host; current = current.parentElement) {
      const style = getComputedStyle(current);
      if (current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true'
        || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    }
    return true;
  };
  const tags = [...host.querySelectorAll(`.${prefix}-selection-item, [data-tree-tag-custom]`)]
    .filter(visible).map(node => ({
      text: node.querySelector(`.${prefix}-selection-item-content, [data-tree-tag-label]`)?.textContent ?? '',
      title: node.getAttribute('title') || null,
      disabled: node.classList.contains(`${prefix}-selection-item-disabled`),
      removable: Boolean(node.querySelector(`.${prefix}-selection-item-remove, [data-tree-tag-close]`)),
      custom: node.hasAttribute('data-tree-tag-custom')
        ? JSON.parse(node.getAttribute('data-tree-tag-custom')!) : null
    }));
  const omitted = [...host.querySelectorAll('[data-tree-tag-omitted]')].find(visible);
  const opened = input.getAttribute('aria-expanded') === 'true';
  return { opened,
    selected: opened ? null : host.querySelector(`.${prefix}-single`) ?
      host.querySelector('.single-snippet')?.textContent
        ?? (input.hasAttribute('data-ant-tree-choice-input') ? input.value
          : host.querySelector(`.${prefix}-content`)?.textContent ?? '') : '',
    tags, omitted: omitted ? JSON.parse(omitted.getAttribute('data-tree-tag-omitted')!) : null };
}
