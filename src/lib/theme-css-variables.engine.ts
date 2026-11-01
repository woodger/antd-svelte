import type { AliasToken } from './theme-token.types';

export const unitlessTokens: Partial<Record<keyof AliasToken, boolean>> = {
  lineHeight: true,
  lineHeightSM: true,
  lineHeightLG: true,
  lineHeightHeading1: true,
  lineHeightHeading2: true,
  lineHeightHeading3: true,
  lineHeightHeading4: true,
  lineHeightHeading5: true,
  opacityLoading: true,
  fontWeightStrong: true,
  zIndexPopupBase: true,
  zIndexBase: true,
  opacityImage: true
};

const ignoredTokens = new Set(['motionBase', 'motionUnit']);
const preservedTokens = new Set([
  'screenXS', 'screenXSMin', 'screenXSMax',
  'screenSM', 'screenSMMin', 'screenSMMax',
  'screenMD', 'screenMDMin', 'screenMDMax',
  'screenLG', 'screenLGMin', 'screenLGMax',
  'screenXL', 'screenXLMin', 'screenXLMax',
  'screenXXL', 'screenXXLMin', 'screenXXLMax',
  'screenXXXL', 'screenXXXLMin'
]);

export function tokenToCSSVariable(token: string, prefix = ''): string {
  return `--${prefix ? `${prefix}-` : ''}${token}`
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1-$2')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase();
}

/** Breakpoints остаются числами, motion parameters и непримитивные токены не попадают в CSS. */
export function transformThemeToken(token: object, prefix = 'ant') {
  const variables: Record<string, string> = {};
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(token)) {
    if (preservedTokens.has(key)) {
      result[key] = value;
    } else if ((typeof value === 'string' || typeof value === 'number')
      && !ignoredTokens.has(key)) {
      const variable = tokenToCSSVariable(key, prefix);
      variables[variable] = typeof value === 'number' && !unitlessTokens[key as keyof AliasToken]
        ? `${value}px` : String(value);
      result[key] = `var(${variable})`;
    }
  }

  return { token: result, variables };
}

/** Inline boundary сохраняет SSR-escaping Svelte; пользовательский style дописывается после неё. */
export function serializeThemeVariables(variables: Record<string, string>, prefix = 'ant'): string {
  const entries = Object.entries(variables);
  const cssPrefix = tokenToCSSVariable('', prefix);
  if (cssPrefix !== '--ant-') {
    for (const [key] of entries.slice()) {
      const stem = key.slice(cssPrefix.length);
      entries.push([`--ant-${stem}`, `var(${key})`]);
    }
  }

  return entries.map(([key, value]) => `${key}:${value}`).join(';');
}
