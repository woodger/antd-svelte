import type { AliasToken } from './theme-token.types';
import { FastColor } from './fast-color.engine';

export function prepareSliderTokens(token: AliasToken) {
  const controlSize = token.controlHeightLG / 4;
  const handleActiveColor = token.colorPrimary;

  return {
    controlSize,
    railSize: 4,
    handleSize: controlSize,
    handleSizeHover: token.controlHeightSM / 2,
    dotSize: 8,
    handleLineWidth: token.lineWidth + 1,
    handleLineWidthHover: token.lineWidth + 1.5,
    railBg: token.colorFillTertiary,
    railHoverBg: token.colorFillSecondary,
    trackBg: token.colorPrimaryBorder,
    trackHoverBg: token.colorPrimaryBorderHover,
    handleColor: token.colorPrimaryBorder,
    handleActiveColor,
    handleActiveOutlineColor: new FastColor(handleActiveColor).setA(0.2).toRgbString(),
    handleColorDisabled: new FastColor(token.colorTextDisabled)
      .onBackground(token.colorBgContainer).toHexString(),
    dotBorderColor: token.colorBorderSecondary,
    dotActiveBorderColor: token.colorPrimaryBorder,
    trackBgDisabled: token.colorBgContainerDisabled
  };
}
