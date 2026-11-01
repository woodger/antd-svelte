import type { AliasToken } from './theme-token.types';

export function prepareSelectTokens(token: AliasToken) {
  const padding = token.paddingXXS * 2;
  const border = token.lineWidth * 2;

  return {
    lineWidthFocus: token.lineWidthFocus === 0 ? 0 : token.lineWidth,
    INTERNAL_FIXED_ITEM_MARGIN: Math.floor(token.paddingXXS / 2),
    zIndexPopup: token.zIndexPopupBase + 50,
    optionSelectedColor: token.colorText,
    optionSelectedFontWeight: token.fontWeightStrong,
    optionSelectedBg: token.controlItemBgActive,
    optionActiveBg: token.controlItemBgHover,
    optionPadding: `${(token.controlHeight - token.fontSize * token.lineHeight) / 2}px ${token.controlPaddingHorizontal}px`,
    optionFontSize: token.fontSize,
    optionLineHeight: token.lineHeight,
    optionHeight: token.controlHeight,
    selectorBg: token.colorBgContainer,
    clearBg: token.colorBgContainer,
    singleItemHeightLG: token.controlHeightLG,
    multipleItemBg: token.colorFillSecondary,
    multipleItemBorderColor: 'transparent',
    multipleItemHeight: Math.min(token.controlHeight - padding, token.controlHeight - border),
    multipleItemHeightSM: Math.min(token.controlHeightSM - padding, token.controlHeightSM - border),
    multipleItemHeightLG: Math.min(token.controlHeightLG - padding, token.controlHeightLG - border),
    multipleSelectorBgDisabled: token.colorBgContainerDisabled,
    multipleItemColorDisabled: token.colorTextDisabled,
    multipleItemBorderColorDisabled: 'transparent',
    showArrowPaddingInlineEnd: Math.ceil(token.fontSize * 1.25),
    hoverBorderColor: token.colorPrimaryHover,
    activeBorderColor: token.colorPrimary,
    activeOutlineColor: token.controlOutline,
    selectAffixPadding: token.paddingXXS
  };
}
