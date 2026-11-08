import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { validateFieldValue, type ValidationRule } from './validation.engine';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<Value>((complete, fail) => { resolve = complete; reject = fail; });

  return { promise, resolve, reject };
}

describe('Form validateFirst rules', () => {
  it.each([undefined, false] as const)('starts all rules with mode=%s and retains rule order', async (mode) => {
    const first = deferred<string>();
    const second = deferred<string>();
    const calls: string[] = [];
    const result = validateFieldValue('Anna', {}, [
      { validator: () => { calls.push('first'); return first.promise; } },
      { validator: () => { calls.push('second'); return second.promise; } }
    ], mode);

    expect(calls).toEqual(['first', 'second']);
    second.resolve('Second');
    first.resolve('First');
    expect(await result).toEqual({ errors: ['First', 'Second'], warnings: [] });
  });

  it('stops sequential rules at the first failure without starting later validators', async () => {
    const calls: string[] = [];
    const result = await validateFieldValue('', {}, [
      { required: true, message: 'Required' },
      { validator: () => { calls.push('later'); return 'Later'; } }
    ], true);

    expect(result).toEqual({ errors: ['Required'], warnings: [] });
    expect(calls).toEqual([]);
  });

  it('waits for a successful sequential rule before starting the next one', async () => {
    const first = deferred<void>();
    const entered = deferred<void>();
    const calls: string[] = [];
    const result = validateFieldValue('Anna', {}, [
      { validator: () => { calls.push('first'); return first.promise; } },
      { validator: () => { calls.push('second'); entered.resolve(); return 'Second'; } }
    ], true);
    expect(calls).toEqual(['first']);

    first.resolve();
    await entered.promise;

    expect(await result).toEqual({ errors: ['Second'], warnings: [] });
    expect(calls).toEqual(['first', 'second']);
  });

  it('checks blocking rules before warnings without mutating the caller rule array', async () => {
    const rules: ValidationRule[] = [
      { warningOnly: true, validator: () => 'Warning' },
      { validator: () => 'Error' }
    ];
    const first = rules[0];

    expect(await validateFieldValue('Anna', {}, rules, true))
      .toEqual({ errors: ['Error'], warnings: [] });
    expect(rules[0]).toBe(first);
    expect(await validateFieldValue('Anna', {}, [
      { warningOnly: true, validator: () => 'First warning' },
      { validator: () => undefined },
      { warningOnly: true, validator: () => 'Second warning' }
    ], true)).toEqual({ errors: [], warnings: ['First warning'] });
  });

  it('returns the earliest parallel failure while another validator is still pending', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const result = validateFieldValue('Anna', {}, [
      { validator: () => first.promise }, { validator: () => second.promise }
    ], 'parallel');
    second.resolve('Second');

    expect(await result).toEqual({ errors: ['Second'], warnings: [] });
    first.reject(new Error('Late first'));
    await first.promise.catch(() => undefined);
  });

  it('waits for every parallel success instead of completing after the first success', async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    let settled = false;
    const result = validateFieldValue('Anna', {}, [
      { validator: () => first.promise }, { validator: () => second.promise }
    ], 'parallel').then((value) => { settled = true; return value; });
    first.resolve();
    await first.promise;
    expect(settled).toBe(false);

    second.resolve();
    expect(await result).toEqual({ errors: [], warnings: [] });
  });

  it.each([false, true])('keeps an early warning from bypassing pending errors, failure=%s', async (fail) => {
    const warning = deferred<string>();
    const blocking = deferred<string | void>();
    let settled = false;
    const result = validateFieldValue('Anna', {}, [
      { warningOnly: true, validator: () => warning.promise },
      { validator: () => blocking.promise }
    ], 'parallel').then((value) => { settled = true; return value; });
    warning.resolve('Warning');
    await warning.promise;
    expect(settled).toBe(false);

    blocking.resolve(fail ? 'Error' : undefined);
    expect(await result).toEqual(fail
      ? { errors: ['Error'], warnings: [] } : { errors: [], warnings: ['Warning'] });
  });

  it('returns the earliest warning once blocking rules pass without waiting for later warnings', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const result = validateFieldValue('Anna', {}, [
      { warningOnly: true, validator: () => first.promise },
      { warningOnly: true, validator: () => second.promise }
    ], 'parallel');
    second.resolve('Second warning');

    expect(await result).toEqual({ errors: [], warnings: ['Second warning'] });
    first.resolve('Late warning');
    await first.promise;
  });

  it.each([false, true, 'parallel'] as const)('finishes empty rules with mode=%s', async (mode) => {
    expect(await validateFieldValue('Anna', {}, [], mode)).toEqual({ errors: [], warnings: [] });
  });
});

describe('createForm validateFirst bindings', () => {
  it('reads the live binding mode for each request and preserves the model snapshot', async () => {
    const form = createForm({ initialValues: { name: 'Anna', sibling: 'Kept' } });
    let mode: boolean | 'parallel' = true;
    const remove = getFormHooks(form)!.registerField({
      name: 'name', get validateFirst() { return mode; },
      rules: [{ validator: () => 'First' }, { validator: () => 'Second' }]
    });
    await expect(form.validateFields(['name'])).rejects.toMatchObject({
      errors: { name: ['First'] }, values: { name: 'Anna', sibling: 'Kept' }
    });

    mode = false;
    await expect(form.validateFields(['name'])).rejects.toMatchObject({
      errors: { name: ['First', 'Second'] }
    });
    remove();
    expect(form.getFieldError('name')).toEqual([]);
  });

  it.each(['write', 'reset', 'remove'] as const)('invalidates a pending first-rule result after %s', async (action) => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' } });
    const remove = getFormHooks(form)!.registerField({
      name: 'name', validateFirst: 'parallel', rules: [{ validator: () => pending.promise }]
    });
    const result = form.validateFields(['name']).catch((error: unknown) => error);
    if (action === 'write') form.setFieldValue('name', 'New');
    else if (action === 'reset') form.resetFields(['name']);
    else remove();
    pending.resolve('Old');

    expect(await result).toMatchObject({ outOfDate: true });
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
    if (action !== 'remove') remove();
  });

  it('keeps silent first-error checks from changing visible messages or metadata', async () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    getFormHooks(form)!.registerField({
      name: 'name', validateFirst: true,
      rules: [{ validator: () => 'First' }, { validator: () => 'Second' }]
    });
    form.setFields([{ name: 'name', errors: ['Visible'], warnings: ['Note'], touched: true }]);
    const before = form.getFieldsError();

    await expect(form.validateFields(['name'], { validateOnly: true })).rejects.toMatchObject({
      errors: { name: ['First'] }, outOfDate: false
    });
    expect(form.getFieldsError()).toEqual(before);
    expect(form.isFieldTouched('name')).toBe(true);
    expect(form.isFieldValidating('name')).toBe(false);
    await tick();
    expect(form.getFieldsError()).toEqual(before);
  });
});
