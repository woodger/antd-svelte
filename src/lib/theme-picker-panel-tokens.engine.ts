import { FastColor } from './fast-color.engine';
import type { AliasToken } from './theme-token.types';

export function preparePickerPanelTokens(token: AliasToken) {
  const padding = token.paddingXXS * 2;
  const border = token.lineWidth * 2;

  return {
    INTERNAL_FIXED_ITEM_MARGIN: Math.floor(token.paddingXXS / 2),
    cellHoverBg: token.controlItemBgHover,
    cellActiveWithRangeBg: token.controlItemBgActive,
    cellHoverWithRangeBg: new FastColor(token.colorPrimary).lighten(35).toHexString(),
    cellRangeBorderColor: new FastColor(token.colorPrimary).lighten(20).toHexString(),
    cellBgDisabled: token.colorBgContainerDisabled,
    timeColumnWidth: token.controlHeightLG * 1.4,
    timeColumnHeight: 28 * 8,
    timeCellHeight: 28,
    cellWidth: token.controlHeightSM * 1.5,
    cellHeight: token.controlHeightSM,
    textHeight: token.controlHeightLG,
    withoutTimeCellHeight: token.controlHeightLG * 1.65,
    multipleItemBg: token.colorFillSecondary,
    multipleItemBorderColor: 'transparent',
    multipleItemHeight: Math.min(token.controlHeight - padding, token.controlHeight - border),
    multipleItemHeightSM: Math.min(token.controlHeightSM - padding, token.controlHeightSM - border),
    multipleItemHeightLG: Math.min(token.controlHeightLG - padding, token.controlHeightLG - border),
    multipleSelectorBgDisabled: token.colorBgContainerDisabled,
    multipleItemColorDisabled: token.colorTextDisabled,
    multipleItemBorderColorDisabled: 'transparent'
  };
}
