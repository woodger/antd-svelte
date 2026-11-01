export const presetColors = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const;

export type PresetColorKey = (typeof presetColors)[number];

export type PresetColorType = Record<PresetColorKey, string>;

type ColorPaletteKeyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type LegacyColorPalettes = {
  /** @deprecated Используйте нотацию blue1 вместо blue-1. */
  [key in `${keyof PresetColorType}-${ColorPaletteKeyIndex}`]: string;
};

export type ColorPalettes = {
  [key in `${keyof PresetColorType}${ColorPaletteKeyIndex}`]: string;
};

/** Исходные seed-параметры Ant Design 6.6.8. Defaults доступны через theme.defaultSeed. */
export interface SeedToken extends PresetColorType {
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  colorTextBase: string;
  colorBgBase: string;
  colorLink: string;
  fontFamily: string;
  fontFamilyCode: string;
  fontSize: number;
  lineWidth: number;
  lineType: string;
  borderRadius: number;
  sizeUnit: number;
  sizeStep: number;
  sizePopupArrow: number;
  controlHeight: number;
  zIndexBase: number;
  zIndexPopupBase: number;
  opacityImage: number;
  motionUnit: number;
  motionBase: number;
  motionEaseOutCirc: string;
  motionEaseInOutCirc: string;
  motionEaseInOut: string;
  motionEaseOutBack: string;
  motionEaseInBack: string;
  motionEaseInQuint: string;
  motionEaseOutQuint: string;
  motionEaseOut: string;
  wireframe: boolean;
  focusOutline: boolean;
  motion: boolean;
}

export interface ColorNeutralMapToken {
  colorTextBase: string;
  colorBgBase: string;
  colorShadow: string;
  colorText: string;
  colorTextSecondary: string;
  colorTextTertiary: string;
  colorTextQuaternary: string;
  colorBorder: string;
  colorBorderSecondary: string;
  colorBorderDisabled: string;
  colorFill: string;
  colorFillSecondary: string;
  colorFillTertiary: string;
  colorFillQuaternary: string;
  colorBgLayout: string;
  colorBgContainer: string;
  colorBgElevated: string;
  colorBgSpotlight: string;
  colorBgBlur: string;
  colorBgSolid: string;
  colorBgSolidActive: string;
  colorBgSolidHover: string;
}

interface ColorPrimaryMapToken {
  colorPrimary: string;
  colorPrimaryBg: string;
  colorPrimaryBgHover: string;
  colorPrimaryBorder: string;
  colorPrimaryBorderHover: string;
  colorPrimaryHover: string;
  colorPrimaryActive: string;
  colorPrimaryTextHover: string;
  colorPrimaryText: string;
  colorPrimaryTextActive: string;
}

interface ColorSuccessMapToken {
  colorSuccessBg: string;
  colorSuccessBgHover: string;
  colorSuccessBorder: string;
  colorSuccessBorderHover: string;
  colorSuccessHover: string;
  colorSuccess: string;
  colorSuccessActive: string;
  colorSuccessTextHover: string;
  colorSuccessText: string;
  colorSuccessTextActive: string;
}

interface ColorWarningMapToken {
  colorWarningBg: string;
  colorWarningBgHover: string;
  colorWarningBorder: string;
  colorWarningBorderHover: string;
  colorWarningHover: string;
  colorWarning: string;
  colorWarningActive: string;
  colorWarningTextHover: string;
  colorWarningText: string;
  colorWarningTextActive: string;
}

interface ColorInfoMapToken {
  colorInfoBg: string;
  colorInfoBgHover: string;
  colorInfoBorder: string;
  colorInfoBorderHover: string;
  colorInfoHover: string;
  colorInfo: string;
  colorInfoActive: string;
  colorInfoTextHover: string;
  colorInfoText: string;
  colorInfoTextActive: string;
}

interface ColorErrorMapToken {
  colorErrorBg: string;
  colorErrorBgHover: string;
  colorErrorBgFilledHover: string;
  colorErrorBgActive: string;
  colorErrorBorder: string;
  colorErrorBorderHover: string;
  colorErrorHover: string;
  colorError: string;
  colorErrorActive: string;
  colorErrorTextHover: string;
  colorErrorText: string;
  colorErrorTextActive: string;
}

export interface ColorLinkMapToken {
  colorLink: string;
  colorLinkHover: string;
  colorLinkActive: string;
}

export interface ColorMapToken
  extends ColorNeutralMapToken,
    ColorPrimaryMapToken,
    ColorSuccessMapToken,
    ColorWarningMapToken,
    ColorErrorMapToken,
    ColorInfoMapToken,
    ColorLinkMapToken {
  colorWhite: string;
  colorBgMask: string;
}

export interface FontMapToken {
  fontSizeSM: number;
  fontSize: number;
  fontSizeLG: number;
  fontSizeXL: number;
  fontSizeHeading1: number | string;
  fontSizeHeading2: number | string;
  fontSizeHeading3: number | string;
  fontSizeHeading4: number | string;
  fontSizeHeading5: number | string;
  lineHeight: number;
  lineHeightLG: number;
  lineHeightSM: number;
  fontHeight: number;
  fontHeightSM: number;
  fontHeightLG: number;
  lineHeightHeading1: number;
  lineHeightHeading2: number;
  lineHeightHeading3: number;
  lineHeightHeading4: number;
  lineHeightHeading5: number;
}

export interface SizeMapToken {
  sizeXXL: number;
  sizeXL: number;
  sizeLG: number;
  sizeMD: number;
  sizeMS: number;
  size: number;
  sizeSM: number;
  sizeXS: number;
  sizeXXS: number;
}

export interface HeightMapToken {
  controlHeightXS: number;
  controlHeightSM: number;
  controlHeightLG: number;
}

export interface StyleMapToken {
  lineWidthBold: number;
  borderRadiusXS: number;
  borderRadiusSM: number;
  borderRadiusLG: number;
  borderRadiusOuter: number;
}

export interface CommonMapToken extends StyleMapToken {
  motionDurationFast: string;
  motionDurationMid: string;
  motionDurationSlow: string;
}

/** Результат MappingAlgorithm до применения alias overrides. */
export interface MapToken
  extends SeedToken,
    ColorPalettes,
    LegacyColorPalettes,
    ColorMapToken,
    SizeMapToken,
    HeightMapToken,
    StyleMapToken,
    FontMapToken,
    CommonMapToken {}

/** Полный статический AliasToken; CSS text-decoration представлен строкой. */
export interface AliasToken extends MapToken {
  colorFillContentHover: string;
  colorFillAlter: string;
  colorFillContent: string;
  colorBgContainerDisabled: string;
  colorBgTextHover: string;
  colorBgTextActive: string;
  colorBorderBg: string;
  colorSplit: string;
  colorTextPlaceholder: string;
  colorTextDisabled: string;
  colorTextHeading: string;
  colorTextLabel: string;
  colorTextDescription: string;
  colorTextLightSolid: string;
  colorIcon: string;
  colorIconHover: string;
  colorHighlight: string;
  controlOutline: string;
  colorWarningOutline: string;
  colorErrorOutline: string;
  colorErrorAffix: string;
  colorWarningAffix: string;
  fontSizeIcon: number;
  fontWeightStrong: number;
  controlOutlineWidth: number;
  controlItemBgHover: string;
  controlItemBgActive: string;
  controlItemBgActiveHover: string;
  controlInteractiveSize: number;
  controlItemBgActiveDisabled: string;
  lineWidthFocus: number;
  paddingXXS: number;
  paddingXS: number;
  paddingSM: number;
  padding: number;
  paddingMD: number;
  paddingLG: number;
  paddingXL: number;
  paddingContentHorizontalLG: number;
  paddingContentHorizontal: number;
  paddingContentHorizontalSM: number;
  paddingContentVerticalLG: number;
  paddingContentVertical: number;
  paddingContentVerticalSM: number;
  marginXXS: number;
  marginXS: number;
  marginSM: number;
  margin: number;
  marginMD: number;
  marginLG: number;
  marginXL: number;
  marginXXL: number;
  opacityLoading: number;
  boxShadow: string;
  boxShadowSecondary: string;
  boxShadowTertiary: string;
  linkDecoration: string;
  linkHoverDecoration: string;
  linkFocusDecoration: string;
  controlPaddingHorizontal: number;
  controlPaddingHorizontalSM: number;
  screenXS: number;
  screenXSMin: number;
  screenXSMax: number;
  screenSM: number;
  screenSMMin: number;
  screenSMMax: number;
  screenMD: number;
  screenMDMin: number;
  screenMDMax: number;
  screenLG: number;
  screenLGMin: number;
  screenLGMax: number;
  screenXL: number;
  screenXLMin: number;
  screenXLMax: number;
  screenXXL: number;
  screenXXLMin: number;
  screenXXLMax: number;
  screenXXXL: number;
  screenXXXLMin: number;
  controlTmpOutline: string;
  boxShadowPopoverArrow: string;
  dropShadowPopover: string;
  boxShadowCard: string;
  boxShadowDrawerRight: string;
  boxShadowDrawerLeft: string;
  boxShadowDrawerUp: string;
  boxShadowDrawerDown: string;
  boxShadowTabsOverflowLeft: string;
  boxShadowTabsOverflowRight: string;
  boxShadowTabsOverflowTop: string;
  boxShadowTabsOverflowBottom: string;
}

/** Алгоритм получает исходный seed и результат предыдущего шага цепочки. */
export type MappingAlgorithm = (seed: SeedToken, mapToken?: MapToken) => MapToken;

/** Статический расчёт токенов; не меняет оформление ConfigProvider. */
export interface DesignTokenConfig {
  /** Seed overrides подаются алгоритмам; остальные поля перекрывают рассчитанные aliases. */
  token?: Partial<AliasToken>;
  /** Порядок алгоритмов сохраняется; по умолчанию defaultAlgorithm. */
  algorithm?: MappingAlgorithm | readonly MappingAlgorithm[];
}
