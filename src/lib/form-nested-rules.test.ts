import { describe, expect, it, vi } from 'vitest';
import { validateFieldValue, validateValue, type ValidationRule } from './validation.engine';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import reference from '../../tests/browser/fixtures/ant-design-form-nested-rules-reference.json';
import {
  nestedRule, nestedRuleValue, nestedRuleCorrections, createNestedRuleController
} from '../../tests/browser/fixtures/form-nested-rules-cases';

describe('Form nested validation rules', () => {
  for (const entry of reference.cases) {
    it(`validates source nested schemas and recorded corrections for ${entry.sample.id}`, async () => {
      const controller = createNestedRuleController();
      const expected = nestedRuleCorrections[entry.sample.id] ?? entry;
      const validation = validateFieldValue(nestedRuleValue(entry.sample), {}, [
        nestedRule(entry.sample.rule, controller)
      ]);
      if (entry.sample.pending) {
        await controller.waitFor(entry.sample.pending);
        controller.release();
      }

      expect(await validation).toEqual({ errors: expected.errors, warnings: expected.warnings });
    });
  }

  for (const mode of [true, 'parallel'] as const) {
    it(`waits for a blocking rule after nested warnings with validateFirst=${mode}`, async () => {
      vi.useFakeTimers();
      let reject!: (message: string) => void;
      let settled = false;
      const deferred = new Promise<string>(resolve => { reject = resolve; });
      try {
        const validation = validateFieldValue({ name: '' }, {}, [
          { type: 'object', fields: { name: { required: true, warningOnly: true, message: 'Warn' } } },
          { validator: () => deferred }
        ], mode).finally(() => { settled = true; });
        await vi.advanceTimersByTimeAsync(0);
        expect(settled).toBe(false);
        reject('Blocking');

        expect(await validation).toEqual({ errors: ['Blocking'], warnings: [] });
      } finally { vi.useRealTimers(); }
    });
  }

  it('keeps nested validators on the form snapshot while applying parent transforms to child data', async () => {
    const original = { name: ' Original ' };
    let seen: unknown;
    const result = await validateFieldValue(original, { field: original, other: 'Other' }, [{
      type: 'object', transform: () => ({ name: 'Changed' }),
      fields: { name: { validator(value, values) {
        seen = { value, original: values.field.name, other: values.other };
      } } }
    }]);

    expect(result).toEqual({ errors: [], warnings: [] });
    expect(seen).toEqual({ value: 'Changed', original: ' Original ', other: 'Other' });
    expect(original).toEqual({ name: ' Original ' });
  });

  it('captures the selected child schema before an asynchronous parent validator finishes', async () => {
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    const rule: ValidationRule = {
      type: 'object', validator: () => pending,
      fields: { name: { required: true, message: 'Name' } }
    };
    const validation = validateValue({ name: '' }, {}, [rule]);
    rule.fields = {};
    release();

    expect(await validation).toEqual(['Name']);
  });

  it('collects all child rules within one root even when validateFirst stops later root rules', async () => {
    let later = false;
    const result = await validateFieldValue({ a: '', b: '' }, {}, [
      { type: 'object', fields: {
        a: { required: true, message: 'A' }, b: { required: true, message: 'B' }
      } },
      { validator: () => { later = true; return 'Later'; } }
    ], true);

    expect(result).toEqual({ errors: ['A', 'B'], warnings: [] });
    expect(later).toBe(false);
  });

  it('preserves warning order when the whole parent rule is warning-only', async () => {
    expect(await validateFieldValue({ a: '', b: '' }, {}, [{
      type: 'object', warningOnly: true, fields: {
        a: { required: true, warningOnly: true, message: 'A' },
        b: { required: true, message: 'B' }
      }
    }])).toEqual({ errors: [], warnings: ['A', 'B'] });
  });

  it('ignores unsupported nested settings without an object or array type', async () => {
    expect(await validateValue({}, {}, [{ fields: { name: { required: true } } }])).toEqual([]);
  });

  it('handles recursive schemas without rejecting a value shared by independent siblings', async () => {
    const recursive: ValidationRule = { type: 'object' };
    recursive.fields = { self: recursive };
    const cycle: { self?: unknown } = {};
    cycle.self = cycle;

    expect(await validateValue(cycle, {}, [recursive])).toEqual(['Вложенные правила образуют цикл.']);
    const shared = { name: 'Name' };
    const child: ValidationRule = { type: 'object', fields: { name: { required: true } } };
    expect(await validateValue({ a: shared, b: shared }, {}, [{
      type: 'object', fields: { a: child, b: child }
    }])).toEqual([]);
  });

  it('retains sparse indices and ignores inherited values without changing original data', async () => {
    const sparse: string[] = [];
    sparse[2] = '';
    const form = createForm({
      initialValues: { field: sparse },
      rules: { field: [{ type: 'array', defaultField: { required: true, message: 'Child' } }] }
    });

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['field'], errors: ['Child'] }]
    });
    expect(0 in form.values.field).toBe(false);
    expect(2 in form.values.field).toBe(true);
    const value = Object.create({ name: 'Inherited' });
    expect(await validateValue(value, {}, [{
      type: 'object', fields: { name: { required: true, message: 'Own name' } }
    }])).toEqual(['Own name']);
  });

  it('keeps validateOnly errors and nested warnings outside the visible model metadata', async () => {
    const form = createForm({
      initialValues: { field: { name: '' } },
      rules: { field: [{ type: 'object', fields: {
        name: { required: true, warningOnly: true, message: 'Warn' }
      } }] }
    });

    await expect(form.validateFields({ validateOnly: true })).resolves.toEqual({ field: { name: '' } });
    expect(form.getFieldWarning('field')).toEqual([]);
    await expect(form.submit(() => {})).resolves.toEqual({ status: 'success' });
    expect(form.getFieldWarning('field')).toEqual(['Warn']);
  });

  it('keeps a nested completion after reset from republishing obsolete errors', async () => {
    const controller = createNestedRuleController();
    const form = createForm({ initialValues: { field: { name: 'Name' } } });
    const remove = getFormHooks(form)!.registerField({
      name: 'field', rules: [{ type: 'object', fields: {
        name: { validator: () => controller.hold('Old error') }
      } }]
    });
    const validation = form.validateFields().catch(error => error);
    await controller.waitFor(1);
    form.resetFields();
    controller.release();

    expect(await validation).toMatchObject({ outOfDate: true });
    expect(form.getFieldError('field')).toEqual([]);
    expect(form.isFieldValidating('field')).toBe(false);
    remove();
  });
});
