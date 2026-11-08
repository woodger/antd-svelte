import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createForm } from './form.model.svelte';
import { getFormHooks, type FormFieldRegistration } from './form-internal';
import type { ValidationRule } from './validation.engine';

const registrations: (() => void)[] = [];

function register(form: object, field: FormFieldRegistration) {
  const cleanup = getFormHooks(form)!.registerField(field);
  registrations.push(cleanup);

  return cleanup;
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(async () => {
  for (const cleanup of registrations.splice(0)) cleanup();
  await vi.runAllTimersAsync();
  vi.useRealTimers();
});

describe('Form validateDebounce', () => {
  it('marks automatic validation pending and runs the current value at its deadline', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); return 'Invalid'; }
    }] });

    form.touchField('name');

    expect(form.isFieldTouched('name')).toBe(true);
    expect(form.isFieldValidating('name')).toBe(true);
    expect(form.getFieldError('name')).toEqual([]);
    await vi.advanceTimersByTimeAsync(299);
    expect(calls).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls).toEqual(['Alpha']);
    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.getFieldError('name')).toEqual(['Invalid']);
  });

  it('restarts the deadline on a touched write and skips validators for obsolete values', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); }
    }] });
    form.touchField('name');
    await vi.advanceTimersByTimeAsync(200);

    form.setFieldValue('name', 'Beta');
    await vi.advanceTimersByTimeAsync(299);

    expect(calls).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls).toEqual(['Beta']);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it.each([undefined, 0])('keeps immediate automatic validation for delay=%s', async (delay) => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: delay, rules: [{
      validator: (value) => { calls.push(value); }
    }] });

    form.touchField('name');

    expect(calls).toEqual(['Alpha']);
    await vi.runAllTimersAsync();
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('runs explicit validation immediately and cancels the pending automatic attempt', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); return 'Invalid'; }
    }] });
    form.touchField('name');

    const result = form.validateFields(['name']);

    expect(calls).toEqual(['Alpha']);
    await expect(result).rejects.toMatchObject({ outOfDate: false, errors: { name: ['Invalid'] } });
    await vi.advanceTimersByTimeAsync(600);
    expect(calls).toEqual(['Alpha']);
    expect(form.getFieldError('name')).toEqual(['Invalid']);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('runs silent validation immediately while retaining the pending visible attempt', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); return 'Invalid'; }
    }] });
    form.touchField('name');

    await expect(form.validateFields({ validateOnly: true })).rejects.toMatchObject({
      outOfDate: false, errors: { name: ['Invalid'] }
    });

    expect(calls).toEqual(['Alpha']);
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(true);
    await vi.advanceTimersByTimeAsync(300);
    expect(calls).toEqual(['Alpha', 'Alpha']);
    expect(form.getFieldError('name')).toEqual(['Invalid']);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('submits without the debounce and still waits for the blocking validator', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    let complete!: (message: string) => void;
    const calls: unknown[] = [];
    const submitted: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => {
        calls.push(value);
        return new Promise<string>((resolve) => { complete = resolve; });
      }
    }] });
    form.touchField('name');

    const result = form.submit((values) => { submitted.push(values); });

    expect(calls).toEqual(['Alpha']);
    expect(form.isSubmitting).toBe(true);
    await vi.advanceTimersByTimeAsync(600);
    expect(calls).toEqual(['Alpha']);
    expect(submitted).toEqual([]);
    complete('Invalid');
    expect(await result).toMatchObject({ status: 'invalid', error: { outOfDate: false } });
    expect(form.isSubmitting).toBe(false);
    expect(submitted).toEqual([]);
  });

  it.each([undefined, ['name']])('cancels delayed work during reset selection=%j', async (names) => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); return 'Invalid'; }
    }] });
    form.touchField('name');

    form.resetFields(names);
    await vi.advanceTimersByTimeAsync(600);

    expect(calls).toEqual([]);
    expect(form.getFieldValue('name')).toBe('Alpha');
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldTouched('name')).toBe(false);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('stops delayed validators when a field unmounts and preserves its value', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    const cleanup = register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); return 'Invalid'; }
    }] });
    form.touchField('name');

    cleanup();
    await vi.advanceTimersByTimeAsync(600);

    expect(calls).toEqual([]);
    expect(form.getFieldValue('name')).toBe('Alpha');
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('retains standalone model rules and touched metadata after cancelling a UI delay', async () => {
    const calls: unknown[] = [];
    const form = createForm({ initialValues: { name: 'Alpha' }, rules: { name: [{
      validator: (value) => { calls.push(value); }
    }] } });
    const cleanup = register(form, { name: 'name', validateDebounce: 300 });
    form.touchField('name');

    cleanup();
    await vi.advanceTimersByTimeAsync(600);

    expect(calls).toEqual([]);
    expect(form.isFieldTouched('name')).toBe(true);
    expect(form.isFieldValidating('name')).toBe(false);
    await expect(form.validateFields()).resolves.toEqual({ name: 'Alpha' });
    expect(calls).toEqual(['Alpha']);
  });

  it('cancels delayed work for a manually supplied field value or validating flag', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: (value) => { calls.push(value); }
    }] });
    form.touchField('name');

    form.setFields([{ name: 'name', value: 'Beta', errors: ['Manual'] }]);
    await vi.advanceTimersByTimeAsync(600);

    expect(calls).toEqual([]);
    expect(form.getFieldValue('name')).toBe('Beta');
    expect(form.getFieldError('name')).toEqual(['Manual']);
    expect(form.isFieldValidating('name')).toBe(false);
    form.touchField('name');
    form.setFields([{ name: 'name', validating: true }]);
    await vi.advanceTimersByTimeAsync(600);
    expect(calls).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(true);
  });

  it('tracks independent deadlines for touched fields', async () => {
    const form = createForm({ initialValues: { name: 'Alpha', other: 'Beta' } });
    const calls: unknown[] = [];
    for (const [name, delay] of [['name', 300], ['other', 600]] as const) {
      register(form, { name, validateDebounce: delay, rules: [{
        validator: (value) => { calls.push(value); }
      }] });
    }

    form.touchField('name');
    form.touchField('other');
    await vi.advanceTimersByTimeAsync(300);

    expect(calls).toEqual(['Alpha']);
    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.isFieldValidating('other')).toBe(true);
    await vi.advanceTimersByTimeAsync(300);
    expect(calls).toEqual(['Alpha', 'Beta']);
    expect(form.isFieldsValidating()).toBe(false);
  });

  it('cancels a pending attempt when explicit validation finds that its rules were removed', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: unknown[] = [];
    let rules: ValidationRule[] = [{ validator: (value) => { calls.push(value); } }];
    register(form, { name: 'name', validateDebounce: 300, get rules() { return rules; } });
    form.touchField('name');

    rules = [];
    await expect(form.validateFields()).resolves.toEqual({ name: 'Alpha' });
    await vi.advanceTimersByTimeAsync(600);

    expect(calls).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.getFieldError('name')).toEqual([]);
  });

  it('keeps the current deadline and rule snapshot when their props change', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const calls: string[] = [];
    let delay = 300;
    let rules: ValidationRule[] = [{ validator: () => { calls.push('Old'); } }];
    register(form, { name: 'name', get validateDebounce() { return delay; },
      get rules() { return rules; }
    });
    form.touchField('name');

    delay = 10;
    rules = [{ validator: () => { calls.push('New'); } }];
    await vi.advanceTimersByTimeAsync(299);

    expect(calls).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls).toEqual(['Old']);
    form.touchField('name');
    await vi.advanceTimersByTimeAsync(10);
    expect(calls).toEqual(['Old', 'New']);
  });

  it('does not let a completed old validator replace the newer delayed result', async () => {
    const form = createForm({ initialValues: { name: 'Alpha' } });
    const completions: ((message: string) => void)[] = [];
    register(form, { name: 'name', validateDebounce: 300, rules: [{
      validator: () => new Promise<string>((resolve) => { completions.push(resolve); })
    }] });
    form.touchField('name');
    await vi.advanceTimersByTimeAsync(300);

    form.setFieldValue('name', 'Beta');
    completions[0]('Old');
    await vi.advanceTimersByTimeAsync(299);

    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    completions[1]('New');
    await vi.runAllTimersAsync();
    expect(form.getFieldError('name')).toEqual(['New']);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('skips obsolete paths when a list row changes its name during the delay', async () => {
    const form = createForm({ initialValues: { names: ['Alpha', 'Beta'] } });
    const calls: unknown[] = [];
    let index = 0;
    register(form, { get name() { return ['names', index]; }, validateDebounce: 300,
      rules: [{ validator: (value) => { calls.push(value); } }]
    });
    form.touchField(['names', 0]);

    index = 1;
    await vi.advanceTimersByTimeAsync(300);

    expect(calls).toEqual([]);
    expect(form.isFieldValidating(['names', 1])).toBe(false);
    form.touchField(['names', 1]);
    await vi.advanceTimersByTimeAsync(300);
    expect(calls).toEqual(['Beta']);
  });
});
