import type { TooltipColor } from 'antd-svelte';

export interface NestedColorCase {
  name: string;
  outer: 'tooltip' | 'popover';
  container: 'default' | 'body' | 'parent';
  color?: TooltipColor;
  snapshot: { background: string; color: string };
}
