import type { AvatarSize, ComponentSize, DesignTokenConfig } from 'antd-svelte';

export interface AvatarResponsiveCase {
  name: string;
  size: AvatarSize;
  content?: 'text' | 'icon' | 'empty' | 'image';
  group?: boolean;
  context?: ComponentSize;
  undefinedSize?: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl')[];
  token?: DesignTokenConfig['token'];
  compact?: boolean;
  aliases?: { containerSize?: number; textFontSize?: number; };
  style?: boolean;
}
