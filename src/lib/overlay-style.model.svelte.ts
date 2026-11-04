import { connectInlineStyle } from './inline-style.dom';
import type { InlineStyleLayer } from './inline-style.engine';
import type { TooltipPosition } from './tooltip.engine';

/** Root styles следуют после координат rc-trigger, не сбрасывая variables темы и portal. */
export function createOverlayStyle(getLayers: () => readonly InlineStyleLayer[]) {
  let write: ReturnType<typeof connectInlineStyle> | undefined;
  let position: InlineStyleLayer;

  function update() {
    if (write) write([position, ...getLayers()]);
  }

  return {
    attach(node: HTMLElement) {
      write = connectInlineStyle(node, true);
      $effect(update);

      return () => {
        write = undefined;
      };
    },
    position(value: TooltipPosition) {
      position = [
        ['left', `${value.left}px`],
        ['top', `${value.top}px`],
        ['--arrow-x', `${value.arrowX}px`],
        ['--arrow-y', `${value.arrowY}px`]
      ];
      update();
    }
  };
}
