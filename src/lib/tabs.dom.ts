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
  indicator: HTMLElement,
  options: { key: string | undefined; vertical: boolean; showIndicator: boolean; }
): () => void {
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const selected = tabs.find((tab) => tab.dataset.tabsKey === options.key);

  function update() {
    indicator.hidden = !selected || !options.showIndicator;
    if (!selected) return;

    indicator.style.left = options.vertical ? '' : `${selected.offsetLeft}px`;
    indicator.style.right = options.vertical ? '' : 'auto';
    indicator.style.top = options.vertical ? `${selected.offsetTop}px` : '';
    indicator.style.width = options.vertical ? '' : `${selected.offsetWidth}px`;
    indicator.style.height = options.vertical ? `${selected.offsetHeight}px` : '';
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
