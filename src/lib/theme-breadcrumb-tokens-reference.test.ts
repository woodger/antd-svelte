import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentThemeVariables } from './theme-component-style.engine';
import { createDesignTokenState, defaultThemeConfig, mergeThemeConfig } from './theme-config.engine';
import { theme } from './theme.engine';
import type { ThemeConfig } from './types';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
interface ReferenceCase {
  name: string;
  config: Omit<ThemeConfig, 'algorithm' | 'components'> & {
    algorithm?: AlgorithmName[];
    components?: Record<string, Record<string, unknown> & { algorithm?: boolean | AlgorithmName[]; }>;
  };
  variables: Record<string, string>;
}
const reference: {
  reference: { version: string; revision: string; archiveSha256: string; source: string; };
  cases: ReferenceCase[];
} = JSON.parse(readFileSync(
  new URL('../../tools/fixtures/ant-design-breadcrumb-tokens-reference.json', import.meta.url), 'utf8'
));

function config(input: ReferenceCase['config']): ThemeConfig {
  const { algorithm, components, ...rest } = input;
  const resolvedComponents = components && Object.fromEntries(
    Object.entries(components).map(([name, value]) => {
      const resolved = Object.fromEntries(Object.entries(value).map(([key, item]) => [
        key,
        item && typeof item === 'object' && '$type' in item && item.$type === 'undefined'
          ? undefined : item
      ]));
      if (Array.isArray(value.algorithm)) {
        resolved.algorithm = value.algorithm.map(name => theme[name]);
      }

      return [name, resolved];
    })
  );

  return {
    ...rest,
    ...(algorithm ? { algorithm: algorithm.map(name => theme[name]) } : {}),
    ...(resolvedComponents ? { components: resolvedComponents } : {})
  };
}

describe('Ant Design 6.6.8 official UMD Breadcrumb CSS-token conformance', () => {
  it('uses scoped declarations from the pinned official artifact', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8', revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      source: 'package/dist/antd.min.js'
    });
    expect(reference.cases).toHaveLength(17);
  });

  for (const sample of reference.cases) {
    it(`reproduces every Breadcrumb declaration for ${sample.name}`, () => {
      const state = createDesignTokenState(mergeThemeConfig(config(sample.config),
        defaultThemeConfig, 'reference'));

      const variables = componentThemeVariables('Breadcrumb', state.token, state.prefix);
      const trimmed = Object.fromEntries(Object.entries(variables)
        .map(([key, value]) => [key, value.trim()]));

      expect(trimmed).toStrictEqual(sample.variables);
      expect(Object.keys(variables)).toStrictEqual(Object.keys(sample.variables));
    });
  }
});
