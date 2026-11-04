import type { AdjustOverflow, TooltipArrow, TooltipPlacement, ThemeConfig } from 'antd-svelte';

export interface OverlayCornerValues {
  rect: { x: number; y: number; width: number; height: number };
  popup?: { width: number; height: number };
  placement: TooltipPlacement;
  open?: boolean;
  adjust?: boolean | AdjustOverflow;
  arrow?: TooltipArrow;
}

export interface OverlayCornerCase extends OverlayCornerValues {
  name: string;
  component: 'tooltip' | 'popover' | 'popconfirm' | 'avatar-group' | 'slider';
  direction?: 'ltr' | 'rtl';
  token?: ThemeConfig['token'];
  components?: ThemeConfig['components'];
  range?: boolean;
  geometry?: boolean;
  gap: number;
  frames?: Partial<OverlayCornerValues>[];
  snapshots: unknown[];
}
