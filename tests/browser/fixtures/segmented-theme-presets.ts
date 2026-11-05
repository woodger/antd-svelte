import { theme, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-segmented-theme-reference.json';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
export interface SegmentedReferenceTheme {
  cssVar?: ThemeConfig['cssVar'];
  algorithm?: AlgorithmName[];
  token?: ThemeConfig['token'];
  components?: Record<string, Record<string, unknown> & { algorithm?: boolean | AlgorithmName[] }>;
}

export type SegmentedThemeSample = typeof reference.cases[number];

export function resolveSegmentedTheme(input: SegmentedReferenceTheme): ThemeConfig {
  const { algorithm, components, ...rest } = input;
  const resolved = components && Object.fromEntries(
    Object.entries(components).map(([name, value]) => {
      const fields = Object.fromEntries(Object.entries(value).map(([key, item]) => [
        key,
        item && typeof item === 'object' && '$type' in item && item.$type === 'undefined'
          ? undefined : item
      ]));
      if (Array.isArray(value.algorithm)) fields.algorithm = value.algorithm.map(name => theme[name]);
      return [name, fields];
    })
  );

  return {
    ...rest,
    token: { motion: false, ...input.token },
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolved ? { components: resolved } : {})
  };
}
