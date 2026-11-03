import {
  getBadgeStyleDeclarations,
  getBadgeStyleValue,
  serializeBadgeStyleLayers,
  type BadgeStyleLayer
} from './badge-style.engine';

/** React style diff сохраняет порядок shorthand/longhand при реактивных обновлениях. */
export function connectBadgeStyle(node: HTMLElement) {
  const parser = node.ownerDocument.createElement('span').style;
  let previous = new Map<string, { value: string; priority: string; }>();
  let initialized = false;

  return (
    layers: readonly BadgeStyleLayer[],
    overrides: readonly (readonly [string, string])[] = [],
    insetBorder = false
  ) => {
    if (!initialized) {
      initialized = true;
      const raw = layers.filter(layer => typeof layer !== 'string');
      // HTML style мог разобрать raw value как declarations; DOM setter принимает одно value.
      const serialized = serializeBadgeStyleLayers([...raw, overrides]);
      for (const { property } of getBadgeStyleDeclarations([serialized])) {
        node.style.removeProperty(property);
      }
    }

    const next = new Map<string, { value: string; priority: string; }>();
    for (const layer of layers) {
      if (typeof layer === 'string') parser.cssText = layer;
      const resolved = typeof layer === 'string' ? parser.cssText : layer;
      for (const { property, value, priority } of getBadgeStyleDeclarations([resolved])) {
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
