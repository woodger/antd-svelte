import { theme, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-watermark-theme-reference.json';

export interface WatermarkReferenceTheme {
  cssVar?: ThemeConfig['cssVar'];
  algorithm?: string[];
  token?: Record<string, unknown>;
  components?: Record<string, Record<string, unknown> & { algorithm?: boolean | string[] }>;
}

export type WatermarkThemeSample = typeof reference.cases[number];

export function resolveWatermarkTheme(input: WatermarkReferenceTheme): ThemeConfig {
  const { algorithm, components, token, ...rest } = input;
  const resolveAlgorithm = (name: string) => {
    if (name !== 'defaultAlgorithm' && name !== 'darkAlgorithm' && name !== 'compactAlgorithm') {
      throw new Error(`Unknown Watermark theme algorithm: ${name}`);
    }

    return theme[name];
  };
  const field = (value: unknown) => value && typeof value === 'object'
    && '$type' in value && value.$type === 'undefined' ? undefined : value;
  const resolved = components && Object.fromEntries(
    Object.entries(components).map(([name, value]) => {
      const fields = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, field(item)]));
      if (Array.isArray(value.algorithm)) fields.algorithm = value.algorithm.map(resolveAlgorithm);
      return [name, fields];
    })
  );

  return {
    ...rest,
    token: { motion: false, ...Object.fromEntries(Object.entries(token ?? {})
      .map(([key, value]) => [key, field(value)])) },
    ...(algorithm ? { algorithm: algorithm.map(resolveAlgorithm) } : {}),
    ...(resolved ? { components: resolved } : {})
  };
}
