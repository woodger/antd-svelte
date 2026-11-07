import { FastColor } from './fast-color.engine';
import { generatePalette } from './theme-palette.engine';
import { presetColors } from './theme-token.types';
import { defaultPresetColors } from './theme-seed';
import type { ColorMapToken, ColorNeutralMapToken, SeedToken } from './theme-token.types';

export interface ColorMap {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
}

export type GenerateColorMap = (baseColor: string) => ColorMap;

export type GenerateNeutralColorMap = (
  bgBaseColor: string,
  textBaseColor: string,
  shadowColor?: string,
) => ColorNeutralMapToken;

function getAlphaColor(baseColor: string, alpha: number) {
  return new FastColor(baseColor).setA(alpha).toRgbString();
}

function getLightSolidColor(baseColor: string, brightness: number) {
  return new FastColor(baseColor).darken(brightness).toHexString();
}

function getDarkSolidColor(baseColor: string, brightness: number) {
  return new FastColor(baseColor).lighten(brightness).toHexString();
}

export const generateLightColorPalettes: GenerateColorMap = (baseColor: string) => {
  const colors = generatePalette(baseColor);
  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],
    5: colors[4],
    6: colors[5],
    7: colors[6],
    8: colors[4],
    9: colors[5],
    10: colors[6],
  };
};

export const generateLightNeutralColors: GenerateNeutralColorMap = (
  bgBaseColor: string,
  textBaseColor: string,
  shadowColor?: string,
) => {
  const colorBgBase = bgBaseColor || '#fff';
  const colorTextBase = textBaseColor || '#000';
  const colorShadow = shadowColor || '#000';

  return {
    colorBgBase,
    colorTextBase,
    colorShadow,

    colorText: getAlphaColor(colorTextBase, 0.88),
    colorTextSecondary: getAlphaColor(colorTextBase, 0.65),
    colorTextTertiary: getAlphaColor(colorTextBase, 0.45),
    colorTextQuaternary: getAlphaColor(colorTextBase, 0.25),

    colorFill: getAlphaColor(colorTextBase, 0.15),
    colorFillSecondary: getAlphaColor(colorTextBase, 0.06),
    colorFillTertiary: getAlphaColor(colorTextBase, 0.04),
    colorFillQuaternary: getAlphaColor(colorTextBase, 0.02),

    colorBgSolid: getAlphaColor(colorTextBase, 1),
    colorBgSolidHover: getAlphaColor(colorTextBase, 0.75),
    colorBgSolidActive: getAlphaColor(colorTextBase, 0.95),

    colorBgLayout: getLightSolidColor(colorBgBase, 4),
    colorBgContainer: getLightSolidColor(colorBgBase, 0),
    colorBgElevated: getLightSolidColor(colorBgBase, 0),
    colorBgSpotlight: getAlphaColor(colorTextBase, 0.85),
    colorBgBlur: 'transparent',

    colorBorder: getLightSolidColor(colorBgBase, 15),
    colorBorderDisabled: getLightSolidColor(colorBgBase, 15),
    colorBorderSecondary: getLightSolidColor(colorBgBase, 6),
  };
};

export const generateDarkColorPalettes: GenerateColorMap = (baseColor: string) => {
  const colors = generatePalette(baseColor, { theme: 'dark' });
  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],
    5: colors[6],
    6: colors[5],
    7: colors[4],
    8: colors[6],
    9: colors[5],
    10: colors[4],
  };
};

export const generateDarkNeutralColors: GenerateNeutralColorMap = (
  bgBaseColor: string,
  textBaseColor: string,
  shadowColor?: string,
) => {
  const colorBgBase = bgBaseColor || '#000';
  const colorTextBase = textBaseColor || '#fff';
  const colorShadow = shadowColor || 'rgba(255, 255, 255, 0.2)';

  return {
    colorBgBase,
    colorTextBase,
    colorShadow,

    colorText: getAlphaColor(colorTextBase, 0.85),
    colorTextSecondary: getAlphaColor(colorTextBase, 0.65),
    colorTextTertiary: getAlphaColor(colorTextBase, 0.45),
    colorTextQuaternary: getAlphaColor(colorTextBase, 0.25),

    colorFill: getAlphaColor(colorTextBase, 0.18),
    colorFillSecondary: getAlphaColor(colorTextBase, 0.12),
    colorFillTertiary: getAlphaColor(colorTextBase, 0.08),
    colorFillQuaternary: getAlphaColor(colorTextBase, 0.04),

    colorBgSolid: getAlphaColor(colorTextBase, 0.95),
    colorBgSolidHover: getAlphaColor(colorTextBase, 1),
    colorBgSolidActive: getAlphaColor(colorTextBase, 0.9),

    colorBgElevated: getDarkSolidColor(colorBgBase, 12),
    colorBgContainer: getDarkSolidColor(colorBgBase, 8),
    colorBgLayout: getDarkSolidColor(colorBgBase, 0),
    colorBgSpotlight: getDarkSolidColor(colorBgBase, 26),
    colorBgBlur: getAlphaColor(colorTextBase, 0.04),

    colorBorder: getDarkSolidColor(colorBgBase, 26),
    colorBorderDisabled: getDarkSolidColor(colorBgBase, 26),
    colorBorderSecondary: getDarkSolidColor(colorBgBase, 19),
  };
};

interface PaletteGenerators {
  generateColorPalettes: GenerateColorMap;
  generateNeutralColorPalettes: GenerateNeutralColorMap;
}

export function genColorMapToken(
  seed: SeedToken,
  { generateColorPalettes, generateNeutralColorPalettes }: PaletteGenerators,
): ColorMapToken {
  const {
    colorSuccess: colorSuccessBase,
    colorWarning: colorWarningBase,
    colorError: colorErrorBase,
    colorInfo: colorInfoBase,
    colorPrimary: colorPrimaryBase,
    colorBgBase,
    colorTextBase,
  } = seed;

  const primaryColors = generateColorPalettes(colorPrimaryBase);
  const successColors = generateColorPalettes(colorSuccessBase);
  const warningColors = generateColorPalettes(colorWarningBase);
  const errorColors = generateColorPalettes(colorErrorBase);
  const infoColors = generateColorPalettes(colorInfoBase);
  const neutralColors = generateNeutralColorPalettes(colorBgBase, colorTextBase);

  const colorLink = seed.colorLink || seed.colorInfo;
  const linkColors = generateColorPalettes(colorLink);

  const colorErrorBgFilledHover = new FastColor(errorColors[1])
    .mix(new FastColor(errorColors[3]), 50)
    .toHexString();

  const presetColorTokens: Record<string, string> = {};
  presetColors.forEach((colorKey) => {
    const colorBase = colorKey === 'pink' ? defaultPresetColors.pink : seed[colorKey];
    if (colorBase) {
      const colorPalette = generateColorPalettes(colorBase);
      presetColorTokens[`${colorKey}Hover`] = colorPalette[5];
      presetColorTokens[`${colorKey}Active`] = colorPalette[7];
    }
  });

  return {
    ...neutralColors,

    colorPrimaryBg: primaryColors[1],
    colorPrimaryBgHover: primaryColors[2],
    colorPrimaryBorder: primaryColors[3],
    colorPrimaryBorderHover: primaryColors[4],
    colorPrimaryHover: primaryColors[5],
    colorPrimary: primaryColors[6],
    colorPrimaryActive: primaryColors[7],
    colorPrimaryTextHover: primaryColors[8],
    colorPrimaryText: primaryColors[9],
    colorPrimaryTextActive: primaryColors[10],

    colorSuccessBg: successColors[1],
    colorSuccessBgHover: successColors[2],
    colorSuccessBorder: successColors[3],
    colorSuccessBorderHover: successColors[4],
    colorSuccessHover: successColors[4],
    colorSuccess: successColors[6],
    colorSuccessActive: successColors[7],
    colorSuccessTextHover: successColors[8],
    colorSuccessText: successColors[9],
    colorSuccessTextActive: successColors[10],

    colorErrorBg: errorColors[1],
    colorErrorBgHover: errorColors[2],
    colorErrorBgFilledHover,
    colorErrorBgActive: errorColors[3],
    colorErrorBorder: errorColors[3],
    colorErrorBorderHover: errorColors[4],
    colorErrorHover: errorColors[5],
    colorError: errorColors[6],
    colorErrorActive: errorColors[7],
    colorErrorTextHover: errorColors[8],
    colorErrorText: errorColors[9],
    colorErrorTextActive: errorColors[10],

    colorWarningBg: warningColors[1],
    colorWarningBgHover: warningColors[2],
    colorWarningBorder: warningColors[3],
    colorWarningBorderHover: warningColors[4],
    colorWarningHover: warningColors[4],
    colorWarning: warningColors[6],
    colorWarningActive: warningColors[7],
    colorWarningTextHover: warningColors[8],
    colorWarningText: warningColors[9],
    colorWarningTextActive: warningColors[10],

    colorInfoBg: infoColors[1],
    colorInfoBgHover: infoColors[2],
    colorInfoBorder: infoColors[3],
    colorInfoBorderHover: infoColors[4],
    colorInfoHover: infoColors[4],
    colorInfo: infoColors[6],
    colorInfoActive: infoColors[7],
    colorInfoTextHover: infoColors[8],
    colorInfoText: infoColors[9],
    colorInfoTextActive: infoColors[10],

    colorLinkHover: linkColors[4],
    colorLink: linkColors[6],
    colorLinkActive: linkColors[7],

    ...presetColorTokens,

    colorBgMask: new FastColor('#000').setA(0.45).toRgbString(),
    colorWhite: '#fff',
  };
}
