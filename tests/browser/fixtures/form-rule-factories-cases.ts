import type { FormInstance, FormRule, FormValues, ValidationRuleFactory } from 'antd-svelte';

export interface FormRuleFactoriesSample {
  id: string;
  mode: string;
  value: string | number;
  enabled?: boolean;
  warning?: boolean;
  minimum?: number;
  other?: string;
  plain?: boolean;
  first?: boolean;
}

export function formRuleFactoriesRules(
  sample: FormRuleFactoriesSample, observe?: (form: FormInstance<FormValues>) => void
): FormRule[] {
  const factory: ValidationRuleFactory = form => {
    observe?.(form);
    switch (sample.mode) {
      case 'required': return {
        required: form.getFieldValue('enabled') === true,
        warningOnly: sample.warning, message: 'Required'
      };
      case 'min': {
        const minimum = form.getFieldValue('minimum');
        return { min: typeof minimum === 'number' ? minimum : 0, message: 'Minimum' };
      }
      case 'enum': {
        const choices = form.getFieldValue('choices');
        return { type: 'enum', enum: Array.isArray(choices) ? choices : [], message: 'Choice' };
      }
      case 'compare': {
        const expected = form.getFieldValue('other');
        return { validator: value => value === expected ? undefined : 'Mismatch' };
      }
      case 'transform': return {
        transform: value => String(value).trim(), pattern: /^abc$/, message: 'Pattern'
      };
      default: throw Error(`Unknown rule factory: ${sample.mode}`);
    }
  };

  return sample.plain ? [factory, { pattern: /^x$/, message: 'Plain' }] : [factory];
}
