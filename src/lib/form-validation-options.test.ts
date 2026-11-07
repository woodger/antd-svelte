import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createForm, type FormValidateOptions } from './form.model.svelte.js';
import { getFormHooks } from './form-internal';
import type { NamePath } from './form-store.engine';
import type { ValidationRule } from './validation.engine';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm validateFields options', () => {
  it('returns silent errors and warnings without changing field metadata', async () => {
    const form = createForm({
      initialValues: { name: '' },
      rules: { name: [
        { required: true, message: 'Required' },
        { warningOnly: true, validator: () => 'Recommended' }
      ] }
    });
    const before = form.getFieldsError();

    await expect(form.validateFields({ validateOnly: true })).rejects.toMatchObject({
      outOfDate: false,
      errorFields: [{ name: ['name'], errors: ['Required'], warnings: ['Recommended'] }]
    });

    expect(form.getFieldsError()).toEqual(before);
    expect(form.errors).toEqual({});
    expect(form.isFieldTouched('name')).toBe(false);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('preserves existing errors while a silent validator is pending and after it succeeds', async () => {
    const pending = deferred<void>();
    let silent = false;
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => silent ? pending.promise : 'Existing error' }] }
    });
    await form.validateFields().catch(() => {});
    const before = form.getFieldsError();
    silent = true;

    const validation = form.validateFields(['name'], { validateOnly: true });

    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.getFieldsError()).toEqual(before);
    pending.resolve();
    await expect(validation).resolves.toEqual({ name: 'Anna' });
    expect(form.getFieldsError()).toEqual(before);
  });

  it('honors options after undefined names without registering unknown or empty selections', async () => {
    const form = createForm({
      initialValues: { name: '' }, rules: { name: [{ required: true, message: 'Required' }] }
    });
    const before = form.getFieldsError();
    const options: FormValidateOptions = { validateOnly: true };

    await expect(form.validateFields(undefined, options)).rejects.toMatchObject({ outOfDate: false });
    await expect(form.validateFields(['unknown'], options)).resolves.toEqual({ name: '' });
    await expect(form.validateFields([], options)).resolves.toEqual({ name: '' });

    expect(form.getFieldsError()).toEqual(before);
    expectTypeOf<ReturnType<typeof form.validateFields>>().toEqualTypeOf<Promise<{ name: string }>>();
  });

  it('does not mark a pristine field dirty after silent validation', async () => {
    const validator = vi.fn(() => 'Fresh');
    const form = createForm<{ fresh?: string }>({
      initialValues: {}, rules: { fresh: [{ validator }] }
    });
    await form.validateFields({ validateOnly: true }).catch(() => {});
    validator.mockClear();

    await expect(form.validateFields({ dirty: true })).resolves.toEqual({});

    expect(validator).not.toHaveBeenCalled();
    expect(form.getFieldError('fresh')).toEqual([]);
  });

  it.each([undefined, '', 0, false, null, [], {}])(
    'counts the initial value %s as dirty unless it is undefined',
    async (value) => {
      const validator = vi.fn(() => 'Checked');
      const form = createForm({ initialValues: { value }, rules: { value: [{ validator }] } });

      await form.validateFields({ dirty: true }).catch(() => {});

      expect(validator).toHaveBeenCalledTimes(value === undefined ? 0 : 1);
    }
  );

  it('keeps validated fields dirty and clears that state on reset', async () => {
    const validator = vi.fn(() => 'Fresh');
    const form = createForm<{ fresh?: string }>({ initialValues: {}, rules: { fresh: [{ validator }] } });
    await form.validateFields().catch(() => {});
    validator.mockClear();

    await form.validateFields({ dirty: true }).catch(() => {});

    expect(validator).toHaveBeenCalledTimes(1);
    form.resetFields();
    validator.mockClear();
    await form.validateFields({ dirty: true });
    expect(validator).not.toHaveBeenCalled();
  });

  it('marks a same-value setFieldValue dirty without changing the existing touched contract', async () => {
    const validator = vi.fn(() => 'Fresh');
    const form = createForm<{ fresh?: string }>({ initialValues: {}, rules: { fresh: [{ validator }] } });

    form.setFieldValue('fresh', undefined);
    await form.validateFields({ dirty: true }).catch(() => {});

    expect(validator).toHaveBeenCalledTimes(1);
    expect(form.isFieldTouched('fresh')).toBe(false);
  });

  it('marks changed merged values dirty while ignoring an equal undefined write', async () => {
    const validator = vi.fn(() => 'Fresh');
    const form = createForm<{ fresh?: string }>({ initialValues: {}, rules: { fresh: [{ validator }] } });
    form.setFieldsValue({ fresh: undefined });
    await form.validateFields({ dirty: true });

    expect(validator).not.toHaveBeenCalled();
    form.setFieldsValue({ fresh: 'Changed' });
    await form.validateFields({ dirty: true }).catch(() => {});
    expect(validator).toHaveBeenCalledTimes(1);
  });

  it('compares merged containers by their values before marking a child dirty', async () => {
    const validator = vi.fn(() => 'Payload');
    const form = createForm<{ parent?: { payload: { count: number } } }>({ initialValues: {} });
    getFormHooks(form)!.registerField({ name: ['parent', 'payload'], rules: [{ validator }] });
    form.setFieldValue('parent', { payload: { count: 1 } });
    form.setFieldsValue({ parent: { payload: { count: 1 } } });

    await form.validateFields({ dirty: true });

    expect(validator).not.toHaveBeenCalled();
    form.setFieldsValue({ parent: { payload: { count: 2 } } });
    await form.validateFields({ dirty: true }).catch(() => {});
    expect(validator).toHaveBeenCalledTimes(1);
  });

  it('does not mark a field without rules dirty merely by validating it', async () => {
    const validator = vi.fn(() => 'Fresh');
    let rules: readonly ValidationRule[] | undefined;
    const form = createForm({ initialValues: {} });
    getFormHooks(form)!.registerField({ name: 'fresh', get rules() { return rules; } });
    await form.validateFields();
    rules = [{ validator }];

    await form.validateFields({ dirty: true });

    expect(validator).not.toHaveBeenCalled();
  });

  it('selects descendants once with strict numeric segments and literal dotted names', async () => {
    const form = createForm({ initialValues: { user: {}, rows: [{}], 'user.name': '' } });
    const calls: string[] = [];
    const definitions: [NamePath, string][] = [
      [['user', 'name'], 'User name'], [['user', 'role'], 'User role'],
      ['user.name', 'Literal'], [['rows', 0, 'name'], 'Numeric'], [['rows', '0', 'name'], 'String']
    ];
    for (const [name, label] of definitions) {
      getFormHooks(form)!.registerField({ name, rules: [{ validator: () => { calls.push(label); } }] });
    }

    await form.validateFields([['user']]);
    expect(calls).toEqual([]);
    await form.validateFields([['user'], ['user', 'name']], { recursive: true });
    expect(calls).toEqual(['User name', 'User role']);
    calls.length = 0;
    await form.validateFields([['rows', 0]], { recursive: true, validateOnly: true });
    expect(calls).toEqual(['Numeric']);
    calls.length = 0;
    await form.validateFields(['user.name'], { recursive: true });
    expect(calls).toEqual(['Literal']);
  });

  it('combines recursive and dirty for a list default without including its pristine child', async () => {
    const calls: string[] = [];
    const form = createForm({ initialValues: {} });
    getFormHooks(form)!.registerField({
      name: 'users', isList: true, initialValue: ['Anna'],
      rules: [{ validator: () => { calls.push('list'); } }]
    });
    getFormHooks(form)!.registerField({
      name: ['users', 0], rules: [{ validator: () => { calls.push('child'); } }]
    });

    await form.validateFields(['users'], { recursive: true, dirty: true, validateOnly: true });

    expect(calls).toEqual(['list']);
    expect(form.getFieldError('users')).toEqual([]);
  });

  it('keeps visible validation active when a newer silent result finishes first', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    let count = 0;
    const form = createForm({ initialValues: { name: 'Anna' }, rules: { name: [{
      validator: () => ++count === 1 ? first.promise : second.promise
    }] } });
    const visible = form.validateFields().catch((error: unknown) => error);
    const silent = form.validateFields({ validateOnly: true }).catch((error: unknown) => error);

    second.resolve('Silent error');
    expect(await silent).toMatchObject({ outOfDate: false });
    expect(form.isFieldValidating('name')).toBe(true);
    expect(form.getFieldError('name')).toEqual([]);
    first.resolve('Visible error');

    expect(await visible).toMatchObject({ outOfDate: true });
    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.getFieldError('name')).toEqual(['Visible error']);
  });

  it('keeps a newer visible request active when an outdated silent result arrives', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    let count = 0;
    const form = createForm({ initialValues: { name: 'Anna' }, rules: { name: [{
      validator: () => ++count === 1 ? first.promise : second.promise
    }] } });
    const silent = form.validateFields({ validateOnly: true }).catch((error: unknown) => error);
    expect(form.isFieldValidating('name')).toBe(false);
    const visible = form.validateFields().catch((error: unknown) => error);

    first.resolve('Old silent error');
    expect(await silent).toMatchObject({ outOfDate: true });
    expect(form.isFieldValidating('name')).toBe(true);
    expect(form.getFieldError('name')).toEqual([]);
    second.resolve('Current error');
    await visible;
    expect(form.getFieldError('name')).toEqual(['Current error']);
  });

  it.each(['write', 'reset', 'unregister'] as const)(
    'invalidates silent snapshots after %s',
    async (operation) => {
      const pending = deferred<string>();
      const form = createForm({ initialValues: { name: 'Anna' } });
      const unregister = getFormHooks(form)!.registerField({
        name: 'name', rules: [{ validator: () => pending.promise }]
      });
      const validation = form.validateFields({ validateOnly: true }).catch((error: unknown) => error);

      if (operation === 'write') form.setFieldValue('name', 'Bob');
      else if (operation === 'reset') form.resetFields();
      else unregister();

      pending.resolve('Stale error');
      expect(await validation).toMatchObject({ outOfDate: true });
      expect(form.getFieldError('name')).toEqual([]);
      expect(form.isFieldValidating('name')).toBe(false);
    }
  );
});
