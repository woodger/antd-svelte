/** Обновляет только theme variables: позиция popup принадлежит DOM-controller. */
export function connectComponentTheme(node: HTMLElement, cssText: string | undefined) {
  const source = node.ownerDocument.createElement('span').style;
  source.cssText = cssText ?? '';
  const names = Array.from(source).filter(name => name.startsWith('--'));

  for (const name of names) {
    node.style.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
  }

  return () => {
    for (const name of names) node.style.removeProperty(name);
  };
}
