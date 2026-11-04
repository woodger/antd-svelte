import { theme, type FlexConfig, type FlexProps, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-flex-source-reference.json';

interface FlexSourceCase {
  name: string;
  props: Omit<FlexProps, 'component'> & {
    component?: keyof HTMLElementTagNameMap | 'custom' | 'plain';
  };
  provider?: FlexConfig;
  child?: FlexConfig | null;
  theme?: 'aliases-small' | 'aliases-middle' | 'aliases-large' | 'compact' | 'algorithm'
    | 'variables' | 'undefined' | 'dark';
  native?: boolean;
  rtl?: boolean;
  empty?: boolean;
  width?: number;
}

export const flexSourceCases = reference.cases as FlexSourceCase[];

export function flexSourceTheme(sample: FlexSourceCase): ThemeConfig | undefined {
  if (sample.native) return undefined;
  const aliases = sample.theme?.startsWith('aliases');

  return {
    cssVar: { key: 'flex-source-scope', ...(sample.theme === 'variables' ? { prefix: 'FlexX' } : {}) },
    token: { motion: false },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    ...(aliases ? { components: { Flex: {
      paddingXS: 13, padding: 22, paddingLG: 31, fontSize: 30, colorText: '#a011cc'
    } } } : {}),
    ...(sample.theme === 'variables' ? { components: { Flex: { padding: 27 } } } : {}),
    ...(sample.theme === 'undefined' ? { components: { Flex: { padding: undefined } } } : {}),
    ...(sample.theme === 'algorithm' ? { components: { Flex: {
      sizeUnit: 6, fontSize: 20, algorithm: true
    } } } : {})
  };
}
