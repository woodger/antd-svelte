import type { TooltipLifecycleOptions } from './tooltip-lifecycle.types';

export interface TooltipActionCase {
  name: string;
  mode: 'tooltip' | 'typography';
  frames: readonly {
    action: { kind: string; event?: string; ms?: number; };
    props: TooltipLifecycleOptions;
    syncEvents?: readonly boolean[];
    snapshot: { visible: boolean; openClass: boolean; events: readonly boolean[]; };
  }[];
}
