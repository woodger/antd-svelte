import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import type { ValidationRuleFactory } from './validation.engine';
import reference from '../../tests/browser/fixtures/ant-design-form-rule-factories-reference.json';
import { formRuleFactoriesRules } from '../../tests/browser/fixtures/form-rule-factories-cases';

describe('Form rule factories', () => {
  for (const entry of reference.cases) {
    it(`evaluates source factory settings for ${entry.sample.id} ${entry.phase}`, async () => {
      const { sample } = entry;
      let received: unknown;
      const form = createForm({
        initialValues: {
          field: sample.value, minimum: sample.minimum, enabled: sample.enabled,
          other: sample.other, choices: [0, false, 'abc']
        },
        rules: { field: formRuleFactoriesRules(sample, form => { received = form; }) }
      });
      const remove = sample.first ? getFormHooks(form)!.registerField({
        name: 'field', validateFirst: true
      }) : undefined;
      if (entry.phase === 'updated') form.setFieldsValue({ minimum: 3 });
      const result = await form.validateFields().then(() => true, () => false);

      expect(result).toBe(entry.valid);
      expect(form.getFieldError('field')).toEqual(entry.errors);
      expect(form.getFieldWarning('field')).toEqual(entry.warnings);
      expect(form.isFieldRequired('field')).toBe(entry.required);
      expect(form.values.field).toBe(entry.store);
      expect(received).toBe(form);
      remove?.();
    });
  }

  it('infers the model value types inside createForm factories', async () => {
    const form = createForm({
      initialValues: { field: 'ab', minimum: 3 },
      rules: { field: [model => {
        expectTypeOf(model.values.field).toEqualTypeOf<string>();
        expectTypeOf(model.getFieldValue('minimum')).toEqualTypeOf<number>();
        return { min: model.getFieldValue('minimum'), message: 'Minimum' };
      }] }
    });

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['field'], errors: ['Minimum'] }]
    });
  });

  it('does not run factories while querying values, errors or touched metadata', () => {
    let calls = 0;
    const form = createForm({
      initialValues: { field: 'abc' },
      rules: { field: [() => { calls++; return { required: true }; }] }
    });

    expect(form.getFieldsValue()).toEqual({ field: 'abc' });
    expect(form.getFieldError('field')).toEqual([]);
    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldsValidating()).toBe(false);
    expect(calls).toBe(0);
    expect(form.isFieldRequired('field')).toBe(true);
    expect(calls).toBe(1);
  });

  it('resolves all factories before validateFirst but skips later validators after the first error', async () => {
    const calls: string[] = [];
    const form = createForm({ initialValues: { field: '' } });
    const remove = getFormHooks(form)!.registerField({
      name: 'field', validateFirst: true,
      rules: [{ required: true, message: 'Required' }, () => {
        calls.push('factory');
        return { validator: () => { calls.push('validator'); return 'Other'; } };
      }]
    });

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ errors: ['Required'] }]
    });
    expect(calls).toEqual(['factory']);
    remove();
  });

  it('captures factory results before automatic debounce and reevaluates them for the next request', async () => {
    vi.useFakeTimers();
    let minimum = 2;
    let calls = 0;
    const form = createForm({ initialValues: { field: 'ab' } });
    const remove = getFormHooks(form)!.registerField({
      name: 'field', validateDebounce: 100,
      rules: [() => { calls++; return { min: minimum, message: 'Minimum' }; }]
    });
    try {
      form.touchField('field');
      minimum = 3;
      await vi.advanceTimersByTimeAsync(100);

      expect(form.getFieldError('field')).toEqual([]);
      expect(calls).toBe(1);
      await expect(form.validateFields()).rejects.toMatchObject({
        errorFields: [{ errors: ['Minimum'] }]
      });
      expect(calls).toBe(2);
    } finally {
      remove();
      vi.useRealTimers();
    }
  });

  it('clears the validating flag after a factory exception and accepts a later valid request', async () => {
    let broken = true;
    const factory: ValidationRuleFactory<{ field: string }> = () => {
      if (broken) throw Error('Factory failed');
      return { required: true };
    };
    const form = createForm({ initialValues: { field: 'abc' }, rules: { field: [factory] } });

    await expect(form.validateFields()).rejects.toThrow('Factory failed');
    expect(form.isFieldValidating('field')).toBe(false);
    broken = false;
    await expect(form.validateFields()).resolves.toEqual({ field: 'abc' });
    expect(form.isFieldValidating('field')).toBe(false);
  });

  it('keeps validateOnly metadata unchanged when resolving a warning factory', async () => {
    const form = createForm({
      initialValues: { field: '' },
      rules: { field: [() => ({ required: true, warningOnly: true, message: 'Check' })] }
    });

    await expect(form.validateFields({ validateOnly: true })).resolves.toEqual({ field: '' });
    expect(form.getFieldWarning('field')).toEqual([]);
    expect(form.isFieldTouched('field')).toBe(false);
    await expect(form.validateFields()).resolves.toEqual({ field: '' });
    expect(form.getFieldWarning('field')).toEqual(['Check']);
  });
});
