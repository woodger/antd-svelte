import { theme, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-slider-prefix-reference.json';

export interface SliderPrefixCase {
  name: string;
  mode: 'single' | 'range' | 'active';
  prefix?: string;
  tip?: string;
  theme?: string;
  native?: boolean;
  vertical?: boolean;
  reverse?: boolean;
  rtl?: boolean;
  disabled?: boolean;
  noDecorations?: boolean;
  semantic?: boolean;
}

export const sliderPrefixCases = reference.cases as SliderPrefixCase[];

export function sliderPrefixTheme(sample: SliderPrefixCase): ThemeConfig {
  const dark = ['dark', 'green', 'purple'].includes(sample.theme ?? '');
  const primary = sample.theme === 'green' ? 'green' : sample.theme === 'purple' ? 'purple' : 'blue';
  if (sample.native) return { mode: dark ? 'dark' : 'light', primary };

  return {
    cssVar: { key: 'slider-prefix-scope', ...(sample.theme === 'variables' ? { prefix: 'SliderX' } : {}) },
    token: { motion: false, ...(primary === 'green' ? { colorPrimary: '#52c41a' }
      : primary === 'purple' ? { colorPrimary: '#722ed1' } : {}) },
    ...(dark ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    ...(sample.theme === 'own' ? { components: { Slider: {
      railSize: 6, handleSize: 16, handleSizeHover: 22, dotSize: 12,
      handleLineWidth: 3, railBg: '#123456', trackBg: '#345678'
    } } } : {}),
    ...(sample.theme === 'undefined' ? { components: { Slider: {
      railSize: undefined, handleSizeHover: undefined
    } } } : {}),
    ...(sample.theme === 'variables' ? { components: { Slider: { railSize: 7 } } } : {}),
    ...(sample.theme === 'unhashed' ? { hashed: false } : {})
  };
}
