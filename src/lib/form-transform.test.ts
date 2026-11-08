import { describe, expect, it } from 'vitest';
import { validateFieldValue } from './validation.engine';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import reference from '../../tests/browser/fixtures/ant-design-form-transform-reference.json';
import { formTransformRules, type FormTransformCall } from '../../tests/browser/fixtures/form-transform-cases';

describe('Form validation rule transform', () => {
  for (const entry of reference.cases) {
    it(`preserves per-rule transforms and source call order for ${entry.sample.id}`, async () => {
      const calls: FormTransformCall[] = [];
      const { sample } = entry;
      const rules = formTransformRules(sample, call => calls.push(call));
      const result = await validateFieldValue(sample.value, { field: sample.value }, rules, sample.first);

      if (sample.kind === 'throw') {
        expect(entry.valid).toBe(true);
        expect(result).toEqual({ errors: ['Rejected'], warnings: [] });
      } else expect(result).toEqual({ errors: entry.errors, warnings: entry.warnings });
      expect(JSON.parse(JSON.stringify(calls))).toEqual(entry.calls);
    });
  }

  it('uses the transformed value for constraints and validators while retaining the original values', async () => {
    const values = { field: '  abc  ' };
    let seen: unknown;
    const result = await validateFieldValue(values.field, values, [{
      transform: value => String(value).trim(), min: 3, max: 3, pattern: /^abc$/,
      validator(value, context) { seen = { value, original: context.field }; }
    }]);

    expect(result).toEqual({ errors: [], warnings: [] });
    expect(seen).toEqual({ value: 'abc', original: '  abc  ' });
    expect(values).toEqual({ field: '  abc  ' });
  });

  it('reports thrown transform errors and preserves warning-only and literal messages', async () => {
    const failed = () => { throw Error('Transform failed'); };
    expect(await validateFieldValue('abc', {}, [{ transform: failed }]))
      .toEqual({ errors: ['Transform failed'], warnings: [] });
    expect(await validateFieldValue('abc', {}, [{ transform: failed, warningOnly: true }]))
      .toEqual({ errors: [], warnings: ['Transform failed'] });
    expect(await validateFieldValue('abc', {}, [{ transform: failed, message: '' }]))
      .toEqual({ errors: [''], warnings: [] });
    expect(await validateFieldValue('abc', {}, [{ transform() { throw 'Bad value'; } }]))
      .toEqual({ errors: ['Проверьте значение.'], warnings: [] });
  });

  it('does not write the transform result to the model, submit payload or reset defaults', async () => {
    const form = createForm({
      initialValues: { field: '  abc  ' },
      rules: { field: [{ transform: value => String(value).trim(), pattern: /^abc$/ }] }
    });
    let payload: unknown;

    await expect(form.submit(values => { payload = values; })).resolves.toEqual({ status: 'success' });
    expect(payload).toEqual({ field: '  abc  ' });
    expect(form.values.field).toBe('  abc  ');
    form.setFieldValue('field', 'Other');
    form.resetFields();
    expect(form.values.field).toBe('  abc  ');
  });

  it('keeps validation-only errors separate from visible metadata and the original store', async () => {
    const form = createForm({
      initialValues: { field: '  ab  ' },
      rules: { field: [{ transform: value => String(value).trim(), min: 3, message: 'Too short' }] }
    });

    await expect(form.validateFields({ validateOnly: true })).rejects.toMatchObject({
      values: { field: '  ab  ' }, errorFields: [{ name: ['field'], errors: ['Too short'] }]
    });
    expect(form.getFieldError('field')).toEqual([]);
    expect(form.isFieldTouched('field')).toBe(false);
    expect(form.values.field).toBe('  ab  ');
  });

  it('isolates plain snapshot mutations without replacing opaque values', async () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const form = createForm({
      initialValues: { field: { text: 'Original' }, date },
      rules: {
        field: [{ transform(value) {
          (value as { text: string }).text = 'Changed snapshot';
          return value;
        }, validator: value => (value as { text: string }).text === 'Changed snapshot'
          ? undefined : 'Invalid snapshot' }],
        date: [{ transform: value => value, validator: value => value === date
          ? undefined : 'Replaced date' }]
      }
    });

    await expect(form.validateFields()).resolves.toMatchObject({ field: { text: 'Changed snapshot' } });
    expect(form.values.field).toEqual({ text: 'Original' });
    expect(form.values.date).toBe(date);
  });

  it('keeps a late transformed validator result from replacing a newer error', async () => {
    const pending: ((message: string) => void)[] = [];
    const form = createForm({
      initialValues: { field: ' old ' },
      rules: { field: [{
        transform: value => String(value).trim(),
        validator: () => new Promise<string>(resolve => pending.push(resolve))
      }] }
    });
    const first = form.validateFields().catch(error => error);
    form.setFieldValue('field', ' new ');
    const second = form.validateFields().catch(error => error);
    pending[1]('New error');
    await second;
    pending[0]('Old error');

    expect(await first).toMatchObject({ outOfDate: true });
    expect(form.getFieldError('field')).toEqual(['New error']);
    expect(form.values.field).toBe(' new ');
  });

  it('runs a local field transform through the same model validation boundary', async () => {
    const form = createForm({ initialValues: { field: ' abc ' } });
    const remove = getFormHooks(form)!.registerField({
      name: 'field', rules: [{ transform: value => String(value).trim(), pattern: /^abc$/ }]
    });

    await expect(form.validateFields()).resolves.toEqual({ field: ' abc ' });
    expect(form.getFieldError('field')).toEqual([]);
    remove();
  });
});
