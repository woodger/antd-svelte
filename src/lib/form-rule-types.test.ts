import { describe, expect, it } from 'vitest';
import { validateFieldValue, validateValue } from './validation.engine';
import { createForm } from './form.model.svelte';
import reference from '../../tests/browser/fixtures/ant-design-form-rule-types-reference.json';
import {
  formRuleTypesValue, formRuleTypesRule, formRuleTypesCorrections
} from '../../tests/browser/fixtures/form-rule-types-cases';

describe('Form primitive validation rule types', () => {
  for (const entry of reference.cases) {
    it(`validates source type and constraint behavior for ${entry.sample.id}`, async () => {
      const value = formRuleTypesValue(entry.sample.kind);
      const expected = formRuleTypesCorrections[entry.sample.id] ?? entry.valid;

      expect(await validateFieldValue(value, {}, [formRuleTypesRule(entry.sample)]))
        .toEqual({ errors: expected ? [] : ['Rejected'], warnings: entry.warnings });
    });
  }

  it('preserves implicit native empty values while explicit string/array types follow source', async () => {
    expect(await validateValue('  ', {}, [{ required: true }])).toEqual(['Заполните это поле.']);
    expect(await validateValue('  ', {}, [{ type: 'string', required: true }])).toEqual([]);
    expect(await validateValue([], {}, [{ min: 1 }])).toEqual([]);
    expect(await validateValue([], {}, [{ type: 'array', min: 1 }]))
      .toEqual(['Минимальное количество: 1.']);
    expect(await validateValue('', {}, [{ type: 'number' }])).toEqual([]);
    expect(await validateValue('', {}, [{ type: 'float', message: 'Not float' }])).toEqual(['Not float']);
  });

  it('uses parsed dates only for validation and compares timestamp ranges without replacing the input', async () => {
    const original = '2026-01-01T00:00:00Z';
    const timestamp = Date.parse(original);
    const form = createForm({
      initialValues: { field: original },
      rules: { field: [{ type: 'date', min: timestamp, max: timestamp }] }
    });

    await expect(form.validateFields()).resolves.toEqual({ field: original });
    expect(form.values.field).toBe(original);
    expect(await validateValue(original, {}, [{ type: 'date', max: timestamp - 1, message: 'Late' }]))
      .toEqual(['Late']);
  });

  it('lets explicit typed custom validators replace built-ins without changing their native arguments', async () => {
    let seen: unknown;
    const values = { field: '  raw  ' };
    const result = await validateFieldValue(values.field, values, [{
      type: 'number', required: true, min: 100, transform: value => String(value).trim(),
      validator(value, context) { seen = { value, original: context.field }; }
    }]);

    expect(result).toEqual({ errors: [], warnings: [] });
    expect(seen).toEqual({ value: 'raw', original: '  raw  ' });
    expect(await validateValue('', {}, [{ type: 'number', validator: () => 'Custom failure' }]))
      .toEqual(['Custom failure']);
  });

  it('applies transforms before type checks and keeps typed warnings nonblocking', async () => {
    expect(await validateValue('3', {}, [{ type: 'integer', transform: value => Number(value) }]))
      .toEqual([]);
    const form = createForm({
      initialValues: { field: 'abc' },
      rules: { field: [{ type: 'number', warningOnly: true, message: 'Needs number' }] }
    });

    await expect(form.submit(() => {})).resolves.toEqual({ status: 'success' });
    expect(form.getFieldWarning('field')).toEqual(['Needs number']);
    expect(form.values.field).toBe('abc');
  });

  it('retains native fallback and literal messages for invalid explicit types', async () => {
    expect(await validateValue('abc', {}, [{ type: 'number' }]))
      .toEqual(['Проверьте тип значения: number.']);
    expect(await validateValue('abc', {}, [{ type: 'number', message: '' }])).toEqual(['']);
    expect(await validateValue(null, {}, [{ type: 'object', required: true }]))
      .toEqual(['Заполните это поле.']);
  });
});
