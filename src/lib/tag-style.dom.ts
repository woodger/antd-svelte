import { getInlineStyleDeclarations, type InlineStyleLayer } from './inline-style.engine';

/** Повторяет React style diff, сохраняя declaration keys и порядок shorthand/longhand. */
export function connectTagStyle(node: HTMLElement) {
  const parser = node.ownerDocument.createElement('span').style;
  let previous = new Map<string, { value: string; priority: string; }>();
  let initialized = false;

  return (layers: readonly InlineStyleLayer[]) => {
    if (!initialized) {
      initialized = true;
      const raw = layers.flatMap(layer => typeof layer === 'string' ? [] : layer ?? []);
      // SSR style может разобрать raw CSS-цвет как declarations; setter принимает одно value.
      for (const { property } of getInlineStyleDeclarations([
        raw.map(([name, value]) => `${name}:${value}`).join(';')
      ])) node.style.removeProperty(property);
    }

    const next = new Map<string, { value: string; priority: string; }>();
    for (const layer of layers) {
      if (typeof layer === 'string') parser.cssText = layer;
      const resolved = typeof layer === 'string' ? parser.cssText : layer;
      for (const { property, value, priority } of getInlineStyleDeclarations([resolved])) {
        if (!next.get(property)?.priority || priority) {
          next.set(property, { value, priority });
        }
      }
    }

    for (const property of previous.keys()) {
      if (!next.has(property)) node.style.removeProperty(property);
    }
    for (const [property, current] of next) {
      const old = previous.get(property);
      if (old?.value !== current.value || old.priority !== current.priority)
        node.style.setProperty(property, current.value, current.priority);
    }
    previous = next;
  };
}
