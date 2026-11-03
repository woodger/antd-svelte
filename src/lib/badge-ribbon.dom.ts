/** Сохраняет source style diff: shorthand не заставляет повторно писать неизменный longhand. */
export function connectBadgeRibbonStyle(node: HTMLElement) {
  const parser = node.ownerDocument.createElement('span').style;
  let previous = new Map<string, { value: string; priority: string; }>();

  return (
    layers: readonly (string | undefined)[],
    color?: { property: 'background' | 'color'; value: string; }
  ) => {
    const next = new Map<string, { value: string; priority: string; }>();
    if (color) next.set(color.property, { value: color.value, priority: '' });
    for (const layer of layers) {
      parser.cssText = layer ?? '';
      for (const property of parser) {
        next.set(property, {
          value: parser.getPropertyValue(property),
          priority: parser.getPropertyPriority(property)
        });
      }
    }

    for (const property of previous.keys()) {
      if (!next.has(property)) node.style.removeProperty(property);
    }
    for (const [property, current] of next) {
      const old = previous.get(property);
      if (old?.value !== current.value || old.priority !== current.priority) {
        node.style.setProperty(property, current.value, current.priority);
      }
    }
    previous = next;
  };
}
