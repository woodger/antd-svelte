import { describe, expect, it } from 'vitest';
import { createForm } from './form.model.svelte.js';
import { getFormHooks } from './form-internal';
import type { NamePath } from './form-store.engine';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm aggregate metadata', () => {
  it('requires one touched descendant per selected group and every binding without names', async () => {
    const form = createForm({ initialValues: { user: {}, 'user.name': '', rows: [{}] } });
    const names: NamePath[] = [
      ['user', 'name'], ['user', 'role'], 'user.name', ['rows', 0, 'name'], ['rows', '0', 'name']
    ];
    for (const name of names) getFormHooks(form)!.registerField({ name });

    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldsTouched(true)).toBe(false);
    form.touchField(['user', 'name']);
    await form.validateFields();

    expect(form.isFieldsTouched([['user']], true)).toBe(true);
    expect(form.isFieldsTouched([['user', 'name'], ['user', 'role']], true)).toBe(false);
    expect(form.isFieldsTouched([['user'], 'user.name'], true)).toBe(false);
    expect(form.isFieldsTouched(true)).toBe(false);
    for (const name of names.slice(1)) form.touchField(name);
    await form.validateFields();

    expect(form.isFieldsTouched(true)).toBe(true);
    expect(form.isFieldsTouched([['rows', 0], ['rows', '0']], true)).toBe(true);
    form.resetFields();
    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldsTouched(true)).toBe(false);
  });

  it('ignores unbound value containers while retaining model rules and explicit touch metadata', async () => {
    const empty = createForm({ initialValues: { user: {}, unused: 'Value' } });
    expect(empty.isFieldsTouched()).toBe(false);
    expect(empty.isFieldsTouched(true)).toBe(true);

    const model = createForm({ initialValues: { first: '', second: '', container: {} }, rules: {
      first: [{ required: true }], second: [{ required: true }]
    } });
    expect(model.isFieldsTouched(true)).toBe(false);
    model.touchField('first');
    await model.validateFields().catch(() => {});
    expect(model.isFieldsTouched(true)).toBe(false);
    model.touchField('second');
    await model.validateFields().catch(() => {});
    expect(model.isFieldsTouched(true)).toBe(true);

    empty.touchField(['custom', 'name']);
    expect(empty.isFieldsTouched()).toBe(true);
    expect(empty.isFieldsTouched(['custom'], true)).toBe(true);
  });

  it('keeps list roots out of the global all check while explicit groups still require touch', async () => {
    const form = createForm({ initialValues: {} });
    getFormHooks(form)!.registerField({ name: 'people', isList: true, initialValue: [] });

    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldsTouched(true)).toBe(true);
    expect(form.isFieldsTouched(['people'], true)).toBe(false);
    const remove = getFormHooks(form)!.registerField({ name: ['people', 0, 'name'] });
    expect(form.isFieldsTouched(true)).toBe(false);
    form.touchField(['people', 0, 'name']);
    await form.validateFields();
    expect(form.isFieldsTouched(true)).toBe(true);
    expect(form.isFieldsTouched(['people'], true)).toBe(true);
    remove();
    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldsTouched(true)).toBe(true);
  });

  it('handles empty selections, root paths, missing names and undefined overloads without writes', () => {
    const form = createForm({ initialValues: { name: '' }, rules: { name: [{ required: true }] } });
    const before = form.getFieldsError();

    expect(form.isFieldsTouched([])).toBe(false);
    expect(form.isFieldsTouched([], true)).toBe(true);
    expect(form.isFieldsTouched([[]], true)).toBe(false);
    expect(form.isFieldsTouched(undefined, true)).toBe(false);
    expect(form.isFieldsTouched(['missing'], true)).toBe(false);
    expect(form.isFieldsValidating([])).toBe(false);
    expect(form.isFieldsValidating([[]])).toBe(false);
    expect(form.getFieldsError()).toEqual(before);
  });

  it('reports no validating flag for controls without rules during validation', async () => {
    const form = createForm({ initialValues: { name: '' } });
    getFormHooks(form)!.registerField({ name: 'name' });

    const validation = form.validateFields();

    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.isFieldsValidating()).toBe(false);
    await validation;
    expect(form.isFieldsValidating()).toBe(false);
  });

  it('matches exact validating paths while a silent request leaves visible flags intact', async () => {
    const visible = deferred<void>();
    const silent = deferred<void>();
    const form = createForm({ initialValues: { rows: [{}] } });
    getFormHooks(form)!.registerField({
      name: ['rows', 0, 'name'], rules: [{ validator: () => visible.promise }]
    });
    getFormHooks(form)!.registerField({
      name: ['rows', '0', 'name'], rules: [{ validator: () => silent.promise }]
    });
    const first = form.validateFields([['rows', 0, 'name']]).catch((error: unknown) => error);
    const second = form.validateFields([['rows', '0', 'name']], { validateOnly: true });

    expect(form.isFieldsValidating()).toBe(true);
    expect(form.isFieldsValidating(['rows'])).toBe(false);
    expect(form.isFieldsValidating([['rows', 0]])).toBe(false);
    expect(form.isFieldsValidating([['rows', 0, 'name']])).toBe(true);
    expect(form.isFieldsValidating([['rows', '0', 'name']])).toBe(false);
    silent.resolve();
    await second;
    expect(form.isFieldsValidating()).toBe(true);
    visible.resolve();
    await first;
    expect(form.isFieldsValidating()).toBe(false);
  });

  it('checks every matching validating binding even when the first has no rules', async () => {
    const pending = deferred<void>();
    const form = createForm({ initialValues: { name: '' } });
    getFormHooks(form)!.registerField({ name: 'name' });
    getFormHooks(form)!.registerField({ name: 'name', rules: [{ validator: () => pending.promise }] });

    const validation = form.validateFields();

    expect(form.isFieldValidating('name')).toBe(true);
    expect(form.isFieldsValidating(['name'])).toBe(true);
    pending.resolve();
    await validation;
    expect(form.isFieldsValidating(['name'])).toBe(false);
  });

  it.each(['reset', 'remove'] as const)('clears aggregates after %s before a late validator finishes', async (action) => {
    const pending = deferred<void>();
    const form = createForm({ initialValues: {} });
    const remove = getFormHooks(form)!.registerField({
      name: ['user', 'name'], rules: [{ validator: () => pending.promise }]
    });
    const validation = form.validateFields().catch((error: unknown) => error);

    if (action === 'reset') form.resetFields();
    else remove();

    expect(form.isFieldsValidating()).toBe(false);
    expect(form.isFieldsTouched()).toBe(false);
    pending.resolve();
    await validation;
    expect(form.isFieldsValidating()).toBe(false);
    expect(form.isFieldsTouched()).toBe(false);
  });
});
