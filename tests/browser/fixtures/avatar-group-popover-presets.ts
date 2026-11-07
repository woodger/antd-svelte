import type { AvatarGroupMax } from 'antd-svelte';

export interface AvatarGroupPopoverValues {
  options?: AvatarGroupMax['popover'];
  editor?: boolean;
  richTitle?: boolean;
  undefinedContent?: boolean;
  undefinedTitle?: boolean;
  accept?: boolean;
  container?: 'local' | 'provider';
}

export interface AvatarGroupPopoverCase extends AvatarGroupPopoverValues {
  name: string;
  patch?: AvatarGroupPopoverValues;
  initial: unknown;
  changed?: unknown;
  restored?: unknown;
  opened: unknown;
  closed: unknown;
  reopened: unknown;
  retained: boolean | null;
}
