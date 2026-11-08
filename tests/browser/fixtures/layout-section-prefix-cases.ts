import type { ThemeConfig } from 'antd-svelte';

export interface LayoutSectionPrefixSample {
  id: string;
  direction: 'ltr' | 'rtl';
  prefix?: string;
  shared?: boolean;
  parentPrefix?: string;
  parentStyle?: Readonly<Record<string, string | number>>;
  localStyle?: Readonly<Record<string, string | number>>;
  theme?: ThemeConfig;
  algorithms?: ('defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm')[];
}

export function layoutSectionPrefix(sample: LayoutSectionPrefixSample,
  part: 'header' | 'content' | 'footer') {
  if (sample.prefix === undefined || sample.prefix === '') return sample.prefix;
  return sample.shared ? sample.prefix : `${sample.prefix}-${part}`;
}
