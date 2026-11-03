import { getBadgeStyleDeclarations, getBadgeStyleValue } from './badge-style.engine';

/** React style diff сохраняет порядок shorthand/longhand при реактивных обновлениях. */
export function connectBadgeStyle(node: HTMLElement) {
  const parser = node.ownerDocument.createElement('span').style;
  let previous = new Map<string, { value: string; priority: string; }>();

  return (
    layers: readonly (string | undefined)[],
    overrides: readonly (readonly [string, string])[] = [],
    insetBorder = false
  ) => {
    const next = new Map<string, { value: string; priority: string; }>();
    for (const layer of layers) {
      parser.cssText = layer ?? '';
      for (const { property, value, priority } of getBadgeStyleDeclarations([parser.cssText])) {
        if (!next.get(property)?.priority || priority) {
          next.set(property, { value, priority });
        }
      }
    }
    for (const [property, value] of overrides) next.set(property, { value, priority: '' });

    const border = insetBorder && getBadgeStyleValue(layers, 'border-color');
    if (border) next.set('box-shadow', { value: `0 0 0 1px ${border} inset`, priority: '' });

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
