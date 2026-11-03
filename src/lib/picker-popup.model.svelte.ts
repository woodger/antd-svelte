import { createPopupContainer } from './popup-container.model.svelte.js';
import { getTooltipPosition, type TooltipRect } from './tooltip.engine';
import type { DatePickerProps } from './date-picker.types';

interface PickerPopupContainerOptions {
  open: boolean;
  reference?: HTMLElement;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
  themeStyle?: string;
}

/** Rc-picker пересоздаёт panel при смене portal target, сохраняя его при смене callback. */
export function createPickerPopup(getOptions: () => PickerPopupContainerOptions) {
  let target = $state<HTMLElement | ShadowRoot>();

  function resolve(trigger?: HTMLElement) {
    // До root ref вызывается только getter с нулевой арностью, как rc-trigger.
    const next = getOptions().getPopupContainer!(trigger!);
    target = next;
    return next;
  }

  $effect.pre(() => {
    const { open, reference, getPopupContainer } = getOptions();
    if (!getPopupContainer) target = undefined;
    else if (open && !reference && !getPopupContainer.length) resolve(undefined);
  });

  const portal = createPopupContainer(() => {
    const options = getOptions();
    return {
      ...options,
      rendered: options.open,
      getPopupContainer: options.getPopupContainer ? resolve : undefined
    };
  });

  return { portal, get target() { return target; } };
}

export function getPickerPopupPosition(
  reference: TooltipRect,
  popup: TooltipRect,
  viewport: TooltipRect,
  placement: NonNullable<DatePickerProps['placement']>
) {
  const position = getTooltipPosition(
    reference,
    popup,
    viewport,
    placement.startsWith('top') ? 'top' : 'bottom',
    true,
    placement.endsWith('Right') ? 'right' : 'left',
    4
  );

  // useAlign округляет offset вниз при scale=1; размеры native panel могут быть дробными.
  return { ...position, left: Math.floor(position.left), top: Math.floor(position.top) };
}
