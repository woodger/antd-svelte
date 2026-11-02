import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentThemeVariables } from './theme-component-style.engine';
import {
  createDesignTokenState,
  defaultThemeConfig,
  mergeThemeConfig
} from './theme-config.engine';
import { theme } from './theme.engine';
import type { ThemeConfig } from './types';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
interface ReferenceCase {
  name: string;
  config: Omit<ThemeConfig, 'algorithm' | 'components'> & {
    algorithm?: AlgorithmName[];
    components?: Record<string, Record<string, unknown> & { algorithm?: boolean | AlgorithmName[]; }>;
  };
  variables: { Tabs: Record<string, string>; };
}
const reference: {
  reference: { version: string; revision: string; archiveSha256: string; };
  cases: ReferenceCase[];
} = JSON.parse(readFileSync(
  new URL('../../tools/fixtures/ant-design-tabs-tokens-reference.json', import.meta.url), 'utf8'
));

function config(input: ReferenceCase['config']): ThemeConfig {
  const { algorithm, components, ...rest } = input;
  const resolved = components && Object.fromEntries(Object.entries(components).map(([name, value]) => {
    const fields = Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
      item && typeof item === 'object' && '$type' in item && item.$type === 'undefined'
        ? undefined : item
    ]));
    if (Array.isArray(value.algorithm)) fields.algorithm = value.algorithm.map(name => theme[name]);
    return [name, fields];
  }));

  return {
    ...rest,
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolved ? { components: resolved } : {})
  };
}

describe('Ant Design 6.6.8 official UMD Tabs token conformance', () => {
  it('uses declarations captured from the pinned official archive', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa'
    });
  });

  for (const sample of reference.cases) {
    it(`reproduces every source Tabs declaration for ${sample.name}`, () => {
      const state = createDesignTokenState(mergeThemeConfig(
        config(sample.config),
        defaultThemeConfig,
        'reference'
      ));
      const variables = componentThemeVariables('Tabs', state.token, state.prefix);

      expect(Object.fromEntries(Object.entries(variables).map(([key, value]) => [key, value.trim()])))
        .toStrictEqual(sample.variables.Tabs);
      expect(Object.keys(variables)).toStrictEqual(Object.keys(sample.variables.Tabs));
    });
  }
});
