import {
  theme,
  type DividerConfig,
  type DividerProps,
  type DividerSemanticInfo,
  type ThemeConfig,
  type ComponentSize
} from 'antd-svelte';
import reference from './ant-design-divider-config-reference.json';

interface DividerConfigCase {
  name: string;
  props: DividerProps;
  provider?: DividerConfig;
  child?: DividerConfig | null;
  functions?: 'provider' | 'local' | 'both' | 'empty';
  theme?: 'dark' | 'compact' | 'own' | 'variables' | 'undefined' | 'unhashed';
  native?: boolean;
  rtl?: boolean;
  contextSize?: ComponentSize;
}

export const dividerConfigCases = reference.cases as DividerConfigCase[];

export function dividerConfigClasses({ props }: DividerSemanticInfo) {
  return { root: `fn-${props.orientation}-${props.titlePlacement}-${props.size ?? 'none'}`,
    rail: 'fn-rail', content: `fn-prefix-${props.prefixCls || 'default'}` };
}

export function dividerConfigStyles({ props }: DividerSemanticInfo) {
  return { root: props.orientation === 'vertical' ? 'opacity:0.6' : 'opacity:0.8',
    rail: props.titlePlacement === 'end' ? 'border-top-color:rgb(40,50,60)'
      : 'border-top-color:rgb(60,50,40)', content: 'padding-inline-end:21px' };
}

export function dividerConfigProvider(sample: DividerConfigCase): DividerConfig | undefined {
  if (sample.functions === 'empty') return { classNames: () => undefined, styles: () => undefined };
  if (sample.functions === 'both' || sample.functions === 'provider') return {
    ...sample.provider, classNames: dividerConfigClasses, styles: dividerConfigStyles
  };
  return sample.provider;
}

export function dividerConfigTheme(sample: DividerConfigCase): ThemeConfig | undefined {
  if (sample.native) return undefined;

  return {
    cssVar: { key: 'divider-config-scope', ...(sample.theme === 'variables'
      ? { prefix: 'DividerX' } : {}) },
    token: { motion: false },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    ...(['own', 'variables'].includes(sample.theme ?? '') ? { components: { Divider: {
      textPaddingInline: 23, orientationMargin: 0.2, verticalMarginInline: 15,
      colorSplit: '#123456', fontSizeLG: 20
    } } } : {}),
    ...(sample.theme === 'undefined' ? { components: { Divider: {
      textPaddingInline: undefined, orientationMargin: undefined, verticalMarginInline: undefined
    } } } : {}),
    ...(sample.theme === 'unhashed' ? { hashed: false } : {})
  };
}
