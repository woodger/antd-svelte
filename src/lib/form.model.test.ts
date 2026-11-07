import { describe, expect, expectTypeOf, it } from 'vitest';
import { createForm } from './form.model.svelte.js';
import { FormValidationError } from './FormValidationError';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

describe('createForm', () => {
  it('keeps values and errors isolated between form instances', async () => {
    const first = createForm(
      { initialValues: { email: '' }, rules: { email: [{ required: true }] } }
    );
    const second = createForm({ initialValues: { email: '' } });

    first.setFieldValue('email', 'first@example.com');
    await first.validateFields();

    expect(first.values.email).toBe('first@example.com');
    expect(second.values.email).toBe('');
    expect(second.errors).toEqual({});
  });

  it('returns validation errors without invoking the submission callback', async () => {
    const form = createForm(
      {
        initialValues: { email: '' },
        rules: { email: [{ required: true, message: 'Email required' }] }
      }
    );
    let submitted = false;

    const result = await form.submit(() => {
      submitted = true;
    });

    expect(result.status).toBe('invalid');
    expect(form.getFieldError('email')).toEqual(['Email required']);
    expect(form.isFieldTouched('email')).toBe(true);
    expect(submitted).toBe(false);
    expect(form.isSubmitting).toBe(false);
  });

  it('submits validated values once while an earlier submission is pending', async () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    const pending = deferred<void>();
    const entered = deferred<void>();
    const submitted: string[] = [];
    const first = form.submit(async (values) => {
      submitted.push(values.name);
      entered.resolve();
      await pending.promise;
    });
    await entered.promise;

    const second = await form.submit(() => {
      submitted.push('duplicate');
    });

    expect(second.status).toBe('busy');
    expect(form.isSubmitting).toBe(true);
    expect(submitted).toEqual(['Anna']);

    pending.resolve();

    expect((await first).status).toBe('success');
    expect(form.isSubmitting).toBe(false);
  });

  it('does not apply an asynchronous error after a field value changes', async () => {
    const pending = deferred<string>();
    const form = createForm({
      initialValues: { email: 'old@example.com' },
      rules: { email: [{ validator: () => pending.promise }] }
    });
    const validation = form.validateFields().catch((error: unknown) => error);

    form.setFieldValue('email', 'new@example.com');
    pending.resolve('Email is taken');
    const error = await validation;

    expect(error).toBeInstanceOf(FormValidationError);
    expect((error as FormValidationError).outOfDate).toBe(true);
    expect(form.getFieldError('email')).toEqual([]);
    expect(form.values.email).toBe('new@example.com');
  });

  it('keeps the newest validation result when requests finish in reverse order', async () => {
    const older = deferred<string>();
    const newer = deferred<void>();
    let attempt = 0;
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => ++attempt === 1 ? older.promise : newer.promise }] }
    });
    const first = form.validateFields().catch((error: unknown) => error);
    const second = form.validateFields();

    newer.resolve();
    await second;
    older.resolve('Stale error');
    await first;

    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('invalidates pending validation when the form is reset', async () => {
    const pending = deferred<string>();
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => pending.promise }] }
    });
    const validation = form.validateFields().catch((error: unknown) => error);

    form.resetFields();
    pending.resolve('Stale error');
    await validation;

    expect(form.values).toEqual({ name: 'Anna' });
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldTouched('name')).toBe(false);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('rejects submission of values changed during asynchronous validation', async () => {
    const pending = deferred<void>();
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => pending.promise }] }
    });
    let submitted = false;
    const submission = form.submit(() => {
      submitted = true;
    });

    form.resetFields();
    pending.resolve();
    const result = await submission;

    expect(result.status).toBe('invalid');
    expect(submitted).toBe(false);
  });

  it('keeps an active submission valid when disabling a field causes it to blur', async () => {
    const pending = deferred<void>();
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => pending.promise }] }
    });
    let submitted = false;
    const submission = form.submit(() => {
      submitted = true;
    });

    form.touchField('name');
    pending.resolve();
    const result = await submission;

    expect(result.status).toBe('success');
    expect(submitted).toBe(true);
  });

  it('revalidates touched dependent fields after another field changes', async () => {
    const form = createForm({
      initialValues: { password: 'first', confirmation: 'first' },
      rules: {
        confirmation: [
          { validator: (value, values) => value === values.password ? undefined : 'Mismatch' }
        ]
      }
    });
    form.touchField('confirmation');
    await form.validateFields(['confirmation']);

    form.setFieldValue('password', 'second');

    await expect(form.validateFields(['confirmation'])).rejects.toMatchObject(
      { errors: { confirmation: ['Mismatch'] } }
    );

    expect(form.getFieldError('confirmation')).toEqual(['Mismatch']);
  });

  it('restores initial values and clears errors and touched state', async () => {
    const form = createForm(
      { initialValues: { name: 'Anna' }, rules: { name: [{ required: true }] } }
    );
    form.setFieldValue('name', '');
    await form.submit(() => { });

    form.resetFields();

    expect(form.values).toEqual({ name: 'Anna' });
    expect(form.errors).toEqual({});
    expect(form.isFieldTouched('name')).toBe(false);
  });

  it('preserves untouched fields when applying partial values', () => {
    const form = createForm({ initialValues: { name: 'Anna', role: 'developer' } });

    form.setFieldsValue({ role: 'designer' });

    expect(form.values).toEqual({ name: 'Anna', role: 'designer' });
  });

  it('exposes submission failures and releases the submission lock for retry', async () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    const error = new Error('Save failed');

    const failed = await form.submit(async () => {
      throw error;
    });

    expect(failed).toEqual({ status: 'failed', error });
    expect(form.submissionError).toBe(error);
    expect(form.isSubmitting).toBe(false);

    const retry = await form.submit(() => { });

    expect(retry.status).toBe('success');
    expect(form.submissionError).toBeUndefined();
  });

  it('isolates initial arrays and restores fresh defaults on every reset', () => {
    const initial = { roles: [0, 2], name: 'Anna' };
    const form = createForm({ initialValues: initial });
    initial.roles.push(3);
    form.setFieldValue('roles', [4]);
    form.resetFields();

    expect(form.values.roles).toEqual([0, 2]);
    form.setFieldValue('roles', [5]);
    form.resetFields();

    expect(form.values.roles).toEqual([0, 2]);
    expect(initial.roles).toEqual([0, 2, 3]);
  });

  it('copies arrays supplied through both value setters', () => {
    const form = createForm({ initialValues: { roles: [] as number[], name: 'Anna' } });
    const roles = [0];
    form.setFieldValue('roles', roles);
    roles.push(1);

    expect(form.values.roles).toEqual([0]);

    const next = [2];
    form.setFieldsValue({ roles: next });
    next.push(3);

    expect(form.values).toEqual({ roles: [2], name: 'Anna' });
  });

  it('returns an independent array snapshot from validation and submission', async () => {
    const form = createForm({ initialValues: { roles: [0] } });
    const snapshot = await form.validateFields();
    snapshot.roles.push(2);

    expect(form.values.roles).toEqual([0]);

    const result = await form.submit((values) => {
      values.roles.push(3);
    });

    expect(result.status).toBe('success');
    expect(form.values.roles).toEqual([0]);
    form.resetFields();

    expect(form.values.roles).toEqual([0]);
  });

  it(
    'keeps asynchronous array validation snapshots stable and rejects a stale result',
    async () => {
      const pending = deferred<string>();
      let observed: readonly (string | number | boolean)[] | undefined;
      const form = createForm({
        initialValues: { roles: [0] },
        rules: {
          roles: [{
            validator: (value) => {
              if (Array.isArray(value))
                observed = value;
              return pending.promise;
            }
          }]
        }
      });
      const validation = form.validateFields().catch((error: unknown) => error);
      form.setFieldValue('roles', [2]);
      pending.resolve('Old role rejected');
      const error = await validation;

      expect(observed).toEqual([0]);
      expect(error).toBeInstanceOf(FormValidationError);
      expect((error as FormValidationError).outOfDate).toBe(true);
      expect((error as FormValidationError).values).toEqual({ roles: [0] });
      expect(form.values.roles).toEqual([2]);
      expect(form.getFieldError('roles')).toEqual([]);
    }
  );
});

it(
  'stores immutable Dayjs instances without coercion and restores the initial instance on reset',
  async () => {
    const dayjs = (await import('dayjs')).default;
    const initial = dayjs('2026-10-15T10:20:30.123');
    const form = createForm<{ when: import('dayjs').Dayjs | null; }>(
      { initialValues: { when: initial }, rules: { when: [{ required: true }] } }
    );

    expect(form.values.when).toBe(initial);
    const next = initial.add(1, 'day');
    form.setFieldValue('when', next);
    let received: unknown;
    const result = await form.submit(values => {
      received = values.when;
    });

    expect(result.status).toBe('success');
    expect(received).toBe(next);
    expect(dayjs.isDayjs(received)).toBe(true);
    form.setFieldValue('when', null);
    await form.validateFields().catch(() => { });

    expect(form.getFieldError('when')).toHaveLength(1);
    form.resetFields();

    expect(form.values.when).toBe(initial);
    expect(initial.millisecond()).toBe(123);
    expect(form.getFieldError('when')).toEqual([]);
  }
);

it(
  'copies range tuples while preserving immutable Dayjs values through submit and reset',
  async () => {
    const dayjs = (await import('dayjs')).default;
    const first = dayjs('2026-10-10T10:20:30.123');
    const last = first.add(10, 'day');
    const initial: [import('dayjs').Dayjs | null, import('dayjs').Dayjs | null] = [first, last];
    const form = createForm<{ period: typeof initial | null; }>(
      { initialValues: { period: initial } }
    );

    expect(form.values.period).not.toBe(initial);
    expect(form.values.period?.[0]).toBe(first);
    form.setFieldValue('period', [null, last]);
    let received: typeof initial | null = null;
    await form.submit(values => {
      received = values.period;
    });

    expect(received).toEqual([null, last]);
    expect(received).not.toBe(form.values.period);
    expect(dayjs.isDayjs(received?.[1])).toBe(true);
    form.resetFields();

    expect(form.values.period).toEqual(initial);
    expect(form.values.period?.[1]).toBe(last);
    expect(first.millisecond()).toBe(123);
  }
);

it('updates nested paths without replacing the root or conflating dotted names', () => {
  const form = createForm({
    initialValues: { user: { name: 'Anna', role: 'developer' }, 'user.name': 'Literal' }
  });
  const root = form.values;

  form.setFieldValue(['user', 'name'], 'Alice');

  expect(form.values).toBe(root);
  expect(form.getFieldValue(['user', 'name'])).toBe('Alice');
  expectTypeOf(form.getFieldValue(['user', 'name'])).toEqualTypeOf<string>();
  expect(form.getFieldValue('user.name')).toBe('Literal');
  expect(form.values.user.role).toBe('developer');
});

it('isolates nested defaults, writes and validation snapshots while preserving Dayjs', async () => {
  const dayjs = (await import('dayjs')).default;
  const date = dayjs('2026-10-15T10:20:30.123');
  const initial = { rows: [{ title: 'Initial', date }] };
  const form = createForm({ initialValues: initial });
  initial.rows[0].title = 'Changed outside';
  const next = { title: 'Replacement', date };

  form.setFieldValue(['rows', 0], next);
  next.title = 'Changed argument';
  const snapshot = await form.validateFields();
  snapshot.rows[0].title = 'Changed snapshot';

  expect(form.values.rows[0].title).toBe('Replacement');
  expect(form.values.rows[0].date).toBe(date);

  form.resetFields();

  expect(form.values.rows[0]).toEqual({ title: 'Initial', date });
  expect(form.values.rows[0].date).toBe(date);
  expect(initial.rows[0].title).toBe('Changed outside');
});

it('merges partial nested objects and replaces complete arrays', () => {
  const form = createForm({
    initialValues: { user: { name: 'Anna', role: 'developer' }, rows: [{ title: 'First' }] }
  });

  form.setFieldsValue({ user: { role: 'reviewer' }, rows: [] });

  expect(form.values).toEqual({ user: { name: 'Anna', role: 'reviewer' }, rows: [] });
  form.setFieldValue(['rows', 0, 'title'], 'New row');

  expect(form.values.rows).toEqual([{ title: 'New row' }]);
});

it('creates missing fields and distinguishes numeric segments from string keys', () => {
  const form = createForm({ initialValues: {} });

  form.setFieldValue(['numeric', 0, 'title'], 'Array row');
  form.setFieldValue(['stringNumeric', '0', 'title'], 'Object row');
  form.touchField(['numeric', 0, 'title']);

  expect(form.getFieldValue('numeric')).toEqual([{ title: 'Array row' }]);
  expect(form.getFieldValue('stringNumeric')).toEqual({ 0: { title: 'Object row' } });
  expect(form.isFieldTouched(['numeric', 0, 'title'])).toBe(true);
  expect(form.isFieldTouched(['stringNumeric', '0', 'title'])).toBe(false);
  expect(form.getFieldsError([['numeric', 0, 'title']])).toEqual([
    { name: ['numeric', 0, 'title'], errors: [], warnings: [] }
  ]);
});

it('exposes validation errorFields while preserving the flat errors projection', async () => {
  const form = createForm({
    initialValues: { title: '' }, rules: { title: [{ required: true, message: 'Title required' }] }
  });
  const error = await form.validateFields().catch((reason: unknown) => reason);

  expect(error).toBeInstanceOf(FormValidationError);
  expect(error).toMatchObject({
    errors: { title: ['Title required'] },
    errorFields: [{ name: ['title'], errors: ['Title required'] }],
    outOfDate: false
  });
  expect(form.getFieldsError()).toEqual([
    { name: ['title'], errors: ['Title required'], warnings: [] }
  ]);
});

it('rejects an async validation snapshot after a nested object changes', async () => {
  const pending = deferred<string>();
  const form = createForm({
    initialValues: { user: { name: 'Anna' } },
    rules: { user: [{ validator: () => pending.promise }] }
  });
  const validation = form.validateFields().catch((error: unknown) => error);

  form.setFieldValue(['user', 'name'], 'Alice');
  pending.resolve('Old user rejected');
  const error = await validation;

  expect(error).toMatchObject({ outOfDate: true, values: { user: { name: 'Anna' } } });
  expect(form.values.user.name).toBe('Alice');
  expect(form.getFieldError('user')).toEqual([]);
});

it('clears field errors when a partial update explicitly supplies undefined', async () => {
  const form = createForm<{ title: string | undefined }>({
    initialValues: { title: undefined }, rules: { title: [{ required: true }] }
  });
  await form.validateFields().catch(() => {});

  form.setFieldsValue({ title: undefined });

  expect(form.getFieldError('title')).toEqual([]);
  expect(form.values.title).toBeUndefined();
});

it('returns undefined for an optional parent without losing the nested value type', () => {
  const form = createForm<{ user?: { name: string } | null }>({ initialValues: {} });

  expectTypeOf(form.getFieldValue(['user', 'name'])).toEqualTypeOf<string | undefined>();
  expect(form.getFieldValue(['user', 'name'])).toBeUndefined();
  form.setFieldValue(['user', 'name'], 'Anna');

  expect(form.values.user?.name).toBe('Anna');
});

it('replaces the root through an empty NamePath without retaining removed fields', () => {
  const form = createForm<{ title: string; hidden?: string }>({
    initialValues: { title: 'Initial', hidden: 'Removed' }
  });

  form.setFieldValue([], { title: 'Replacement' });

  expect(form.getFieldValue([])).toEqual({ title: 'Replacement' });
  expect(form.getFieldValue('hidden')).toBeUndefined();
});
