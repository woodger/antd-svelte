import type { ConfigProviderProps, Variant } from 'antd-svelte';

export function configVariant(value: unknown): Variant | undefined {
  return value === 'outlined' || value === 'filled' || value === 'borderless' || value === 'underlined'
    ? value : undefined;
}

export function configVariantProps(value: unknown): Partial<ConfigProviderProps> {
  if (typeof value !== 'object' || value === null) return {};
  const record = value as Record<string, unknown>;
  const result: Partial<ConfigProviderProps> = { variant: configVariant(record.variant) };

  for (const name of ['input', 'textArea', 'inputPassword', 'inputSearch', 'otp', 'inputNumber',
    'select', 'treeSelect', 'cascader', 'mentions', 'datePicker', 'timePicker', 'rangePicker'] as const) {
    const item = record[name];
    if (typeof item === 'object' && item !== null) {
      result[name] = { variant: configVariant('variant' in item ? item.variant : undefined) };
    }
  }

  if (typeof record.card === 'object' && record.card !== null) {
    const variant = configVariant('variant' in record.card ? record.card.variant : undefined);
    result.card = { variant: variant === 'outlined' || variant === 'borderless' ? variant : undefined };
  }
  if (record.direction === 'ltr' || record.direction === 'rtl') result.direction = record.direction;
  if (typeof record.theme === 'object' && record.theme !== null
    && 'inherit' in record.theme && record.theme.inherit === false) {
    result.theme = { inherit: false, cssVar: {}, token: { motion: false } };
  }

  return result;
}
