import type { TooltipAlignConfig, TooltipProps, TooltipRef } from 'antd-svelte';
import type reference from './ant-design-tooltip-align-reference.json';

type AlignmentOptions = Pick<TooltipProps,
  'placement' | 'align' | 'builtinPlacements' | 'autoAdjustOverflow' | 'arrow'>;

export interface TooltipAlignmentCase {
  name: string;
  options: AlignmentOptions;
  patch?: AlignmentOptions;
  anchor: { x: number; y: number; width: number; height: number; };
  rtl?: boolean;
  rootStyle?: Record<string, number>;
  arrowStyle?: Record<string, number>;
  initial: typeof reference.cases[number]['initial'];
  manual: typeof reference.cases[number]['manual'];
  changed?: typeof reference.cases[number]['initial'];
}

export interface TooltipAlignmentHost extends HTMLElement {
  readonly tooltipRef: TooltipRef | undefined;
  readonly alignCalls: number;
  readonly lastAlign: TooltipAlignConfig | undefined;
  readonly callbackElement: HTMLElement | undefined;
}
