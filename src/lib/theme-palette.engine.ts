import { FastColor, type ColorHsv } from './fast-color.engine';

const darkColorMap = [
  { index: 7, amount: 15 },
  { index: 6, amount: 25 },
  { index: 5, amount: 30 },
  { index: 5, amount: 45 },
  { index: 5, amount: 65 },
  { index: 5, amount: 85 },
  { index: 4, amount: 90 },
  { index: 3, amount: 95 },
  { index: 2, amount: 97 },
  { index: 1, amount: 98 }
];

function getHue(hsv: ColorHsv, index: number, light = false) {
  let hue: number;

  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    hue = light ? Math.round(hsv.h) - 2 * index : Math.round(hsv.h) + 2 * index;
  } else {
    hue = light ? Math.round(hsv.h) + 2 * index : Math.round(hsv.h) - 2 * index;
  }

  if (hue < 0) hue += 360;
  else if (hue >= 360) hue -= 360;

  return hue;
}

function getSaturation(hsv: ColorHsv, index: number, light = false) {
  if (hsv.h === 0 && hsv.s === 0) return hsv.s;

  let saturation: number;
  if (light) saturation = hsv.s - 0.16 * index;
  else if (index === 4) saturation = hsv.s + 0.16;
  else saturation = hsv.s + 0.05 * index;

  if (saturation > 1) saturation = 1;
  if (light && index === 5 && saturation > 0.1) saturation = 0.1;
  if (saturation < 0.06) saturation = 0.06;

  return Math.round(saturation * 100) / 100;
}

function getValue(hsv: ColorHsv, index: number, light = false) {
  let value = light ? hsv.v + 0.05 * index : hsv.v - 0.15 * index;
  value = Math.max(0, Math.min(1, value));

  return Math.round(value * 100) / 100;
}

/** Палитра @ant-design/colors 8.0.1 с исходными HSV-шагами и округлениями. */
export function generatePalette(
  color: string,
  options: { theme?: 'dark' | 'default'; backgroundColor?: string; } = {}
): string[] {
  const patterns: FastColor[] = [];
  const primary = new FastColor(color);
  const hsv = primary.toHsv();

  for (let index = 5; index > 0; index--) {
    patterns.push(new FastColor({
      h: getHue(hsv, index, true),
      s: getSaturation(hsv, index, true),
      v: getValue(hsv, index, true)
    }));
  }

  patterns.push(primary);

  for (let index = 1; index <= 4; index++) {
    patterns.push(new FastColor({
      h: getHue(hsv, index),
      s: getSaturation(hsv, index),
      v: getValue(hsv, index)
    }));
  }

  if (options.theme === 'dark') {
    return darkColorMap.map(({ index, amount }) => new FastColor(
      options.backgroundColor || '#141414'
    ).mix(patterns[index], amount).toHexString());
  }

  return patterns.map(color => color.toHexString());
}
