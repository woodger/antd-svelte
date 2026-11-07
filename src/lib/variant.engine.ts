import type { Variant } from './types';

export interface VariantOptions {
  variant?: Variant;
  bordered?: boolean;
  formVariant?: Variant;
  componentVariant?: Variant;
  fallbackVariant?: Variant;
  globalVariant?: Variant;
}

/** Приоритет form/hooks/useVariants 6.6.8; explicit outlined тоже считается настройкой. */
export function resolveVariant(options: VariantOptions): { variant: Variant; isConfigured: boolean; } {
  const { variant, bordered, formVariant, componentVariant, fallbackVariant, globalVariant } = options;
  const configured = [variant, formVariant, componentVariant, fallbackVariant, globalVariant]
    .some(value => value !== undefined) || bordered === false;

  return {
    variant: variant ?? (bordered === false ? 'borderless'
      : formVariant ?? componentVariant ?? fallbackVariant ?? globalVariant ?? 'outlined'),
    isConfigured: configured
  };
}
