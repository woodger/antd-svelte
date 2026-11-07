import { describe, expect, it } from 'vitest';
import { createForm } from './form.model.svelte.js';
import { getFormHooks } from './form-internal';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm warningOnly', () => {
  it('clears previous warnings while a replacement validation is pending', async () => {
    const pending = deferred<string>();
    let held = false;
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{
        warningOnly: true, validator: () => held ? pending.promise : 'First warning'
      }] }
    });
    await form.validateFields();
    expect(form.getFieldWarning('name')).toEqual(['First warning']);

    held = true;
    const validation = form.validateFields();

    expect(form.getFieldWarning('name')).toEqual([]);
    expect(form.getFieldsError()).toEqual([{ name: ['name'], errors: [], warnings: [] }]);
    expect(form.isFieldValidating('name')).toBe(true);
    pending.resolve('Next warning');
    await validation;

    expect(form.getFieldWarning('name')).toEqual(['Next warning']);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('submits warning-only values without marking the field as required', async () => {
    const form = createForm({
      initialValues: { name: '' },
      rules: { name: [{ required: true, warningOnly: true, message: 'Name recommended' }] }
    });
    const submitted: unknown[] = [];

    const result = await form.submit((values) => { submitted.push(values); });

    expect(result).toEqual({ status: 'success' });
    expect(submitted).toEqual([{ name: '' }]);
    expect(form.getFieldWarning('name')).toEqual(['Name recommended']);
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.errors).toEqual({ name: [] });
    expect(form.isFieldRequired('name')).toBe(false);
  });

  it('includes warnings in a rejected field while excluding warning-only fields', async () => {
    const form = createForm({
      initialValues: { name: '', note: '' },
      rules: {
        name: [
          { required: true, message: 'Name required' },
          { warningOnly: true, validator: () => 'Name recommended' }
        ],
        note: [{ required: true, warningOnly: true, message: 'Note recommended' }]
      }
    });

    await expect(form.validateFields()).rejects.toMatchObject({
      outOfDate: false,
      errors: { name: ['Name required'] },
      errorFields: [{ name: ['name'], errors: ['Name required'], warnings: ['Name recommended'] }]
    });
    expect(form.isFieldRequired('name')).toBe(true);
    expect(form.getFieldWarning('note')).toEqual(['Note recommended']);
  });

  it('returns isolated warnings for selected nested paths and unknown fields', async () => {
    const form = createForm({ initialValues: { users: [{ name: '' }] } });
    getFormHooks(form)!.registerField({
      name: ['users', 0, 'name'],
      rules: [{ required: true, warningOnly: true, message: 'Name recommended' }]
    });
    await form.validateFields([['users', 0, 'name']]);

    const fields = form.getFieldsError([['users', 0, 'name'], 'unknown']);
    fields[0].warnings.push('Changed copy');
    fields[0].name[0] = 'changed';

    expect(form.getFieldsError([['users', 0, 'name'], 'unknown'])).toEqual([
      { name: ['users', 0, 'name'], errors: [], warnings: ['Name recommended'] },
      { name: ['unknown'], errors: [], warnings: [] }
    ]);
  });

  it('clears warnings after a value write and restores defaults on reset', async () => {
    const form = createForm({
      initialValues: { name: '' },
      rules: { name: [{ required: true, warningOnly: true, message: 'Name recommended' }] }
    });
    await form.validateFields();

    form.setFieldValue('name', 'Anna');

    expect(form.getFieldWarning('name')).toEqual([]);
    form.setFieldsValue({ name: '' });
    await form.validateFields();
    form.resetFields();

    expect(form.getFieldWarning('name')).toEqual([]);
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.values).toEqual({ name: '' });
  });

  it('keeps newer warnings when asynchronous validations finish in reverse order', async () => {
    const older = deferred<string>();
    const newer = deferred<string>();
    let attempt = 0;
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{
        warningOnly: true, validator: () => ++attempt === 1 ? older.promise : newer.promise
      }] }
    });
    const first = form.validateFields().catch((error: unknown) => error);
    const second = form.validateFields();

    newer.resolve('Current warning');
    await second;
    older.resolve('Stale warning');
    const error = await first;

    expect(error).toMatchObject({ outOfDate: true });
    expect(form.getFieldWarning('name')).toEqual(['Current warning']);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it.each(['write', 'reset', 'unregister'] as const)(
    'ignores pending warnings after %s',
    async (operation) => {
      const pending = deferred<string>();
      const form = createForm({ initialValues: { name: 'Anna' } });
      const unregister = getFormHooks(form)!.registerField({
        name: 'name', rules: [{ warningOnly: true, validator: () => pending.promise }]
      });
      const validation = form.validateFields().catch((error: unknown) => error);

      if (operation === 'write') form.setFieldValue('name', 'Bob');
      else if (operation === 'reset') form.resetFields();
      else unregister();

      pending.resolve('Stale warning');
      const error = await validation;

      expect(error).toMatchObject({ outOfDate: true });
      expect(form.getFieldWarning('name')).toEqual([]);
      expect(form.isFieldValidating('name')).toBe(false);
    }
  );
});
