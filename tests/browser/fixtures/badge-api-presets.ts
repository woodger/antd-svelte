import type { BadgeConfig, BadgeProps, ThemeConfig } from 'antd-svelte';

export interface BadgeApiValues extends Omit<
  BadgeProps, 'children' | 'count' | 'nativeElement' | 'classNames' | 'styles'
> {
  count?: number | string | null;
  custom?: boolean;
  ownStyle?: string;
  classNames?: { root?: string; indicator?: string; };
  styles?: { root?: string; indicator?: string; };
  functions?: boolean;
  textSpecial?: 'nan' | 'infinity' | 'negative-infinity';
}

export interface BadgeApiCase extends BadgeApiValues {
  name: string;
  wrap?: boolean;
  direction?: 'ltr' | 'rtl';
  provider?: BadgeConfig;
  innerProvider?: BadgeConfig;
  token?: ThemeConfig['token'];
  badgeTokens?: NonNullable<ThemeConfig['components']>['Badge'];
  patch?: BadgeApiValues;
}
