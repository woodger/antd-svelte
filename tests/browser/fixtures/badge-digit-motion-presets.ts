import type { BadgeSize, ThemeConfig } from 'antd-svelte';

export type BadgeDigitStep = { kind: 'value'; value: string | number | boolean; }
  | { kind: 'initial' | 'end' | 'unmount'; }
  | { kind: 'timer'; ms: number; };

export interface BadgeDigitCase {
  name: string;
  initial: string | number | boolean;
  steps: BadgeDigitStep[];
  overflowCount?: number;
  size?: BadgeSize;
  direction?: 'ltr' | 'rtl';
  badge?: NonNullable<ThemeConfig['components']>['Badge'];
}
