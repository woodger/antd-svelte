import type { GlobalToken, TabsComponentToken } from './theme-component-token.types';

/** prepareComponentToken Tabs 6.6.8: custom heights участвуют в расчёте defaults padding. */
export function prepareTabsTokens(token: GlobalToken & Partial<TabsComponentToken>) {
  const cardHeight = token.cardHeight || token.controlHeightLG;
  const cardHeightSM = token.cardHeightSM || token.controlHeight;
  const cardHeightLG = token.cardHeightLG || token.controlHeightLG + 8;

  return {
    zIndexPopup: token.zIndexPopupBase + 50,
    cardBg: token.colorFillAlter,
    cardHeight,
    cardHeightSM,
    cardHeightLG,
    cardPadding: `${(cardHeight - token.fontHeight) / 2 - token.lineWidth}px ${token.padding}px`,
    cardPaddingSM: `${(cardHeightSM - token.fontHeight) / 2 - token.lineWidth}px ${token.paddingXS}px`,
    cardPaddingLG: `${(cardHeightLG - token.fontHeightLG) / 2 - token.lineWidth}px ${token.padding}px`,
    titleFontSize: token.fontSize,
    titleFontSizeLG: token.fontSizeLG,
    titleFontSizeSM: token.fontSize,
    inkBarColor: token.colorPrimary,
    horizontalMargin: `0 0 ${token.margin}px 0`,
    horizontalItemGutter: 32,
    horizontalItemMargin: '',
    horizontalItemMarginRTL: '',
    horizontalItemPadding: `${token.paddingSM}px 0`,
    horizontalItemPaddingSM: `${token.paddingXS}px 0`,
    horizontalItemPaddingLG: `${token.padding}px 0`,
    verticalItemPadding: `${token.paddingXS}px ${token.paddingLG}px`,
    verticalItemMargin: `${token.margin}px 0 0 0`,
    itemColor: token.colorText,
    itemSelectedColor: token.colorPrimary,
    itemHoverColor: token.colorPrimaryHover,
    itemActiveColor: token.colorPrimaryActive,
    cardGutter: token.marginXXS / 2
  };
}
