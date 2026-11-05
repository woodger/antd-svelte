import type { PopoverTrigger } from 'antd-svelte';

export interface PopoverActionOptions {
  title: string;
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  showAction?: readonly PopoverTrigger[] | null;
  hideAction?: readonly PopoverTrigger[] | null;
  focusDelay?: number;
  blurDelay?: number;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
}

export interface PopoverActionCase {
  name: string;
  mode: 'popover' | 'popconfirm' | 'avatar';
  frames: readonly {
    action: { kind: string; event?: string; ms?: number; };
    props: PopoverActionOptions;
    syncEvents?: readonly boolean[];
    snapshot: {
      visible: boolean;
      openClass: boolean;
      events: readonly boolean[];
      commands: readonly string[];
    };
  }[];
}
