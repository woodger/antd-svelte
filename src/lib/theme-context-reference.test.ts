import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createDesignTokenState, defaultThemeConfig, mergeThemeConfig } from './theme-config.engine';
import { theme } from './theme.engine';
import type { ThemeConfig } from './types';
import type { MappingAlgorithm } from './theme-token.types';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';
interface SerializedConfig extends Omit<ThemeConfig, 'algorithm' | 'components'> {
  algorithm?: AlgorithmName[];
  components?: Record<string, Record<string, unknown> & {
    algorithm?: boolean | AlgorithmName[];
  }>;
}
interface ReferenceCase {
  name: string;
  configs: SerializedConfig[];
  token: unknown;
  tokenKeys: string[];
  cssVar: unknown;
  cssVarKeys: string[];
  hashId: string;
  map: unknown;
}

const reference: {
  reference: { version: string; revision: string; archiveSha256: string; source: string; };
  cases: ReferenceCase[];
} = JSON.parse(readFileSync(
  new URL('../../tools/fixtures/ant-design-theme-context-reference.json', import.meta.url),
  'utf8'
));

function algorithms(names: AlgorithmName[]): MappingAlgorithm[] {
  return names.map(name => theme[name]);
}

function config(input: SerializedConfig): ThemeConfig {
  const { algorithm, components, ...rest } = input;

  return {
    ...rest,
    ...(algorithm ? { algorithm: algorithms(algorithm) } : {}),
    ...(components ? { components: Object.fromEntries(Object.entries(components)
      .map(([name, value]) => [name, {
        ...value,
        ...(Array.isArray(value.algorithm) ? { algorithm: algorithms(value.algorithm) } : {})
      }])) } : {})
  };
}

describe('Ant Design 6.6.8 official UMD ConfigProvider/useToken conformance', () => {
  it('uses the pinned source artifact and public hook output', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      source: 'package/dist/antd.min.js'
    });
    expect(reference.cases).toHaveLength(23);
  });

  for (const sample of reference.cases) {
    it(`reproduces complete raw/CSS-variable tokens and hash for ${sample.name}`, () => {
      let merged = defaultThemeConfig;
      for (const [index, input] of sample.configs.entries()) {
        merged = mergeThemeConfig(config(input), merged, `reference-${index}`);
      }

      const result = createDesignTokenState(merged);

      expect(result.token).toStrictEqual(sample.token);
      expect(Object.keys(result.token)).toStrictEqual(sample.tokenKeys);
      expect(result.cssVar).toStrictEqual(sample.cssVar);
      expect(Object.keys(result.cssVar)).toStrictEqual(sample.cssVarKeys);
      const expectedHash = sample.hashId && sample.hashId.replace(
        /^css-/, process.env.NODE_ENV !== 'production' ? 'css-dev-only-do-not-override-' : 'css-'
      );
      expect(result.hashId).toBe(expectedHash);
      expect(result.theme.getDerivativeToken(theme.defaultSeed)).toStrictEqual(sample.map);
    });
  }
});
