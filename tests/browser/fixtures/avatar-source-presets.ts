import type { AvatarSize } from 'antd-svelte';
export interface AvatarSourceCase {
  name: string;
  kind: 'raw' | 'empty' | 'stateful' | 'image';
  size: AvatarSize;
  icon?: boolean;
  attrs?: boolean;
  preview?: boolean;
  fallback?: boolean;
  group?: 'visible' | 'hidden';
  compact?: boolean;
  aliases?: { containerSizeLG?: number; };
}
