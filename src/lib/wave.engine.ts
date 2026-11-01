import type { WaveColorSource } from './wave.types';

/** Список исключений повторяет upstream, включая исходную чувствительность к регистру. */
export function isValidWaveColor(color: unknown): color is string {
  return typeof color === 'string' && !!color
    && color !== '#fff' && color !== '#ffffff'
    && color !== 'rgb(255, 255, 255)' && color !== 'rgba(255, 255, 255, 1)'
    && !/rgba\((?:\d*, ){3}0\)/i.test(color)
    && !/^#(?:[0-9a-f]{3}0|[0-9a-f]{6}00)$/i.test(color)
    && color !== 'transparent' && color !== 'canvastext';
}

export function getWaveColor(
  style: Pick<CSSStyleDeclaration, 'color' | 'borderTopColor' | 'borderColor' | 'backgroundColor'>,
  source?: WaveColorSource
): string | null {
  if (source && isValidWaveColor(style[source])) return style[source];

  return [style.borderTopColor, style.borderColor, style.backgroundColor]
    .find(isValidWaveColor) ?? null;
}
