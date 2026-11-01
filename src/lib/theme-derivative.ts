import type { MapToken, MappingAlgorithm, SeedToken } from './theme-token.types';

let nextThemeId = 0;

/** Исходный объект темы cssinjs; массив алгоритмов сохраняет переданную ссылку. */
export class DerivativeTheme {
  private derivatives: readonly MappingAlgorithm[];
  readonly id: number;

  constructor(derivatives: MappingAlgorithm | readonly MappingAlgorithm[]) {
    this.derivatives = typeof derivatives === 'function' ? [derivatives] : derivatives;
    this.id = nextThemeId++;
  }

  getDerivativeToken(token: SeedToken): MapToken {
    return this.derivatives.reduce<MapToken | undefined>(
      (result, derivative) => derivative(token, result),
      undefined
    )!;
  }
}
