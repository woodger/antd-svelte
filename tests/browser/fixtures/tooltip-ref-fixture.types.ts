import type { TooltipRef } from 'antd-svelte';

export interface TooltipRefFixtureElement extends HTMLElement {
  readonly tooltipRef: TooltipRef | undefined;
  readonly savedTooltipRef: TooltipRef | undefined;
}
