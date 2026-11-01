import defaultSeed from './theme-seed';
import { defaultAlgorithm, darkAlgorithm, compactAlgorithm } from './theme-algorithms.engine';
import { formatAliasToken } from './theme-alias.engine';
import type { AliasToken, DesignTokenConfig, MapToken } from './theme-token.types';

/**
 * Статический AliasToken Ant Design 6.6.8. Каждый вызов возвращает новый объект.
 * Копирует seed, выполняет алгоритмы по порядку и затем применяет alias overrides.
 * Пустой массив алгоритмов бросает TypeError, как закреплённый upstream.
 */
export function getDesignToken(config?: DesignTokenConfig): AliasToken {
  const algorithm = config?.algorithm;
  const algorithms = algorithm
    ? typeof algorithm === 'function' ? [algorithm] : algorithm
    : [defaultAlgorithm];
  const seed = { ...defaultSeed, ...config?.token };
  const override = config?.token;

  if (algorithms.length === 0) {
    // createTheme([]) в cssinjs 2.1.2 не возвращает тему; сохраняем исходную ошибку.
    throw new TypeError('Cannot read properties of undefined (reading \'getDerivativeToken\')');
  }

  const mapToken = algorithms.reduce<MapToken | undefined>(
    (previous, derive) => derive(seed, previous),
    undefined
  );

  return formatAliasToken({ ...mapToken!, override });
}

/** Статическая часть theme API; context/useToken и стили ConfigProvider переносятся отдельно. */
export const theme = {
  defaultSeed,
  defaultAlgorithm,
  darkAlgorithm,
  compactAlgorithm,
  getDesignToken
};
