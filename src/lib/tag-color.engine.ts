import { FastColor } from './fast-color.engine';
import { presetColors } from './theme-token.types';
import type { TagProps, TagVariant } from './tag.types';

export function getTagColor(
  props: Pick<TagProps, 'color' | 'variant' | 'bordered'>,
  contextVariant?: TagVariant
) {
  const inverse = props.color?.endsWith('-inverse');
  let variant: TagVariant;
  if (props.variant) variant = props.variant;
  else if (inverse) variant = 'solid';
  else if (props.bordered === false) variant = 'filled';
  else variant = contextVariant || 'filled';
  let color = inverse ? props.color?.replace('-inverse', '') : props.color;
  if (color === undefined && variant === 'solid') color = 'default';

  const preset = presetColors.some(preset => color === preset || color === `${preset}-inverse`);
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
