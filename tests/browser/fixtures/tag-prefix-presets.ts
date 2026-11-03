import type { TagColor, TagVariant, TagConfig, ThemeConfig } from 'antd-svelte';

export interface TagPrefixValues {
  prefixCls?: string;
  color?: TagColor;
  variant?: TagVariant;
  disabled?: boolean;
  checked?: boolean;
  closable?: boolean;
  icon?: boolean;
  href?: string;
  target?: string;
  style?: string;
}

export interface TagPrefixCase extends TagPrefixValues {
  name: string;
  kind: 'tag' | 'checkable' | 'group';
  direction?: 'ltr' | 'rtl';
  componentDisabled?: boolean;
  provider?: TagConfig;
  token?: ThemeConfig['token'];
  tagTokens?: NonNullable<ThemeConfig['components']>['Tag'];
  dark?: boolean;
  compact?: boolean;
  childLink?: boolean;
  patch?: TagPrefixValues;
  snapshot: unknown;
  changed?: unknown;
  restored?: unknown;
}
