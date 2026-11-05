import type { PopoverProps, TooltipAlignConfig } from 'antd-svelte';
import type reference from './ant-design-popover-align-reference.json';

type AlignmentOptions = Pick<PopoverProps,
  'placement' | 'align' | 'builtinPlacements' | 'autoAdjustOverflow' | 'arrow'>;
type AlignmentSnapshot = typeof reference.cases[number]['initial'];

export interface PopoverAlignmentCase {
  name: string;
  mode: 'popover' | 'popconfirm' | 'avatar';
  options: AlignmentOptions;
  patch?: AlignmentOptions;
  anchor: { x: number; y: number; width: number; height: number; };
  rtl?: boolean;
  rootStyle?: Record<string, number>;
  arrowStyle?: Record<string, number>;
  initial: AlignmentSnapshot;
  beforeForceAlign?: AlignmentSnapshot;
  changed?: AlignmentSnapshot;
  resize?: { delta: number; snapshot: AlignmentSnapshot; };
}

export interface PopoverAlignmentHost extends HTMLElement {
  readonly alignCalls: number;
  readonly lastAlign: TooltipAlignConfig | undefined;
  readonly callbackElement: HTMLElement | undefined;
}
