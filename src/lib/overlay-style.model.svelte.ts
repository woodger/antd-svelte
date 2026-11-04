import { getInlineStyleDeclarations } from './inline-style.engine';
import type { TooltipPosition } from './tooltip.engine';

/** Root styles следуют после координат rc-trigger, не сбрасывая variables темы и portal. */
export function createOverlayStyle(getStyle: () => string | undefined) {
  let element: HTMLElement | undefined;
  let parser: CSSStyleDeclaration | undefined;
  let position = '';
  let previous = new Set<string>();

  function update() {
    if (!element || !parser) return;

    const next = new Map<string, { value: string; priority: string }>();
    for (const layer of [position, getStyle()]) {
      parser.cssText = layer ?? '';
      for (const { property, value, priority } of getInlineStyleDeclarations([parser.cssText])) {
        if (!next.get(property)?.priority || priority) next.set(property, { value, priority });
      }
    }
    for (const property of previous) {
      if (!next.has(property)) element.style.removeProperty(property);
    }
    for (const [property, current] of next) {
      if (element.style.getPropertyValue(property) !== current.value
        || element.style.getPropertyPriority(property) !== current.priority) {
        element.style.setProperty(property, current.value, current.priority);
      }
    }
    previous = new Set(next.keys());
  }

  return {
    attach(node: HTMLElement) {
      element = node;
      parser = node.ownerDocument.createElement('span').style;
      $effect(update);

      return () => {
        element = undefined;
        parser = undefined;
      };
    },
    position(value: TooltipPosition) {
      position = `left:${value.left}px;top:${value.top}px;`
        + `--arrow-x:${value.arrowX}px;--arrow-y:${value.arrowY}px`;
      update();
    }
  };
}
