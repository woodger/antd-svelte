export function readTreeSelectSemantics() {
  const fixture = document.querySelector<HTMLElement>('[data-tree-select-semantic]')!;
  const prefix = fixture.dataset.semanticPrefix;
  const control = fixture.querySelector<HTMLElement>(`[class~="${prefix}"]`)!;
  const popup = fixture.querySelector<HTMLElement>(`[class~="${prefix}-dropdown"]`);
  const part = (name: string) => control.querySelector<HTMLElement>(`[class~="${prefix}-${name}"]`);
  const tags = (name: string) => Array.from(control.querySelectorAll<HTMLElement>(`[class~="${prefix}-selection-item${name}"]`));
  const editor = control.querySelector<HTMLInputElement>('[role="combobox"]')!;
  const draft = popup?.querySelector<HTMLInputElement>('[data-semantic-draft]');
  const text = (node: Element | null | undefined) => node?.textContent?.trim() ?? '';
  const project = (node?: HTMLElement | null) => node && {
    classes: Array.from(node.classList).filter(name => name.startsWith('semantic-')),
    styles: Object.fromEntries(Array.from(node.style).filter(name => name.startsWith('--semantic-')).sort()
      .map(name => [name, node.style.getPropertyValue(name).trim()]))
  } || null;
  const treePart = (node: Element, name: string) => Array.from(node.querySelectorAll<HTMLElement>(`[class*="-${name}"]`))
    .find(element => Array.from(element.classList).some(className => className.endsWith(`-tree-${name}`)));
  const rows = Array.from(popup?.querySelectorAll<HTMLElement>('[class*="-tree-treenode"]') ?? []).flatMap(row => {
    if (!Array.from(row.classList).some(name => name.endsWith('-tree-treenode'))) return [];
    const title = treePart(row, 'title');
    if (!title) return [];
    const switcher = treePart(row, 'switcher');
    return [{ title: text(title), item: project(row), itemTitle: project(title), itemSwitcher: project(switcher),
      switcher: text(switcher),
      renderers: Array.from(switcher?.querySelectorAll('[data-semantic-switcher]') ?? [],
        node => node.getAttribute('data-semantic-switcher')),
      icon: switcher && treePart(switcher, 'switcher-loading-icon') ? 'loading'
        : switcher?.querySelector('svg') ? 'icon'
          : switcher && treePart(switcher, 'switcher-leaf-line') ? 'line' : null }];
  });
  const placeholder = part('placeholder');
  return {
    control: project(control),
    prefix: project(part('prefix')),
    input: project(editor),
    suffix: project(part('suffix')),
    clear: project(part('clear')),
    content: project(part('content')),
    placeholder: placeholder ? { ...project(placeholder), text: text(placeholder),
      visible: getComputedStyle(placeholder).visibility !== 'hidden' } : null,
    item: tags('').map(project),
    itemContent: tags('-content').map(project),
    itemRemove: tags('-remove').map(project),
    customTags: Array.from(control.querySelectorAll('[data-semantic-tag]'), text),
    open: editor.getAttribute('aria-expanded') === 'true',
    popup: project(popup),
    rows,
    popupContainer: popup?.parentElement?.hasAttribute('data-semantic-target') ?? false,
    geometry: popup && fixture.hasAttribute('data-semantic-width') && popup.getClientRects().length
      ? { width: Math.round(popup.getBoundingClientRect().width), zIndex: popup.style.zIndex }
      : null,
    draft: draft?.value ?? null,
    draftFocused: !!draft && draft === document.activeElement,
    events: JSON.parse(fixture.querySelector('[data-semantic-events]')!.textContent!)
  };
}
