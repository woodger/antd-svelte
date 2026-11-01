import { FastColor } from './fast-color.engine';
import { AggregationColor } from './color';
import { isBrightColor } from './color-picker.engine';
import { getAlphaColor } from './theme-alias.engine';
import { presetColors, type AliasToken } from './theme-token.types';
import type {
  ButtonComponentToken,
  InputComponentToken,
  InputNumberComponentToken
} from './theme-component-token.types';

/** Исходный Button prepareComponentToken, включая runtime preset shadow keys. */
export function prepareButtonTokens(token: AliasToken & Partial<ButtonComponentToken>) {
  const contentFontSize = token.contentFontSize ?? token.fontSize;
  const contentFontSizeSM = token.contentFontSizeSM ?? token.fontSize;
  const contentFontSizeLG = token.contentFontSizeLG ?? token.fontSizeLG;
  const contentLineHeight = token.contentLineHeight ?? (contentFontSize + 8) / contentFontSize;
  const contentLineHeightSM = token.contentLineHeightSM ?? (contentFontSizeSM + 8) / contentFontSizeSM;
  const contentLineHeightLG = token.contentLineHeightLG ?? (contentFontSizeLG + 8) / contentFontSizeLG;
  const solidTextColor = isBrightColor(new AggregationColor(token.colorBgSolid), '#fff')
    ? '#000' : '#fff';
  const shadows: Record<string, string> = {};
  for (const color of presetColors) {
    shadows[`${color}ShadowColor`] = `0 ${token.controlOutlineWidth}px 0 ${getAlphaColor(
      token[`${color}1`], token.colorBgContainer
    )}`;
  }

  return {
    ...shadows,
    fontWeight: 400,
    iconGap: token.marginXS,
    defaultShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlTmpOutline}`,
    primaryShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlOutline}`,
    dangerShadow: `0 ${token.controlOutlineWidth}px 0 ${token.colorErrorOutline}`,
    primaryColor: token.colorTextLightSolid,
    dangerColor: token.colorTextLightSolid,
    borderColorDisabled: token.colorBorderDisabled,
    defaultGhostColor: token.colorBgContainer,
    ghostBg: 'transparent',
    defaultGhostBorderColor: token.colorBgContainer,
    paddingInline: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineLG: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineSM: 8 - token.lineWidth,
    onlyIconSize: 'inherit',
    onlyIconSizeSM: 'inherit',
    onlyIconSizeLG: 'inherit',
    groupBorderColor: token.colorPrimaryHover,
    linkHoverBg: 'transparent',
    textTextColor: token.colorText,
    textTextHoverColor: token.colorText,
    textTextActiveColor: token.colorText,
    textHoverBg: token.colorFillTertiary,
    defaultColor: token.colorText,
    defaultBg: token.colorBgContainer,
    defaultBorderColor: token.colorBorder,
    defaultBorderColorDisabled: token.colorBorder,
    defaultHoverBg: token.colorBgContainer,
    defaultHoverColor: token.colorPrimaryHover,
    defaultHoverBorderColor: token.colorPrimaryHover,
    defaultActiveBg: token.colorBgContainer,
    defaultActiveColor: token.colorPrimaryActive,
    defaultActiveBorderColor: token.colorPrimaryActive,
    solidTextColor,
    contentFontSize,
    contentFontSizeSM,
    contentFontSizeLG,
    contentLineHeight,
    contentLineHeightSM,
    contentLineHeightLG,
    paddingBlock: Math.max(
      (token.controlHeight - contentFontSize * contentLineHeight) / 2 - token.lineWidth, 0
    ),
    paddingBlockSM: Math.max(
      (token.controlHeightSM - contentFontSizeSM * contentLineHeightSM) / 2 - token.lineWidth, 0
    ),
    paddingBlockLG: Math.max(
      (token.controlHeightLG - contentFontSizeLG * contentLineHeightLG) / 2 - token.lineWidth, 0
    ),
    defaultBgDisabled: token.colorBgContainerDisabled,
    dashedBgDisabled: token.colorBgContainerDisabled
  };
}

/** Shared Input/TextArea tokens: SM использует lineHeight, LG округляет padding вверх. */
export function prepareInputTokens(token: AliasToken & Partial<InputComponentToken>) {
  const fontSize = token.inputFontSize || token.fontSize;
  const fontSizeSM = token.inputFontSizeSM || fontSize;
  const fontSizeLG = token.inputFontSizeLG || token.fontSizeLG;
  const padding = (height: number, font: number, lineHeight: number, large = false) => {
    const value = ((height - font * lineHeight) / 2) * 10;
    return Math.max((large ? Math.ceil(value) : Math.round(value)) / 10 - token.lineWidth, 0);
  };

  return {
    lineWidthFocus: token.lineWidthFocus === 0 ? 0 : token.lineWidth,
    paddingBlock: padding(token.controlHeight, fontSize, token.lineHeight),
    paddingBlockSM: padding(token.controlHeightSM, fontSizeSM, token.lineHeight),
    paddingBlockLG: padding(token.controlHeightLG, fontSizeLG, token.lineHeightLG, true),
    paddingInline: token.paddingSM - token.lineWidth,
    paddingInlineSM: token.controlPaddingHorizontalSM - token.lineWidth,
    paddingInlineLG: token.controlPaddingHorizontal - token.lineWidth,
    addonBg: token.colorFillAlter,
    activeBorderColor: token.colorPrimary,
    hoverBorderColor: token.colorPrimaryHover,
    activeShadow: `0 0 0 ${token.controlOutlineWidth}px ${token.controlOutline}`,
    errorActiveShadow: `0 0 0 ${token.controlOutlineWidth}px ${token.colorErrorOutline}`,
    warningActiveShadow: `0 0 0 ${token.controlOutlineWidth}px ${token.colorWarningOutline}`,
    hoverBg: token.colorBgContainer,
    activeBg: token.colorBgContainer,
    inputFontSize: fontSize,
    inputFontSizeLG: fontSizeLG,
    inputFontSizeSM: fontSizeSM
  };
}

export function prepareInputNumberTokens(token: AliasToken & Partial<InputNumberComponentToken>) {
  const handleVisible = token.handleVisible ?? 'auto';
  const handleWidth = token.controlHeightSM - token.lineWidth * 2;

  return {
    ...prepareInputTokens(token),
    controlWidth: 90,
    handleWidth,
    handleFontSize: token.fontSize / 2,
    handleVisible,
    handleActiveBg: token.colorFillAlter,
    handleBg: token.colorBgContainer,
    filledHandleBg: new FastColor(token.colorFillSecondary).onBackground(token.colorBgContainer)
      .toHexString(),
    handleHoverColor: token.colorPrimary,
    handleBorderColor: token.colorBorder,
    handleOpacity: handleVisible === true ? 1 : 0,
    handleVisibleWidth: handleVisible === true ? handleWidth : 0
  };
}

/** Размер dot вычисляется из fontSizeLG и wireframe до final radioSize/dotSize overrides. */
export function prepareRadioTokens(token: AliasToken) {
  const radioSize = token.fontSizeLG;
  const dotSize = token.wireframe ? radioSize - 8 : radioSize - (4 + token.lineWidth) * 2;

  return {
    radioSize,
    dotSize,
    dotColorDisabled: token.colorTextDisabled,
    buttonSolidCheckedColor: token.colorTextLightSolid,
    buttonSolidCheckedBg: token.colorPrimary,
    buttonSolidCheckedHoverBg: token.colorPrimaryHover,
    buttonSolidCheckedActiveBg: token.colorPrimaryActive,
    buttonBg: token.colorBgContainer,
    buttonCheckedBg: token.colorBgContainer,
    buttonColor: token.colorText,
    buttonCheckedBgDisabled: token.controlItemBgActiveDisabled,
    buttonCheckedColorDisabled: token.colorTextDisabled,
    buttonPaddingInline: token.padding - token.lineWidth,
    wrapperMarginInlineEnd: token.marginXS,
    radioColor: token.wireframe ? token.colorPrimary : token.colorWhite,
    radioBgColor: token.wireframe ? token.colorBgContainer : token.colorPrimary
  };
}

/** Source Switch metrics используют фиксированный padding=2, включая small-вариант. */
export function prepareSwitchTokens(token: AliasToken) {
  const height = token.fontSize * token.lineHeight;
  const heightSM = token.controlHeight / 2;
  const padding = 2;
  const handleSize = height - padding * 2;
  const handleSizeSM = heightSM - padding * 2;

  return {
    trackHeight: height,
    trackHeightSM: heightSM,
    trackMinWidth: handleSize * 2 + padding * 4,
    trackMinWidthSM: handleSizeSM * 2 + padding * 2,
    trackPadding: padding,
    handleBg: token.colorWhite,
    handleSize,
    handleSizeSM,
    handleShadow: `0 2px 4px 0 ${new FastColor('#00230b').setA(.2).toRgbString()}`,
    innerMinMargin: handleSize / 2,
    innerMaxMargin: handleSize + padding + padding * 2,
    innerMinMarginSM: handleSizeSM / 2,
    innerMaxMarginSM: handleSizeSM + padding + padding * 2
  };
}
