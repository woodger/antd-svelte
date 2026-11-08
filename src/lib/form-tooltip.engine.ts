import type { FormItemTooltip, FormTooltipProps } from './form.types';

function isTooltipOptions(value: FormItemTooltip): value is FormTooltipProps {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Массивы остаются content, а не превращаются в options через spread, как в source 6.6.8. */
export function resolveFormTooltip(
  value: FormItemTooltip,
  context?: FormTooltipProps
): FormTooltipProps | undefined {
  if (value === undefined || value === null || value === false || value === '') return;

  return isTooltipOptions(value) ? { ...context, ...value } : { ...context, title: value };
}
