import type { ValidationRule, ValidationRuleType } from 'antd-svelte';

export interface NestedRuleDescriptor {
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  len?: number;
  pattern?: string;
  message?: string;
  warningOnly?: boolean;
  fields?: Readonly<Record<string, NestedRuleDescriptor | readonly NestedRuleDescriptor[] | undefined>>;
  defaultField?: NestedRuleDescriptor;
  validator?: string;
  transform?: string;
}

export interface NestedRuleSample {
  id: string;
  value?: unknown;
  valueKind?: string;
  rule: NestedRuleDescriptor;
  pending?: number;
}

export function createNestedRuleController(onPending?: (count: number) => void) {
  const pending: (() => void)[] = [];
  const waiting: { count: number; ready: () => void }[] = [];
  return {
    hold(message: string) {
      return new Promise<void>((_, reject) => {
        pending.push(() => reject(Error(message)));
        onPending?.(pending.length);
        for (const waiter of waiting) if (pending.length >= waiter.count) waiter.ready();
      });
    },
    waitFor(count: number) {
      return pending.length >= count ? Promise.resolve() : new Promise<void>(ready => {
        waiting.push({ count, ready });
      });
    },
    release() {
      const callbacks = pending.splice(0);
      waiting.length = 0;
      onPending?.(0);
      for (const release of callbacks) release();
    }
  };
}

export function nestedRuleValue(sample: NestedRuleSample): unknown {
  if (sample.valueKind === 'sparse') {
    const value: string[] = [];
    value[2] = '';
    return value;
  }
  return sample.value;
}

export function nestedRule(
  desc: NestedRuleDescriptor, controller: ReturnType<typeof createNestedRuleController>
): ValidationRule {
  const { fields, defaultField, validator, transform, ...rest } = desc;
  const result: ValidationRule = { ...rest, type: desc.type as ValidationRuleType | undefined };
  if (fields) result.fields = Object.fromEntries(Object.entries(fields).flatMap(([key, rule]) =>
    rule === undefined ? [] : [[key, Array.isArray(rule) ? rule.map(child => nestedRule(child, controller))
      : nestedRule(rule as NestedRuleDescriptor, controller)]]
  ));
  if (defaultField) result.defaultField = nestedRule(defaultField, controller);
  if (validator) result.validator = async (value) => {
    if (validator === 'slow' || validator === 'by-value' && value === 'slow') {
      return controller.hold(desc.message ?? 'Slow');
    }
    if (validator !== 'pass') throw Error(desc.message ?? 'Fast');
  };
  if (transform === 'shrink') result.transform = value => (value as unknown[]).slice(-1);
  if (transform === 'object-filled') result.transform = () => ({ a: 'ok' });
  if (transform === 'trim') result.transform = value => String(value).trim();
  return result;
}

export const nestedRuleCorrections: Readonly<Record<string, {
  valid: boolean; errors: readonly string[]; warnings: readonly string[];
}>> = {
  'object-child-warning': { valid: true, errors: [], warnings: ['Warn'] },
  'array-child-warning': { valid: true, errors: [], warnings: ['Warn'] },
  'array-transformed-default': { valid: true, errors: [], warnings: [] },
  'object-child-numeric-required': { valid: true, errors: [], warnings: [] },
  'object-own-method': { valid: false, errors: ['Method'], warnings: [] },
  'array-sparse': { valid: false, errors: ['Child'], warnings: [] }
};
