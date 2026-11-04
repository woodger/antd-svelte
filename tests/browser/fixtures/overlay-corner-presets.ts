import type { TooltipPlacement, ThemeConfig } from 'antd-svelte';

export interface OverlayCornerValues {
  rect: { x: number; y: number; width: number; height: number };
  popup?: { width: number; height: number };
  placement: TooltipPlacement;
  open?: boolean;
}

export interface OverlayCornerCase extends OverlayCornerValues {
  name: string;
  component: 'tooltip' | 'popover' | 'popconfirm' | 'avatar-group' | 'slider';
  adjust?: boolean;
  arrow?: boolean;
  direction?: 'ltr' | 'rtl';
  token?: ThemeConfig['token'];
  geometry?: boolean;
  gap: number;
  frames?: Partial<OverlayCornerValues>[];
  snapshots: unknown[];
}
