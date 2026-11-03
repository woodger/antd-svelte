import type { AvatarGroupProps } from 'antd-svelte';

export type AvatarGroupMaxValues = Pick<
  AvatarGroupProps,
  'max' | 'maxCount' | 'maxStyle' | 'maxPopoverPlacement' | 'maxPopoverTrigger'
>;

export interface AvatarGroupMaxCase extends AvatarGroupMaxValues {
  name: string;
  probe: 'hover' | 'focus' | 'click';
  patch?: AvatarGroupMaxValues;
  snapshot: unknown;
  changed?: unknown;
  restored?: unknown;
  popup: { open: boolean; placement: string | null; texts: string[] };
}
