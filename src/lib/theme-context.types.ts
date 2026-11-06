import type { DerivativeTheme } from './theme-derivative';
import type { AliasToken } from './theme-token.types';
import type { GlobalToken } from './theme-component-token.types';
import type { ResolvedThemeConfig } from './types';

/** Source CSS-variable token: breakpoints сохраняются, остальные примитивы заменяются var(...). */
export type CSSVariableToken = Partial<{
  [Key in keyof AliasToken]: string | AliasToken[Key];
}> & { _hashId: string; };

/**
 * Реактивный результат theme.useToken(). Вызывайте при инициализации компонента;
 * читайте поля объекта в $derived/markup, чтобы сохранить связь с ConfigProvider.
 * cssVar — исходный transformed token Ant Design 6.6.8, а не { prefix, key }.
 */
export interface ThemeTokenResult {
  readonly theme: DerivativeTheme;
  readonly token: GlobalToken;
  readonly hashId: string;
  readonly cssVar: CSSVariableToken;
}

export interface DesignTokenState extends ThemeTokenResult {
  readonly token: GlobalToken & { _tokenKey: string; };
  readonly prefix: string;
  readonly key: string;
  readonly style: string;
  readonly scopeCSS: string;
}

export interface DesignTokenContext {
  /** DOM boundary владельца для portal CSS overrides; на SSR отсутствует. */
  readonly element?: HTMLElement;
  readonly config: ResolvedThemeConfig;
  readonly enabled: boolean;
  readonly state: DesignTokenState;
  readonly style: string | undefined;
}
