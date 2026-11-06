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
import { prepareTreeTokens, prepareTreeSelectTokens } from './theme-tree-tokens.engine';
import { preparePickerPanelTokens } from './theme-picker-panel-tokens.engine';
import { prepareCascaderTokens } from './theme-cascader-tokens.engine';
import { prepareMenuTokens, menuDeprecatedTokens } from './theme-menu-tokens.engine';
import { prepareTabsTokens } from './theme-tabs-tokens.engine';
import { prepareSliderTokens } from './theme-slider-tokens.engine';
import {
  prepareArrowTokens,
  prepareTooltipTokens,
  preparePopoverTokens,
  preparePopconfirmTokens,
  prepareDropdownTokens
} from './theme-overlay-tokens.engine';
import { serializeThemeVariables, tokenToCSSVariable, unitlessTokens }
  from './theme-css-variables.engine';
import { FastColor } from './fast-color.engine';
import type {
  CardComponentToken, FormComponentToken, GlobalToken, SplitterComponentToken
} from './theme-component-token.types';

export type StyledComponent = 'Button' | 'Input' | 'InputNumber' | 'Addon'
  | 'Radio' | 'Checkbox' | 'Switch' | 'Avatar' | 'Badge' | 'Tooltip' | 'Popover' | 'Popconfirm'
  | 'Select' | 'TreeSelect' | 'Cascader' | 'Anchor' | 'Menu' | 'Dropdown' | 'Breadcrumb'
  | 'Steps' | 'Timeline' | 'Pagination' | 'Tabs' | 'Tag' | 'Slider' | 'Divider' | 'Flex' | 'Spin'
  | 'Progress' | 'Skeleton' | 'Empty' | 'Result' | 'Alert' | 'Collapse' | 'Card' | 'Carousel'
  | 'Descriptions' | 'Statistic' | 'Segmented' | 'Splitter' | 'Rate' | 'QRCode' | 'Image'
  | 'Layout' | 'Space' | 'Masonry' | 'BorderBeam' | 'Affix' | 'FloatButton' | 'Form' | 'Typography'
  | 'List' | 'Listy' | 'Tree' | 'Transfer' | 'Calendar' | 'DatePicker';

const factories = {
  DatePicker: (token: GlobalToken) => ({
    ...prepareInputTokens(token),
    ...preparePickerPanelTokens(token),
    ...prepareArrowTokens(token),
    presetsWidth: 120,
    presetsMaxWidth: 200,
    zIndexPopup: token.zIndexPopupBase + 50
  }),
  Calendar: (token: GlobalToken) => ({
    fullBg: token.colorBgContainer,
    fullPanelBg: token.colorBgContainer,
    itemActiveBg: token.controlItemBgActive,
    yearControlWidth: 80,
    monthControlWidth: 70,
    miniContentHeight: 256,
    ...preparePickerPanelTokens(token)
  }),
  Transfer: (token: GlobalToken) => {
    const fontHeight = Math.round(token.fontSize * token.lineHeight);

    return {
      listWidth: 180,
      listHeight: 200,
      listWidthLG: 250,
      headerHeight: token.controlHeightLG,
      itemHeight: token.controlHeight,
      itemPaddingBlock: (token.controlHeight - fontHeight) / 2,
      transferHeaderVerticalPadding:
        Math.ceil((token.controlHeightLG - token.lineWidth - fontHeight) / 2)
    };
  },
  Tree: prepareTreeTokens,
  Listy: (token: GlobalToken) => ({
    itemPaddingBlock: token.paddingSM,
    itemPaddingInline: token.padding
  }),
  List: (token: GlobalToken) => ({
    contentWidth: 220,
    itemPadding: `${token.paddingContentVertical}px 0`,
    itemPaddingSM: `${token.paddingContentVerticalSM}px ${token.paddingContentHorizontal}px`,
    itemPaddingLG: `${token.paddingContentVerticalLG}px ${token.paddingContentHorizontalLG}px`,
    headerBg: 'transparent',
    footerBg: 'transparent',
    emptyTextPadding: token.padding,
    metaMarginBottom: token.padding,
    avatarMarginRight: token.padding,
    titleMarginBottom: token.paddingSM,
    descriptionFontSize: token.fontSize
  }),
  Typography: () => ({ titleMarginTop: '1.2em', titleMarginBottom: '0.5em' }),
  Form: (token: GlobalToken & Partial<FormComponentToken>) => ({
    labelRequiredMarkColor: token.colorError,
    labelColor: token.colorTextHeading,
    labelFontSize: token.fontSize,
    labelHeight: token.controlHeight,
    verticalLabelHeight: token.labelHeight ?? 'auto',
    labelColonMarginInlineStart: token.marginXXS / 2,
    labelColonMarginInlineEnd: token.marginXS,
    itemMarginBottom: token.marginLG,
    verticalLabelPadding: `0 0 ${token.paddingXS}px`,
    verticalLabelMargin: 0,
    inlineItemMarginBottom: 0
  }),
  FloatButton: () => ({}),
  Affix: (token: GlobalToken) => ({ zIndexPopup: token.zIndexBase + 10 }),
  BorderBeam: () => ({}),
  Masonry: () => ({}),
  Space: () => ({}),
  Layout: (token: GlobalToken) => {
    const paddingInline = token.controlHeightLG * 1.25;

    return {
      colorBgHeader: '#001529',
      colorBgBody: token.colorBgLayout,
      colorBgTrigger: '#002140',
      bodyBg: token.colorBgLayout,
      headerBg: '#001529',
      headerHeight: token.controlHeight * 2,
      headerPadding: `0 ${paddingInline}px`,
      headerColor: token.colorText,
      footerPadding: `${token.controlHeightSM}px ${paddingInline}px`,
      footerBg: token.colorBgLayout,
      siderBg: '#001529',
      triggerHeight: token.controlHeightLG + token.marginXXS * 2,
      triggerBg: '#002140',
      triggerColor: token.colorTextLightSolid,
      zeroTriggerWidth: token.controlHeightLG,
      zeroTriggerHeight: token.controlHeightLG,
      lightSiderBg: token.colorBgContainer,
      lightTriggerBg: token.colorBgContainer,
      lightTriggerColor: token.colorText
    };
  },
  Image: (token: GlobalToken) => ({
    zIndexPopup: token.zIndexPopupBase + 80,
    previewOperationColor: new FastColor(token.colorTextLightSolid).setA(0.65).toRgbString(),
    previewOperationHoverColor: new FastColor(token.colorTextLightSolid).setA(0.85).toRgbString(),
    previewOperationColorDisabled: new FastColor(token.colorTextLightSolid).setA(0.25).toRgbString(),
    previewOperationSize: token.fontSizeIcon * 1.5,
    progressAnimationDuration: '3s'
  }),
  QRCode: (token: GlobalToken) => ({
    QRCodeCoverBackgroundColor: new FastColor(token.colorBgContainer).setA(0.96).toRgbString()
  }),
  Rate: (token: GlobalToken) => ({
    lineWidthFocus: token.lineWidthFocus === 0 ? 0 : token.lineWidth,
    starColor: token.yellow6,
    starSize: token.controlHeight * 0.625,
    starSizeSM: token.controlHeightSM * 0.625,
    starSizeLG: token.controlHeightLG * 0.625,
    starHoverScale: 'scale(1.1)',
    starBg: token.colorFillContent
  }),
  Splitter: (token: GlobalToken & Partial<SplitterComponentToken>) => {
    const resizeSpinnerSize = token.resizeSpinnerSize || 20;

    return {
      splitBarSize: token.splitBarSize || 2,
      splitTriggerSize: token.splitTriggerSize || 6,
      splitBarDraggableSize: token.splitBarDraggableSize ?? resizeSpinnerSize,
      resizeSpinnerSize
    };
  },
  Segmented: (token: GlobalToken) => ({
    trackPadding: token.lineWidthBold,
    trackBg: token.colorBgLayout,
    itemColor: token.colorTextLabel,
    itemHoverColor: token.colorText,
    itemHoverBg: token.colorFillSecondary,
    itemSelectedBg: token.colorBgElevated,
    itemActiveBg: token.colorFill,
    itemSelectedColor: token.colorText
  }),
  Statistic: (token: GlobalToken) => ({
    titleFontSize: token.fontSize,
    contentFontSize: token.fontSizeHeading3
  }),
  Descriptions: (token: GlobalToken) => ({
    labelBg: token.colorFillAlter,
    labelColor: token.colorTextTertiary,
    titleColor: token.colorText,
    titleMarginBottom: token.fontSizeSM * token.lineHeightSM,
    itemPaddingBottom: token.padding,
    itemPaddingEnd: token.padding,
    colonMarginRight: token.marginXS,
    colonMarginLeft: token.marginXXS / 2,
    contentColor: token.colorText,
    extraColor: token.colorText
  }),
  Carousel: (token: GlobalToken) => ({
    arrowSize: 16,
    arrowOffset: token.marginXS,
    dotWidth: 16,
    dotHeight: 3,
    dotGap: token.marginXXS,
    dotOffset: 12,
    dotWidthActive: 24,
    dotActiveWidth: 24
  }),
  Card: (token: GlobalToken & Partial<CardComponentToken>) => ({
    headerBg: 'transparent',
    headerFontSize: token.fontSizeLG,
    headerFontSizeSM: token.fontSize,
    headerHeight: token.fontSizeLG * token.lineHeightLG + token.padding * 2,
    headerHeightSM: token.fontSize * token.lineHeight + token.paddingXS * 2,
    actionsBg: token.colorBgContainer,
    actionsLiMargin: `${token.paddingSM}px 0`,
    tabsMarginBottom: -token.padding - token.lineWidth,
    extraColor: token.colorText,
    bodyPaddingSM: 12,
    headerPaddingSM: 12,
    bodyPadding: token.bodyPadding ?? token.paddingLG,
    headerPadding: token.headerPadding ?? token.paddingLG
  }),
  Collapse: (token: GlobalToken) => ({
    headerPadding: `${token.paddingSM}px ${token.padding}px`,
    headerPaddingSM: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingXS}px ${token.paddingXS}px`,
    headerPaddingLG: `${token.padding}px ${token.paddingLG}px ${token.padding}px ${token.padding}px`,
    headerBg: token.colorFillAlter,
    contentPadding: `${token.padding}px 16px`,
    contentPaddingSM: token.paddingSM,
    contentPaddingLG: token.paddingLG,
    contentBg: token.colorBgContainer,
    borderlessContentPadding: `${token.paddingXXS}px 16px ${token.padding}px`,
    borderlessContentBg: 'transparent'
  }),
  Alert: (token: GlobalToken) => ({
    borderRadius: token.borderRadiusLG,
    withDescriptionIconSize: token.fontSizeHeading3,
    defaultPadding: `${token.paddingContentVerticalSM}px 12px`,
    withDescriptionPadding: `${token.paddingMD}px ${token.paddingContentHorizontalLG}px`
  }),
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
  DatePicker: [],
  Calendar: [],
  Transfer: [],
  Tree: [],
  Listy: [],
  List: [],
  Typography: [],
  Form: [],
  FloatButton: [],
  Affix: [],
  BorderBeam: [],
  Masonry: [],
  Space: [],
  Layout: [],
  Image: [],
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
  Result: [],
  Alert: [],
  Collapse: [],
  Card: [],
  Carousel: [],
  Descriptions: [],
  Statistic: [],
  Segmented: [],
  Splitter: [],
  Rate: [],
  QRCode: []
};
const deprecatedTokens: Partial<Record<
  StyledComponent, readonly (readonly [string, string])[]
>> = {
  Layout: [
    ['colorBgBody', 'bodyBg'],
    ['colorBgHeader', 'headerBg'],
    ['colorBgTrigger', 'triggerBg']
  ],
  Popover: [['width', 'titleMinWidth'], ['minWidth', 'titleMinWidth']],
  Skeleton: [['color', 'gradientFromColor'], ['colorGradientEnd', 'gradientToColor']],
  Menu: menuDeprecatedTokens,
  Carousel: [['dotWidthActive', 'dotActiveWidth']]
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
