import { useConfig } from './config-context';
import { useForm } from './form-context';
import { resolveVariant } from './variant.engine';
import type { Variant } from './types';

type VariantComponent = 'input' | 'textArea' | 'inputPassword' | 'inputSearch' | 'otp'
  | 'inputNumber' | 'select' | 'treeSelect' | 'cascader' | 'mentions' | 'datePicker'
  | 'timePicker' | 'rangePicker' | 'card';

/** Общая реактивная boundary оформления; Search отдельно читает isConfigured для кнопки. */
export function useVariant(
  component: VariantComponent,
  getProps?: () => { variant?: Variant; },
  fallbackComponent?: VariantComponent
) {
  const config = useConfig();
  const form = useForm();
  const props = $derived(getProps?.());
  const state = $derived(resolveVariant({
    variant: props?.variant,
    formVariant: form?.variant,
    componentVariant: config[component]?.variant,
    fallbackVariant: fallbackComponent ? config[fallbackComponent]?.variant : undefined,
    globalVariant: config.variant
  }));

  return {
    get variant() { return state.variant; },
    get isConfigured() { return state.isConfigured; }
  };
}
