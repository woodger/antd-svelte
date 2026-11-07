import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { createForm, type FormFieldMeta } from './form.model.svelte.js';
import { getFormHooks } from './form-internal';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm getFieldsValue', () => {
  it('projects known bindings, expands a parent and reads unbound paths without registering them', () => {
    const form = createForm({ initialValues: {
      user: { name: 'Anna', hidden: 'Secret' }, 'user.name': 'Literal',
      rows: [{ name: 'First', hidden: 'Secret' }], unbound: 'Hidden'
    } });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: ['user', 'name'] });
    hooks.registerField({ name: 'user.name' });
    hooks.registerField({ name: ['rows', 0, 'name'] });
    const before = form.getFieldsError();

    expect(form.getFieldsValue()).toEqual({
      user: { name: 'Anna' }, 'user.name': 'Literal', rows: [{ name: 'First' }]
    });
    expect(form.getFieldsValue([['user']])).toEqual({ user: { name: 'Anna' } });
    expect(form.getFieldsValue(['user.name'])).toEqual({ 'user.name': 'Literal' });
    expect(form.getFieldsValue(['unbound'])).toEqual({ unbound: 'Hidden' });
    expect(form.getFieldsValue(['missing'])).toEqual({ missing: undefined });
    expect(form.getFieldsValue([])).toEqual({});
    expect(form.getFieldsValue([[]])).toEqual(form.values);
    expect(form.getFieldsValue(true)).toBe(form.values);
    expect(form.getFieldsError()).toEqual(before);
  });

  it('passes null to the filter for explicit unknown paths and includes model-owned rules', () => {
    const form = createForm({ initialValues: { name: 'Anna', unbound: 'Hidden' }, rules: {
      name: [{ required: true }]
    } });
    const seen: (FormFieldMeta | null)[] = [];

    expect(form.getFieldsValue()).toEqual({ name: 'Anna' });
    expect(form.getFieldsValue(['name', 'unbound', 'missing'], (meta) => {
      seen.push(meta);
      return meta === null;
    })).toEqual({ unbound: 'Hidden', missing: undefined });
    expect(seen).toEqual([{
      name: ['name'], touched: false, validating: false, validated: false, errors: [], warnings: []
    }, null, null]);
    expect(form.getFieldsValue(true, () => true)).toEqual({ name: 'Anna' });
    expect(form.getFieldsValue({ filter: () => false })).toEqual({});
  });

  it('keeps store-only entries outside the projection after legacy touch and submit', async () => {
    const form = createForm({ initialValues: {
      user: { name: 'Anna', hidden: 'Secret' }, unbound: 'Hidden'
    } });
    getFormHooks(form)!.registerField({ name: ['user', 'name'] });
    form.touchField('unbound');
    await form.submit(() => {});

    expect(form.isFieldTouched('unbound')).toBe(true);
    expect(form.getFieldsValue()).toEqual({ user: { name: 'Anna' } });
    expect(form.getFieldsValue(['unbound'], (meta) => meta === null)).toEqual({ unbound: 'Hidden' });
  });

  it('fills list roots independently of the filter and projects only the existing row controls', () => {
    const form = createForm({ initialValues: {
      people: [{ name: 'Anna', hidden: 'Secret' }, { name: 'Bob' }]
    } });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: 'people', isList: true });
    const remove = hooks.registerField({ name: ['people', 0, 'name'] });
    hooks.registerField({ name: ['people', 1, 'name'] });
    const seen: (FormFieldMeta | null)[] = [];

    expect(form.getFieldsValue()).toEqual({ people: [{ name: 'Anna' }, { name: 'Bob' }] });
    expect(form.getFieldsValue(['people'])).toEqual(form.getFieldsValue());
    expect(form.getFieldsValue({ filter: (meta) => {
      seen.push(meta);
      return false;
    } })).toEqual({ people: [] });
    expect(seen.map((meta) => meta?.name)).toEqual([
      ['people', 0, 'name'], ['people', 1, 'name']
    ]);
    remove();
    expect(form.getFieldsValue([['people', 0]])).toEqual({
      people: [{ name: 'Anna', hidden: 'Secret' }]
    });
  });

  it('selects the exact parent before descendants and uses the last binding for a named query', async () => {
    const pending = deferred<void>();
    const form = createForm({ initialValues: { user: { name: 'Anna', role: 'Writer' } } });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: ['user', 'name'] });
    hooks.registerField({ name: 'user' });
    hooks.registerField({ name: ['user', 'name'], rules: [{ validator: () => pending.promise }] });
    const validation = form.validateFields();
    const seen: (FormFieldMeta | null)[] = [];

    expect(form.getFieldsValue([['user']], (meta) => {
      seen.push(meta);
      return !!meta?.validating;
    })).toEqual({ user: { name: 'Anna' } });
    expect(seen.map((meta) => ({ name: meta?.name, validating: meta?.validating }))).toEqual([
      { name: ['user'], validating: false }, { name: ['user', 'name'], validating: true }
    ]);
    pending.resolve();
    await validation;
  });

  it('tracks completed visible validation, warnings, external writes and reset without silent changes', async () => {
    let pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' }, rules: { name: [
      { validator: () => pending.promise },
      { warningOnly: true, validator: () => 'Heads up' }
    ] } });
    function meta() {
      let result: FormFieldMeta | null = null;
      form.getFieldsValue({ filter: (value) => { result = value; return false; } });
      return result as FormFieldMeta | null;
    }
    const silent = form.validateFields({ validateOnly: true }).catch(() => {});
    expect(meta()).toMatchObject({ validated: false, validating: false, errors: [], warnings: [] });
    pending.resolve('Rejected');
    await silent;
    expect(meta()).toMatchObject({ validated: false, validating: false, errors: [], warnings: [] });
    pending = deferred<string>();
    const normal = form.validateFields().catch(() => {});
    expect(form.getFieldsValue(true, (value) => !!value?.validating)).toEqual({ name: 'Anna' });
    expect(meta()).toMatchObject({ validated: false, validating: true });
    pending.resolve('Rejected');
    await normal;
    expect(meta()).toMatchObject({
      validated: true, validating: false, errors: ['Rejected'], warnings: ['Heads up']
    });
    expect(form.getFieldsValue({ filter: (value) => !!value?.validated })).toEqual({ name: 'Anna' });
    form.resetFields();
    expect(meta()).toMatchObject({ validated: false, validating: false, errors: [], warnings: [] });
    form.setFieldsValue({ name: 'Updated' });
    expect(meta()).toMatchObject({ validated: true, validating: false, touched: false });
  });

  it('keeps typed numeric segments distinct from literal keys and string array keys', () => {
    const form = createForm({ initialValues: { rows: [{ name: 'First' }], 'rows.0': 'Literal' } });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: ['rows', 0, 'name'] });
    hooks.registerField({ name: ['rows', '0', 'name'] });
    hooks.registerField({ name: 'rows.0' });
    const seen: (FormFieldMeta | null)[] = [];

    expect(form.getFieldsValue([['rows', '0']], (meta) => {
      seen.push(meta);
      return true;
    })).toEqual({ rows: { 0: { name: 'First' } } });
    expect(seen.map((meta) => meta?.name)).toEqual([['rows', '0', 'name']]);
    expect(form.getFieldsValue([['rows', 0]])).toEqual({ rows: [{ name: 'First' }] });
    expect(form.getFieldsValue(['rows.0'])).toEqual({ 'rows.0': 'Literal' });
  });

  it.each(['reset', 'remove'] as const)(
    'keeps late validation out of completed projections after %s',
    async (action) => {
      const pending = deferred<string>();
      const form = createForm({ initialValues: { name: 'Anna' } });
      const remove = getFormHooks(form)!.registerField({
        name: 'name', rules: [{ validator: () => pending.promise }]
      });
      const validation = form.validateFields().catch(() => {});
      if (action === 'reset') form.resetFields();
      else remove();

      expect(form.getFieldsValue(true, (meta) => !!meta?.validating)).toEqual({});
      pending.resolve('Rejected');
      await validation;
      expect(form.getFieldsValue({ filter: (meta) => !!meta?.validated })).toEqual({});
      expect(form.getFieldError('name')).toEqual([]);
    }
  );

  it('keeps plain projections and filter metadata isolated while retaining opaque values', () => {
    const when = dayjs('2026-11-07');
    const form = createForm({ initialValues: { user: { name: 'Anna' }, when }, rules: {
      when: [{ required: true }]
    } });
    getFormHooks(form)!.registerField({ name: ['user', 'name'] });
    const result = form.getFieldsValue([['user'], 'when']);
    result.user.name = 'Modified';
    const filtered = form.getFieldsValue({ filter: (meta) => {
      if (meta) {
        Reflect.set(meta.name, 0, 'Modified');
        Reflect.set(meta.errors, 0, 'Injected');
        Reflect.set(meta.warnings, 0, 'Injected');
      }
      return true;
    } });

    expect(result.when).toBe(when);
    expect(form.values.user.name).toBe('Anna');
    expect(form.getFieldError('when')).toEqual([]);
    expect(form.getFieldWarning('when')).toEqual([]);
    expect(filtered).toEqual({ when, user: { name: 'Anna' } });
    expect(form.getFieldsValue()).toEqual({ when, user: { name: 'Anna' } });
  });
});
