import { theme, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-qrcode-theme-reference.json';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
export interface QRCodeReferenceTheme {
  cssVar?: ThemeConfig['cssVar'];
  algorithm?: AlgorithmName[];
  token?: ThemeConfig['token'];
  components?: Record<string, Record<string, unknown> & { algorithm?: boolean | AlgorithmName[] }>;
}

export type QRCodeThemeSample = typeof reference.cases[number];

export function resolveQRCodeTheme(input: QRCodeReferenceTheme): ThemeConfig {
  const { algorithm, components, token, ...rest } = input;
  const field = (value: unknown) => value && typeof value === 'object'
    && '$type' in value && value.$type === 'undefined' ? undefined : value;
  const resolved = components && Object.fromEntries(
    Object.entries(components).map(([name, value]) => {
      const fields = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, field(item)]));
      if (Array.isArray(value.algorithm)) fields.algorithm = value.algorithm.map(name => theme[name]);
      return [name, fields];
    })
  );

  return {
    ...rest,
    token: { motion: false, ...Object.fromEntries(Object.entries(token ?? {})
      .map(([key, value]) => [key, field(value)])) },
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolved ? { components: resolved } : {})
  };
}
