import type { TagConfig, TagProps, ThemeConfig } from 'antd-svelte';

export interface TagStyleValues extends Pick<
  TagProps, 'color' | 'variant' | 'disabled' | 'class' | 'style' | 'rootClassName'
> {
  icon?: boolean;
  close?: boolean;
  classNames?: { root?: string; icon?: string; content?: string; close?: string; };
  styles?: { root?: string; icon?: string; content?: string; close?: string; };
  functions?: boolean;
  contextFunctions?: boolean;
}

export interface TagStyleCase extends TagStyleValues {
  name: string;
  provider?: TagConfig;
  innerProvider?: TagConfig;
  direction?: 'ltr' | 'rtl';
  componentDisabled?: boolean;
  token?: ThemeConfig['token'];
  tagTokens?: NonNullable<ThemeConfig['components']>['Tag'];
  dark?: boolean;
  compact?: boolean;
  checkable?: boolean;
  patch?: TagStyleValues;
}
