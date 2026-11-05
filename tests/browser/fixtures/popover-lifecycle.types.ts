import type { TooltipLifecycleOptions } from './tooltip-lifecycle.types';
import type reference from './ant-design-popover-lifecycle-reference.json';

export interface PopoverLifecycleOptions extends TooltipLifecycleOptions {
  heading?: string;
  widget?: boolean;
  containerPadding?: number | null;
  containerClass?: string;
  contentColor?: string | null;
  contentClass?: string;
  headingColor?: string | null;
  headingClass?: string;
  okText?: string;
  cancelText?: string;
  buttonClass?: string;
  okDisabled?: boolean;
  iconVisible?: boolean;
  showCancel?: boolean;
}

export interface PopoverLifecycleCase {
  name: string;
  mode: 'popover' | 'popconfirm' | 'avatar';
  frames: readonly {
    action: { kind: 'initial' | 'props'; } | { kind: 'widget'; value: string; };
    props: PopoverLifecycleOptions;
    snapshot: typeof reference.cases[number]['frames'][number]['snapshot'];
  }[];
}
