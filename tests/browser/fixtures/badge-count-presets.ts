import type { BadgeProps, ThemeConfig } from 'antd-svelte';

export interface BadgeCountCase extends Omit<BadgeProps, 'count' | 'children'> {
  name: string;
  count?: string | number | boolean | null;
  custom?: 'label' | 'stateful' | 'empty';
  wrap?: boolean;
  ownOffset?: boolean;
  ownTitle?: boolean;
  direction?: 'ltr' | 'rtl';
  theme?: 'dark' | 'compact';
  badge?: NonNullable<ThemeConfig['components']>['Badge'];
}
