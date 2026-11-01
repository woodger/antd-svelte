import { theme, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-cascader-metrics.json';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
interface ReferenceTheme {
  algorithm?: AlgorithmName[];
  token?: ThemeConfig['token'];
  cssVar?: ThemeConfig['cssVar'];
  components?: Record<string, Record<string, unknown> & { algorithm?: boolean | AlgorithmName[]; }>;
}

function resolve(input: ReferenceTheme): ThemeConfig {
  const { algorithm, components, ...rest } = input;
  const resolved = components && Object.fromEntries(
    Object.entries(components).map(([name, value]) => {
      const fields = Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
        item && typeof item === 'object' && '$type' in item && item.$type === 'undefined'
          ? undefined : item
      ]));
      if (Array.isArray(value.algorithm)) {
        fields.algorithm = value.algorithm.map(name => theme[name]);
      }

      return [name, fields];
    })
  );

  return {
    ...rest,
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolved ? { components: resolved } : {})
  };
}

export const cascaderThemePresets: Record<string, ThemeConfig> = Object.fromEntries(
  reference.cases.map(sample => [sample.name, resolve(sample.config as ReferenceTheme)])
);
