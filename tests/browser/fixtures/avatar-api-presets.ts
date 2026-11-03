import type { AvatarConfig, AvatarProps, ThemeConfig } from 'antd-svelte';

export interface AvatarApiValues extends Pick<
  AvatarProps,
  'size' | 'shape' | 'gap' | 'class' | 'rootClassName' | 'style' | 'title' | 'dir' | 'prefixCls'
> {
  itemPrefix?: string;
  tabindex?: number;
  role?: AvatarProps['role'];
  kind?: 'text' | 'icon' | 'image' | 'snippet';
  provider?: AvatarConfig;
  innerProvider?: AvatarConfig;
}

export interface AvatarApiCase extends AvatarApiValues {
  name: string;
  group?: boolean;
  direction?: 'ltr' | 'rtl';
  componentSize?: 'small' | 'middle' | 'large';
  componentDisabled?: boolean;
  token?: ThemeConfig['token'];
  avatarTokens?: NonNullable<ThemeConfig['components']>['Avatar'];
  dark?: boolean;
  compact?: boolean;
  cancelError?: boolean;
  patch?: AvatarApiValues;
  snapshot: unknown;
  changed?: unknown;
  restored?: unknown;
  refType: string;
  clickEvents: string[];
}

export const avatarApiImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"%3E%3Crect width="8" height="8" fill="red"/%3E%3C/svg%3E';
