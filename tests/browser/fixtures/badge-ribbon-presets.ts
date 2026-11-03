import type { BadgeRibbonConfig, BadgeRibbonProps, ThemeConfig } from 'antd-svelte';

export interface BadgeRibbonCase extends Omit<BadgeRibbonProps, 'text' | 'children'> {
  name: string;
  text?: string | number | boolean | null;
  children?: string | number | boolean | null;
  textMode?: 'snippet';
  direction?: 'ltr' | 'rtl';
  provider?: BadgeRibbonConfig;
  innerProvider?: BadgeRibbonConfig;
  functions?: boolean;
  theme?: 'dark' | 'compact' | 'dark-compact';
  token?: ThemeConfig['token'];
  badge?: NonNullable<ThemeConfig['components']>['Badge'];
  cssPrefix?: string;
}
