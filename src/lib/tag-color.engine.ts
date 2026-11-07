import { FastColor } from './fast-color.engine';
import { presetColors } from './theme-token.types';
import type { TagProps, TagVariant } from './tag.types';

export function getTagColor(
  props: Pick<TagProps, 'color' | 'variant'>,
  contextVariant?: TagVariant
) {
  const variant = props.variant || contextVariant || 'filled';
  let color = props.color;
  if (color === undefined && variant === 'solid') color = 'default';

  const preset = presetColors.some(preset => color === preset);
  const status = ['success', 'processing', 'error', 'default', 'warning'].includes(color ?? '');
  const style: (readonly [string, string])[] = [];
  if (!preset && !status && color) {
    if (variant === 'solid') {
      style.push(['background-color', props.color!]);
    } else {
      const hsl = new FastColor(color).toHsl();
      hsl.l = 0.95;
      style.push(['background-color', new FastColor(hsl).toHexString()], ['color', props.color!]);
      if (variant === 'outlined') style.push(['border-color', props.color!]);
    }
  }

  return { variant, color, internal: preset || status, style };
}
