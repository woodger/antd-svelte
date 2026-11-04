import { AggregationColor } from './color';
import { presetColors } from './theme-token.types';
import type { TooltipColor } from './tooltip.types';

/** parseColor 6.6.8: alpha не участвует в luminance; неизвестные CSS-форматы парсятся Color. */
export function getTooltipColor(color: TooltipColor | undefined, prefix: string) {
  const preset = presetColors.find(name => color === name);
  const internal = preset || presetColors.some(name => color === `${name}-inverse`);
  const arrowStyle: (readonly [string, string])[] = [];
  const overlayStyle: (readonly [string, string])[] = [];

  if (color && !internal) {
    const { r, g, b } = new AggregationColor(color).toRgb();
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    overlayStyle.push(
      ['background', color],
      ['--ant-tooltip-overlay-color', luminance < 0.5 ? '#FFF' : '#000']
    );
    arrowStyle.push(['--ant-tooltip-arrow-background-color', color]);
  }

  return {
    className: color && internal ? `${prefix}-${color}` : undefined,
    arrowStyle,
    overlayStyle
  };
}
