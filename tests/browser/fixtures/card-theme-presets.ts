import { theme, type ThemeConfig } from 'antd-svelte';
import reference from './ant-design-card-theme-reference.json';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
export interface CardReferenceTheme {
  cssVar?: boolean | { prefix?: string; key?: string; };
  algorithm?: AlgorithmName[];
  token?: ThemeConfig['token'];
  components?: Record<string, Record<string, unknown> & { algorithm?: boolean | AlgorithmName[] }>;
}

export type CardThemeSample = typeof reference.cases[number];

export function resolveCardTheme(input: CardReferenceTheme): ThemeConfig {
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
  // Записка использует JS boolean cssVar; публичный ThemeConfig пока объявляет только объект.
  return {
    ...rest,
    token: { motion: false, ...input.token },
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolved ? { components: resolved } : {})
  } as unknown as ThemeConfig;
}
