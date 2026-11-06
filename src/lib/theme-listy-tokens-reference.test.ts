import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentThemeVariables } from './theme-component-style.engine';
import { listyItemHeight } from './listy.engine';
import {
  createDesignTokenState,
  defaultThemeConfig,
  mergeThemeConfig
} from './theme-config.engine';
import { theme } from './theme.engine';
import type { ThemeConfig } from './types';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
interface ListyTokenCase {
  name: string;
  config: Omit<ThemeConfig, 'algorithm' | 'components' | 'token'> & {
    token?: Record<string, unknown>;
    algorithm?: AlgorithmName[];
    components?: Record<string, Record<string, unknown> & {
      algorithm?: boolean | AlgorithmName[];
    }>;
  };
  variables: Record<string, string>;
  estimatedItemHeight: number;
}
const reference: {
  reference: { version: string; revision: string; archiveSha256: string; source: string; };
  cases: ListyTokenCase[];
} = JSON.parse(readFileSync(
  new URL('../../tools/fixtures/ant-design-listy-tokens-reference.json', import.meta.url),
  'utf8'
));

function resolve(input: ListyTokenCase['config']): ThemeConfig {
  const { algorithm, components, token, ...rest } = input;
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
    ...(token ? { token: Object.fromEntries(Object.entries(token).map(([key, item]) => [
      key,
      item && typeof item === 'object' && '$type' in item && item.$type === 'undefined'
        ? undefined : item
    ])) } : {}),
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolved ? { components: resolved } : {})
  };
}

describe('Ant Design 6.6.8 official UMD Listy CSS-token conformance', () => {
  it('pins declarations from the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`matches source Listy declarations and the delegated row estimate for ${sample.name}`, () => {
      const state = createDesignTokenState(mergeThemeConfig(
        resolve(sample.config),
        defaultThemeConfig,
        'reference'
      ));
      const variables = componentThemeVariables('Listy', state.token, state.prefix);

      expect(Object.fromEntries(Object.entries(variables).map(([key, value]) => [
        key,
        value.trim()
      ]))).toStrictEqual(sample.variables);
      expect(Object.keys(variables)).toStrictEqual(Object.keys(sample.variables));
      expect(listyItemHeight(state.token)).toBe(sample.estimatedItemHeight);
    });
  }
});
