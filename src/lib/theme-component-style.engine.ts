import {
  prepareButtonTokens,
  prepareInputTokens,
  prepareInputNumberTokens,
  prepareRadioTokens,
  prepareSwitchTokens
} from './theme-control-tokens.engine';
import { prepareAvatarTokens, prepareBadgeTokens, prepareTagTokens }
  from './theme-display-tokens.engine';
import { prepareSelectTokens } from './theme-select-tokens.engine';
import { prepareTreeSelectTokens } from './theme-tree-tokens.engine';
import { prepareCascaderTokens } from './theme-cascader-tokens.engine';
import { prepareMenuTokens, menuDeprecatedTokens } from './theme-menu-tokens.engine';
import { prepareTabsTokens } from './theme-tabs-tokens.engine';
import { prepareSliderTokens } from './theme-slider-tokens.engine';
import {
  prepareTooltipTokens,
  preparePopoverTokens,
  preparePopconfirmTokens,
  prepareDropdownTokens
} from './theme-overlay-tokens.engine';
import { serializeThemeVariables, tokenToCSSVariable, unitlessTokens }
  from './theme-css-variables.engine';
import type { GlobalToken } from './theme-component-token.types';

export type StyledComponent = 'Button' | 'Input' | 'InputNumber' | 'Addon'
  | 'Radio' | 'Checkbox' | 'Switch' | 'Avatar' | 'Badge' | 'Tooltip' | 'Popover' | 'Popconfirm'
  | 'Select' | 'TreeSelect' | 'Cascader' | 'Anchor' | 'Menu' | 'Dropdown' | 'Breadcrumb'
  | 'Steps' | 'Timeline' | 'Pagination' | 'Tabs' | 'Tag' | 'Slider' | 'Divider' | 'Flex' | 'Spin'
  | 'Progress' | 'Skeleton' | 'Empty' | 'Result';

const factories = {
  Result: (token: GlobalToken) => ({
    titleFontSize: token.fontSizeHeading3,
    subtitleFontSize: token.fontSize,
    iconFontSize: typeof token.fontSizeHeading3 === 'number'
      ? token.fontSizeHeading3 * 3 : `calc(${token.fontSizeHeading3} * 3)`,
    extraMargin: `${token.paddingLG}px 0 0 0`
  }),
  Empty: () => ({}),
  Skeleton: (token: GlobalToken) => ({
    color: token.colorFillContent,
    colorGradientEnd: token.colorFill,
    gradientFromColor: token.colorFillContent,
    gradientToColor: token.colorFill,
    titleHeight: token.controlHeight / 2,
    blockRadius: token.borderRadiusSM,
    paragraphMarginTop: token.marginLG + token.marginXXS,
    paragraphLiHeight: token.controlHeight / 2
  }),
  Progress: (token: GlobalToken) => ({
    circleTextColor: token.colorText,
    defaultColor: token.colorInfo,
    remainingColor: token.colorFillSecondary,
    lineBorderRadius: 100,
    circleTextFontSize: '1em',
    circleIconFontSize: `${token.fontSize / token.fontSizeSM}em`
  }),
  Spin: (token: GlobalToken) => ({
    contentHeight: 400,
    dotSize: token.controlHeightLG / 2,
    dotSizeSM: token.controlHeightLG * 0.35,
    dotSizeLG: token.controlHeight
  }),
  Tabs: prepareTabsTokens,
  Slider: prepareSliderTokens,
  Flex: () => ({}),
  Divider: (token: GlobalToken) => ({
    textPaddingInline: '1em',
    orientationMargin: 0.05,
    verticalMarginInline: token.marginXS
  }),
  Button: prepareButtonTokens,
  Input: prepareInputTokens,
  InputNumber: prepareInputNumberTokens,
  Addon: () => ({}),
  Radio: prepareRadioTokens,
  Checkbox: () => ({}),
  Switch: prepareSwitchTokens,
  Avatar: prepareAvatarTokens,
  Badge: prepareBadgeTokens,
  Tag: prepareTagTokens,
  Tooltip: prepareTooltipTokens,
  Popover: preparePopoverTokens,
  Popconfirm: preparePopconfirmTokens,
  Select: prepareSelectTokens,
  TreeSelect: prepareTreeSelectTokens,
  Cascader: prepareCascaderTokens,
  Anchor: (token: GlobalToken) => ({
    linkPaddingBlock: token.paddingXXS,
    linkPaddingInlineStart: token.padding
  }),
  Menu: prepareMenuTokens,
  Dropdown: prepareDropdownTokens,
  Breadcrumb: (token: GlobalToken) => ({
    itemColor: token.colorTextDescription,
    lastItemColor: token.colorText,
    iconFontSize: token.fontSize,
    linkColor: token.colorTextDescription,
    linkHoverColor: token.colorText,
    separatorColor: token.colorTextDescription,
    separatorMargin: token.marginXS
  }),
  Steps: (token: GlobalToken) => ({
    titleLineHeight: token.controlHeight,
    customIconSize: token.controlHeight,
    customIconTop: 0,
    customIconFontSize: token.controlHeightSM,
    iconSize: token.controlHeight,
    iconTop: -0.5,
    iconFontSize: token.fontSize,
    iconSizeSM: token.fontSizeHeading3,
    dotSize: token.controlHeight / 4,
    dotCurrentSize: token.controlHeightLG / 4,
    navArrowColor: token.colorTextDisabled,
    navContentMaxWidth: 'unset',
    descriptionMaxWidth: undefined,
    waitIconColor: token.wireframe ? token.colorTextDisabled : token.colorTextLabel,
    waitIconBgColor: token.wireframe ? token.colorBgContainer : token.colorFillContent,
    waitIconBorderColor: token.wireframe ? token.colorTextDisabled : 'transparent',
    finishIconBgColor: token.wireframe ? token.colorBgContainer : token.controlItemBgActive,
    finishIconBorderColor: token.wireframe ? token.colorPrimary : token.controlItemBgActive
  }),
  Timeline: (token: GlobalToken) => ({
    tailColor: token.colorSplit,
    tailWidth: token.lineWidthBold,
    dotBorderWidth: token.lineWidthBold,
    dotBg: undefined,
    dotSize: undefined,
    itemPaddingBottom: token.padding * 1.25
  }),
  Pagination: (token: GlobalToken) => ({
    itemBg: token.colorBgContainer,
    itemSize: token.controlHeight,
    itemSizeSM: token.controlHeightSM,
    itemSizeLG: token.controlHeightLG,
    itemActiveBg: token.colorBgContainer,
    itemActiveColor: token.colorPrimary,
    itemActiveColorHover: token.colorPrimaryHover,
    itemLinkBg: token.colorBgContainer,
    itemActiveColorDisabled: token.colorTextDisabled,
    itemActiveBgDisabled: token.controlItemBgActiveDisabled,
    itemInputBg: token.colorBgContainer,
    miniOptionsSizeChangerTop: 0,
    ...prepareInputTokens(token)
  })
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
  Tag: [],
  Tooltip: [],
  Popover: [],
  Popconfirm: [],
  Select: ['optionLineHeight', 'optionSelectedFontWeight'],
  TreeSelect: [],
  Cascader: ['optionSelectedFontWeight'],
  Anchor: [],
  Menu: ['groupTitleLineHeight'],
  Dropdown: [],
  Breadcrumb: [],
  Steps: [],
  Timeline: [],
  Pagination: [],
  Tabs: [],
  Slider: [],
  Divider: ['orientationMargin'],
  Flex: [],
  Spin: [],
  Progress: [],
  Skeleton: [],
  Empty: [],
  Result: []
};
const deprecatedTokens: Partial<Record<
  StyledComponent, readonly (readonly [string, string])[]
>> = {
  Popover: [['width', 'titleMinWidth'], ['minWidth', 'titleMinWidth']],
  Skeleton: [['color', 'gradientFromColor'], ['colorGradientEnd', 'gradientToColor']],
  Menu: menuDeprecatedTokens
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

  for (const [old, current] of deprecatedTokens[component] ?? []) {
    // Defaults рассчитаны до mapping; truthy alias не заменяет явно переданный 0.
    if (custom[old] || custom[current]) custom[current] ??= custom[old];
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

/** Вложенный CSS-корень сбрасывает vendor defaults и наследует переменные своего control. */
export function inheritedComponentThemeStyle(component: StyledComponent, token: GlobalToken) {
  const { defaultVariables } = resolveComponentVariables(component, token);
  return serializeThemeVariables(Object.fromEntries(defaultVariables.map(name => [name, 'inherit'])));
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
