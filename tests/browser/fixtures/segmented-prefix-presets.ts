import type { ThemeConfig } from 'antd-svelte';
import reference from './ant-design-segmented-prefix-reference.json';
import { resolveSegmentedTheme, type SegmentedReferenceTheme } from './segmented-theme-presets';

export interface SegmentedPrefixSample {
  name: string;
  prefix?: string;
  config?: SegmentedReferenceTheme;
  styled?: boolean;
  labelKind?: string;
  native?: 'light' | 'dark';
  compact?: boolean;
}

export const segmentedPrefixCases: readonly SegmentedPrefixSample[] = [
  ...reference.cases as SegmentedPrefixSample[],
  { name: 'native-light', prefix: 'native-segmented', native: 'light' },
  { name: 'native-dark', prefix: 'native-segmented', native: 'dark' },
  { name: 'native-dark-compact', prefix: 'native-segmented', native: 'dark', compact: true }
];

export function segmentedPrefixTheme(sample: SegmentedPrefixSample): ThemeConfig {
  return sample.native ? { mode: sample.native, compact: sample.compact }
    : resolveSegmentedTheme({ cssVar: {}, ...sample.config });
}
