import type { AvatarGroupMax } from 'antd-svelte';

export interface AvatarGroupPopoverValues {
  options?: AvatarGroupMax['popover'];
  editor?: boolean;
  richTitle?: boolean;
  undefinedContent?: boolean;
  undefinedTitle?: boolean;
  undefinedDestroy?: boolean;
  accept?: boolean;
  container?: 'local' | 'legacy' | 'provider' | 'both';
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
