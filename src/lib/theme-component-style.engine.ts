import { prepareButtonTokens, prepareInputTokens, prepareInputNumberTokens }
  from './theme-control-tokens.engine';
import { serializeThemeVariables, tokenToCSSVariable, unitlessTokens }
  from './theme-css-variables.engine';
import type { GlobalToken } from './theme-component-token.types';

export type StyledComponent = 'Button' | 'Input' | 'InputNumber' | 'Addon';

const factories = {
  Button: prepareButtonTokens,
  Input: prepareInputTokens,
  InputNumber: prepareInputNumberTokens,
  Addon: () => ({})
};
const componentUnitless: Record<StyledComponent, readonly string[]> = {
  Button: ['fontWeight', 'contentLineHeight', 'contentLineHeightSM', 'contentLineHeightLG'],
  Input: [],
  InputNumber: ['handleOpacity'],
  Addon: []
};

/** Source getDefaultComponentToken/getComponentToken и CSS-variable registration. */
export function componentThemeVariables(
  component: StyledComponent,
  token: GlobalToken,
  prefix = 'ant'
): Record<string, string> {
  const custom = { ...token[component] } as Record<string, unknown>;
  const defaults = factories[component]({ ...token, ...custom });
  const merged: Record<string, unknown> = { ...defaults, ...custom };
  const global = token as unknown as Record<string, unknown>;
  for (const key of Object.keys(merged)) {
    if (merged[key] === global[key]) delete merged[key];
  }

  const qualify = (key: string) => `${component}${key[0].toUpperCase()}${key.slice(1)}`;
  for (const key of Object.keys(defaults)) {
    merged[qualify(key)] = merged[key];
    delete merged[key];
  }
  const unitless = new Set([
    ...Object.keys(unitlessTokens), qualify('zIndexPopup'),
    ...componentUnitless[component].map(qualify)
  ]);
  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    variables[tokenToCSSVariable(key, prefix)] = typeof value === 'number' && !unitless.has(key)
      ? `${value}px` : String(value);
  }

  return variables;
}

export function componentThemeStyle(component: StyledComponent, token: GlobalToken, prefix = 'ant') {
  return serializeThemeVariables(componentThemeVariables(component, token, prefix), prefix);
}
