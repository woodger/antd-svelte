export interface OverlayLifecycleOptions {
  destroyOnHidden?: boolean;
}

export interface OverlayLifecycleCase {
  name: string;
  component: 'tooltip' | 'popover' | 'popconfirm' | 'typography' | 'avatar-group';
  sourceConfig?: boolean;
  options: OverlayLifecycleOptions;
  patch?: OverlayLifecycleOptions;
  open?: boolean;
  defaultOpen?: boolean;
  container?: 'body';
  snapshots?: Record<string, unknown>;
  retained?: boolean;
}
