import {
  prepareButtonTokens,
  prepareInputTokens,
  prepareInputNumberTokens,
  prepareRadioTokens,
  prepareSwitchTokens
} from './theme-control-tokens.engine';
import { prepareAvatarTokens, prepareBadgeTokens } from './theme-display-tokens.engine';
import { prepareSelectTokens } from './theme-select-tokens.engine';
import { prepareTreeSelectTokens } from './theme-tree-tokens.engine';
import { prepareCascaderTokens } from './theme-cascader-tokens.engine';
import {
  prepareTooltipTokens,
  preparePopoverTokens,
  preparePopconfirmTokens
} from './theme-overlay-tokens.engine';
import { serializeThemeVariables, tokenToCSSVariable, unitlessTokens }
  from './theme-css-variables.engine';
import type { GlobalToken } from './theme-component-token.types';

export type StyledComponent = 'Button' | 'Input' | 'InputNumber' | 'Addon'
  | 'Radio' | 'Checkbox' | 'Switch' | 'Avatar' | 'Badge' | 'Tooltip' | 'Popover' | 'Popconfirm'
  | 'Select' | 'TreeSelect' | 'Cascader';

const factories = {
  Button: prepareButtonTokens,
  Input: prepareInputTokens,
  InputNumber: prepareInputNumberTokens,
  Addon: () => ({}),
  Radio: prepareRadioTokens,
  Checkbox: () => ({}),
  Switch: prepareSwitchTokens,
  Avatar: prepareAvatarTokens,
  Badge: prepareBadgeTokens,
  Tooltip: prepareTooltipTokens,
  Popover: preparePopoverTokens,
  Popconfirm: preparePopconfirmTokens,
  Select: prepareSelectTokens,
  TreeSelect: prepareTreeSelectTokens,
  Cascader: prepareCascaderTokens
};
const componentUnitless: Record<StyledComponent, readonly string[]> = {
  Button: ['fontWeight', 'contentLineHeight', 'contentLineHeightSM', 'contentLineHeightLG'],
  Input: [],
  InputNumber: ['handleOpacity'],
  Addon: [],
  Radio: ['radioSize', 'dotSize'],
  Checkbox: [],
  Switch: [],
  Avatar: [],
  Badge: [],
  Tooltip: [],
  Popover: [],
  Popconfirm: [],
  Select: ['optionLineHeight', 'optionSelectedFontWeight'],
  TreeSelect: [],
  Cascader: ['optionSelectedFontWeight']
};
const inputMetrics = [
  'paddingBlock', 'paddingBlockSM', 'paddingBlockLG',
  'paddingInline', 'paddingInlineSM', 'paddingInlineLG',
  'inputFontSize', 'inputFontSizeSM', 'inputFontSizeLG'
];
const compactMetrics: Partial<Record<StyledComponent, readonly string[]>> = {
  Button: [
    'contentFontSize', 'contentFontSizeSM', 'contentFontSizeLG',
    'contentLineHeight', 'contentLineHeightSM', 'contentLineHeightLG',
    'paddingBlock', 'paddingBlockSM', 'paddingBlockLG',
    'paddingInline', 'paddingInlineSM', 'paddingInlineLG'
  ],
  Input: inputMetrics,
  InputNumber: inputMetrics
};

/** Source getDefaultComponentToken/getComponentToken и CSS-variable registration. */
function resolveComponentVariables(
  component: StyledComponent,
  token: GlobalToken,
  prefix = 'ant'
) {
  const custom = { ...token[component] } as Record<string, unknown>;
  const defaults = factories[component]({ ...token, ...custom });

  if (component === 'Popover') {
    for (const old of ['width', 'minWidth']) {
      // В исходном deprecated mapping учитываются truthy aliases, затем сохраняется явный 0.
      if (custom[old] || custom.titleMinWidth) custom.titleMinWidth ??= custom[old];
    }
  }

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

  return { variables, defaultVariables: Object.keys(defaults)
    .map(key => tokenToCSSVariable(qualify(key), prefix)) };
}

export function componentThemeVariables(
  component: StyledComponent,
  token: GlobalToken,
  prefix = 'ant'
): Record<string, string> {
  return resolveComponentVariables(component, token, prefix).variables;
}

export function componentThemeStyle(component: StyledComponent, token: GlobalToken, prefix = 'ant') {
  const { variables, defaultVariables } = resolveComponentVariables(component, token, prefix);
  for (const name of defaultVariables) {
    // В upstream отсутствие декларации наследуется; vendor defaults не должны возвращать её.
    if (!(name in variables)) variables[name] = 'inherit';
  }

  return serializeThemeVariables(variables, prefix);
}

/** Native compact использует исходные метрики controls, сохраняя прежние цвета и остальные стили. */
export function compactComponentThemeStyle(component: StyledComponent, token: GlobalToken) {
  const metrics = compactMetrics[component];
  if (!metrics) return undefined;

  const variables = componentThemeVariables(component, token);
  const selected = Object.fromEntries(metrics.map(key => {
    const qualified = `${component}${key[0].toUpperCase()}${key.slice(1)}`;
    const name = tokenToCSSVariable(qualified, 'ant');
    return [name, variables[name]];
  }));

  return serializeThemeVariables(selected);
}
