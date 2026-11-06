import { FastColor } from './fast-color.engine';
import type { AliasToken } from './theme-token.types';

/** Component defaults Table 6.6.8, включая непрозрачные подложки и метрики expand icon. */
export function prepareTableTokens(token: AliasToken) {
  const fillAlter = new FastColor(token.colorFillAlter)
    .onBackground(token.colorBgContainer).toHexString();
  const fillSecondary = new FastColor(token.colorFillSecondary)
    .onBackground(token.colorBgContainer).toHexString();
  const fillContent = new FastColor(token.colorFillContent)
    .onBackground(token.colorBgContainer).toHexString();
  const icon = new FastColor(token.colorIcon);
  const iconHover = new FastColor(token.colorIconHover);
  const expandIconHalfInner = token.controlInteractiveSize / 2 - token.lineWidth;
  const expandIconSize = expandIconHalfInner * 2 + token.lineWidth * 3;

  return {
    headerBg: fillAlter,
    headerColor: token.colorTextHeading,
    headerSortActiveBg: fillSecondary,
    headerSortHoverBg: fillContent,
    bodySortBg: fillAlter,
    rowHoverBg: fillAlter,
    rowSelectedBg: token.controlItemBgActive,
    rowSelectedHoverBg: token.controlItemBgActiveHover,
    rowExpandedBg: token.colorFillAlter,
    cellPaddingBlock: token.padding,
    cellPaddingInline: token.padding,
    cellPaddingBlockMD: token.paddingSM,
    cellPaddingInlineMD: token.paddingXS,
    cellPaddingBlockSM: token.paddingXS,
    cellPaddingInlineSM: token.paddingXS,
    borderColor: token.colorBorderSecondary,
    headerBorderRadius: token.borderRadiusLG,
    footerBg: fillAlter,
    footerColor: token.colorTextHeading,
    cellFontSize: token.fontSize,
    cellFontSizeMD: token.fontSize,
    cellFontSizeSM: token.fontSize,
    headerSplitColor: token.colorBorderSecondary,
    fixedHeaderSortActiveBg: fillSecondary,
    headerFilterHoverBg: token.colorFillContent,
    filterDropdownMenuBg: token.colorBgContainer,
    filterDropdownBg: token.colorBgContainer,
    expandIconBg: token.colorBgContainer,
    selectionColumnWidth: token.controlHeight,
    stickyScrollBarBg: token.colorTextPlaceholder,
    stickyScrollBarBorderRadius: 100,
    expandIconMarginTop: (token.fontSize * token.lineHeight - token.lineWidth * 3) / 2
      - Math.ceil((token.fontSizeSM * 1.4 - token.lineWidth * 3) / 2),
    headerIconColor: icon.clone().setA(icon.a * token.opacityLoading).toRgbString(),
    headerIconHoverColor: iconHover.clone().setA(iconHover.a * token.opacityLoading).toRgbString(),
    expandIconHalfInner,
    expandIconSize,
    expandIconScale: token.controlInteractiveSize / expandIconSize
  };
}
