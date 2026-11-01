import { defaultPresetColors } from './theme-seed';
import { presetPalettes, presetPrimaryColors } from './theme-palettes';
import { generatePalette } from './theme-palette.engine';
import {
  generateLightColorPalettes,
  generateLightNeutralColors,
  generateDarkColorPalettes,
  generateDarkNeutralColors,
  genColorMapToken
} from './theme-color.engine';
import {
  genCommonMapToken,
  genControlHeight,
  genFontMapToken,
  genSizeMapToken,
  genCompactSizeMapToken
} from './theme-metrics.engine';
import { presetColors } from './theme-token.types';
import type {
  ColorPalettes,
  LegacyColorPalettes,
  MapToken,
  PresetColorKey,
  SeedToken
} from './theme-token.types';

function getPresetTokens(seed: SeedToken, dark = false): ColorPalettes & LegacyColorPalettes {
  const palettes: Record<string, string> = {};

  for (const name of Object.keys(defaultPresetColors) as PresetColorKey[]) {
    let colors: readonly string[];
    if (dark) colors = generatePalette(seed[name], { theme: 'dark' });
    else if (seed[name] === presetPrimaryColors[name]) colors = presetPalettes[name];
    else colors = generatePalette(seed[name]);

    for (let index = 0; index < 10; index++) {
      palettes[`${name}-${index + 1}`] = colors[index];
      palettes[`${name}${index + 1}`] = colors[index];
    }
  }

  // Закреплённый каталог создаёт все 13 × 10 ключей в двух исходных нотациях.
  return palettes as ColorPalettes & LegacyColorPalettes;
}

/** Исходный defaultAlgorithm: seed → MapToken, без alias overrides и UI side effects. */
export function defaultAlgorithm(seed: SeedToken): MapToken {
  return {
    ...seed,
    ...getPresetTokens(seed),
    ...genColorMapToken(seed, {
      generateColorPalettes: generateLightColorPalettes,
      generateNeutralColorPalettes: generateLightNeutralColors
    }),
    ...genFontMapToken(seed.fontSize),
    ...genSizeMapToken(seed),
    ...genControlHeight(seed),
    ...genCommonMapToken(seed)
  };
}

/** При наличии mapToken продолжает цепочку; иначе сначала вызывает defaultAlgorithm. */
export function darkAlgorithm(seed: SeedToken, mapToken?: MapToken): MapToken {
  const colorPalettes = getPresetTokens(seed, true);
  const mergedMapToken = mapToken ?? defaultAlgorithm(seed);
  const colorMap = genColorMapToken(seed, {
    generateColorPalettes: generateDarkColorPalettes,
    generateNeutralColorPalettes: generateDarkNeutralColors
  });
  const states: Record<string, string> = {};

  for (const name of presetColors) {
    if (!seed[name]) continue;

    const palette = generateDarkColorPalettes(seed[name]);
    states[`${name}Hover`] = palette[7];
    states[`${name}Active`] = palette[5];
  }

  return {
    ...mergedMapToken,
    ...colorPalettes,
    ...colorMap,
    ...states,
    colorPrimaryBg: colorMap.colorPrimaryBorder,
    colorPrimaryBgHover: colorMap.colorPrimaryBorderHover
  };
}

/** Сохраняет цвета предыдущего шага и пересчитывает исходные compact размеры. */
export function compactAlgorithm(seed: SeedToken, mapToken?: MapToken): MapToken {
  const mergedMapToken = mapToken ?? defaultAlgorithm(seed);
  const fontSize = mergedMapToken.fontSizeSM;
  const controlHeight = mergedMapToken.controlHeight - 4;

  return {
    ...mergedMapToken,
    ...genCompactSizeMapToken(mapToken ?? seed),
    ...genFontMapToken(fontSize),
    controlHeight,
    ...genControlHeight({ ...mergedMapToken, controlHeight })
  };
}
