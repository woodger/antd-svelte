import type { TooltipProps } from 'antd-svelte';

export interface OverlayLifecycleOptions {
  destroyOnHidden?: boolean;
  destroyTooltipOnHide?: TooltipProps['destroyTooltipOnHide'];
}

export interface OverlayLifecycleCase {
  name: string;
  component: 'tooltip' | 'popover' | 'popconfirm' | 'typography';
  options: OverlayLifecycleOptions;
  patch?: OverlayLifecycleOptions;
  open?: boolean;
  defaultOpen?: boolean;
  container?: 'body';
  snapshots: Record<string, unknown>;
  retained: boolean;
}
