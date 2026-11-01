import type { AliasToken } from './theme-token.types';

export function prepareAvatarTokens(token: AliasToken) {
  return {
    containerSize: token.controlHeight,
    containerSizeLG: token.controlHeightLG,
    containerSizeSM: token.controlHeightSM,
    textFontSize: token.fontSize,
    textFontSizeLG: token.fontSize,
    textFontSizeSM: token.fontSize,
    iconFontSize: Math.round((token.fontSizeLG + token.fontSizeXL) / 2),
    iconFontSizeLG: token.fontSizeHeading3,
    iconFontSizeSM: token.fontSize,
    groupSpace: token.marginXXS,
    groupOverlapping: -token.marginXS,
    groupBorderColor: token.colorBorderBg
  };
}

export function prepareBadgeTokens(token: AliasToken) {
  return {
    indicatorZIndex: 'auto',
    indicatorHeight: Math.round(token.fontSize * token.lineHeight) - 2 * token.lineWidth,
    indicatorHeightSM: token.fontSize,
    dotSize: token.fontSizeSM / 2,
    textFontSize: token.fontSizeSM,
    textFontSizeSM: token.fontSizeSM,
    textFontWeight: 'normal',
    statusSize: token.fontSizeSM / 2,
    paddingInline: token.paddingXS
  };
}
