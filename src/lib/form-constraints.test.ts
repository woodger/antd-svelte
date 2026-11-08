import { describe, expect, it } from 'vitest';
import { validateFieldValue, validateValue } from './validation.engine';
import { createForm } from './form.model.svelte';
import reference from '../../tests/browser/fixtures/ant-design-form-constraints-reference.json';
import { formConstraintsRule } from '../../tests/browser/fixtures/form-constraints-cases';

describe('Form exact length and whitespace constraints', () => {
  for (const entry of reference.cases) {
    it(`matches source constraints for ${entry.sample.id}`, async () => {
      expect(await validateFieldValue(entry.sample.value, {}, [formConstraintsRule(entry.sample)]))
        .toEqual({ errors: entry.errors, warnings: entry.warnings });
    });
  }

  it('uses numeric values and array lengths under the existing implicit native range contract', async () => {
    expect(await validateValue(0, {}, [{ len: 0 }])).toEqual([]);
    expect(await validateValue(2, {}, [{ len: 3 }])).toEqual(['Точное значение: 3.']);
    expect(await validateValue([0, false], {}, [{ len: 2 }])).toEqual([]);
    expect(await validateValue([0], {}, [{ len: 2 }])).toEqual(['Точное количество элементов: 2.']);
    expect(await validateValue(Object.freeze(['a', 'b']), {}, [{ len: 2 }])).toEqual([]);
  });

  it('skips missing values and empty strings but applies exact length to empty arrays and spaces', async () => {
    for (const value of [undefined, null, '']) {
      expect(await validateValue(value, {}, [{ len: 3 }])).toEqual([]);
    }
    expect(await validateValue([], {}, [{ len: 2 }]))
      .toEqual(['Точное количество элементов: 2.']);
    expect(await validateValue([], {}, [{ len: 0 }])).toEqual([]);
    expect(await validateValue('  ', {}, [{ len: 1 }])).toEqual(['Точная длина: 1.']);
    expect(await validateValue([], {}, [{ len: 0, required: true }]))
      .toEqual(['Заполните это поле.']);
  });

  it('keeps exact length before ranges, with pattern and custom validation still applied', async () => {
    let calls = 0;
    const validator = () => { calls++; return 'Custom error'; };

    expect(await validateValue('ab', {}, [{ len: 2, min: 5, max: 1, validator }]))
      .toEqual(['Custom error']);
    expect(calls).toBe(1);
    expect(await validateValue('abc', {}, [{ len: 2, validator, message: 'Length error' }]))
      .toEqual(['Length error']);
    expect(calls).toBe(1);
    expect(await validateValue('ab', {}, [{ len: 2, pattern: /^x$/, message: 'Pattern error' }]))
      .toEqual(['Pattern error']);
  });

  it('reports invalid exact lengths without silently clamping them', async () => {
    for (const len of [NaN, Infinity, -Infinity, -1, 1.5]) {
      expect(await validateValue('ab', {}, [{ len, message: 'Invalid length' }]))
        .toEqual(['Invalid length']);
    }
    expect(await validateValue('ab', {}, [{ len: 2 }])).toEqual([]);
  });

  it('preserves literal messages and reports whitespace without trimming the store', async () => {
    expect(await validateValue(' ', {}, [{ whitespace: true }]))
      .toEqual(['Поле не может состоять только из пробелов.']);
    expect(await validateValue(' ', {}, [{ whitespace: true, message: '' }])).toEqual(['']);
    const form = createForm({
      initialValues: { field: '  ' }, rules: { field: [{ whitespace: true, message: 'No blanks' }] }
    });

    await expect(form.validateFields()).rejects.toMatchObject({
      values: { field: '  ' }, errorFields: [{ name: ['field'], errors: ['No blanks'] }]
    });
    expect(form.values.field).toBe('  ');
  });

  it('keeps whitespace warnings nonblocking and reset restores the original value', async () => {
    const form = createForm({
      initialValues: { field: '  ' },
      rules: { field: [{ whitespace: true, warningOnly: true, message: 'Check whitespace' }] }
    });
    let submitted: unknown;

    await expect(form.submit(values => { submitted = values; })).resolves.toEqual({ status: 'success' });
    expect(submitted).toEqual({ field: '  ' });
    expect(form.getFieldWarning('field')).toEqual(['Check whitespace']);
    form.setFieldValue('field', 'abc');
    form.resetFields();
    expect(form.values.field).toBe('  ');
    expect(form.getFieldWarning('field')).toEqual([]);
  });
});
