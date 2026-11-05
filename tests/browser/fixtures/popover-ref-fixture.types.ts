import type { PopoverRef } from 'antd-svelte';

export interface PopoverRefFixtureElement extends HTMLElement {
  readonly popupRef: PopoverRef | undefined;
  readonly savedPopupRef: PopoverRef | undefined;
  readonly alignCalls: number;
}
