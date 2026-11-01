import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { theme } from './theme.engine';
import type {
  AliasToken,
  DesignTokenConfig,
  MapToken,
  MappingAlgorithm
} from './theme-token.types';

type AlgorithmName = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';

interface ReferenceCase {
  name: string;
  algorithms?: AlgorithmName[];
  token?: Partial<AliasToken>;
  map: unknown;
  alias?: unknown;
  error?: { name: string; message: string; };
}

interface ThemeReference {
  reference: { version: string; revision: string; archiveSha256: string; source: string; };
  seed: unknown;
  cases: ReferenceCase[];
}

const reference: ThemeReference = JSON.parse(readFileSync(
  new URL('../../tools/fixtures/ant-design-theme-reference.json', import.meta.url),
  'utf8'
));

// JSON не сохраняет undefined, NaN и -0; encoding эталона восстанавливает их без нормализации.
function decode(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(decode);
  if ('$type' in value) {
    switch (value.$type) {
      case 'undefined': return undefined;
      case 'NaN': return NaN;
      case 'Infinity': return Infinity;
      case '-Infinity': return -Infinity;
      case '-0': return -0;
    }
  }

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]));
}

function tokenKeys(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Expected a reference token record');
  }

  return Object.keys(value);
}

describe('Ant Design 6.6.8 official UMD design-token conformance', () => {
  it('uses the pinned artifact and reproduces every default seed field', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      source: 'package/dist/antd.min.js'
    });
    expect(reference.cases).toHaveLength(25);
    expect(theme.defaultSeed).toStrictEqual(decode(reference.seed));
    expect(Object.keys(theme.defaultSeed)).toStrictEqual(tokenKeys(reference.seed));
  });

  for (const sample of reference.cases) {
    it(`reproduces all map and alias fields for ${sample.name}`, () => {
      const algorithms: MappingAlgorithm[] = (sample.algorithms ?? ['defaultAlgorithm'])
        .map(name => theme[name]);
      const seed = { ...theme.defaultSeed, ...sample.token };
      let map: MapToken | undefined;

      for (const algorithm of algorithms) map = algorithm(seed, map);

      const expectedMap = decode(sample.map);
      expect(map).toStrictEqual(expectedMap);
      if (map && expectedMap && typeof expectedMap === 'object') {
        expect(Object.keys(map)).toStrictEqual(Object.keys(expectedMap));
      }

      const config: DesignTokenConfig = {
        token: sample.token,
        ...(sample.algorithms ? { algorithm: algorithms } : {})
      };

      if (sample.error) {
        expect(() => theme.getDesignToken(config)).toThrowError(sample.error.message);
        expect(() => theme.getDesignToken(config)).toThrowError(TypeError);
      } else {
        const token = theme.getDesignToken(config);
        const expected = decode(sample.alias);

        expect(token).toStrictEqual(expected);
        expect(expected).toBeTypeOf('object');
        expect(Object.keys(token)).toStrictEqual(tokenKeys(expected));
      }
    });
  }
});
