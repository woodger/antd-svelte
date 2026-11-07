import { describe, expect, it } from 'vitest';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import type { NamePath } from './form-store.engine';

describe('Form DOM registrations', () => {
  it('leaves unmounted fields and SSR DOM operations empty', () => {
    const form = createForm({ initialValues: { name: 'Anna' } });

    expect(form.getFieldInstance('name')).toBeUndefined();
    expect(form.getFieldInstance('missing')).toBeUndefined();
    expect(form.focusField('name')).toBeUndefined();
    expect(form.scrollToField('name', { focus: true })).toBeUndefined();
    expect(form.values).toEqual({ name: 'Anna' });
  });

  it('preserves literal and typed names and isolates form instances', () => {
    const form = createForm({ initialValues: {} });
    const other = createForm({ initialValues: {} });
    const names: NamePath[] = [['user', 'name'], 'user_name', ['rows', 0], ['rows', '0']];
    const refs = names.map(() => ({}));
    names.forEach((name, index) => {
      getFormHooks(form)!.registerField({ name, getInstance: () => refs[index] });
    });

    names.forEach((name, index) => {
      expect(form.getFieldInstance(name)).toBe(refs[index]);
      expect(other.getFieldInstance(name)).toBeUndefined();
    });
    expect(form.getFieldInstance([])).toBeUndefined();
  });

  it('reads a replaced ref lazily and delegates focus with the original receiver', () => {
    const form = createForm({ initialValues: {} });
    const calls: object[] = [];
    let current = { focus() { calls.push(this); } };
    getFormHooks(form)!.registerField({ name: 'field', getInstance: () => current });
    const original = current;
    form.focusField('field');
    current = { focus() { calls.push(this); } };
    form.focusField('field');

    expect(calls).toEqual([original, current]);
    expect(calls[0]).toBe(original);
    expect(calls[1]).toBe(current);
    expect(form.getFieldInstance('field')).toBe(current);
  });

  it('moves a keyed binding to its current name and releases it on cleanup', () => {
    const form = createForm({ initialValues: {} });
    let index = 0;
    const ref = {};
    const remove = getFormHooks(form)!.registerField({
      get name() { return ['people', index]; }, getInstance: () => ref
    });
    expect(form.getFieldInstance(['people', 0])).toBe(ref);

    index = 1;
    expect(form.getFieldInstance(['people', 0])).toBeUndefined();
    expect(form.getFieldInstance(['people', 1])).toBe(ref);
    remove();
    expect(form.getFieldInstance(['people', 1])).toBeUndefined();
  });

  it('uses the latest exact binding without leaking a detached persistent field ref', () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    const first = {};
    const second = {};
    const unregister = getFormHooks(form)!.registerField({ name: 'name', getInstance: () => first });
    const removeLatest = getFormHooks(form)!.registerField({ name: 'name', getInstance: () => second });
    expect(form.getFieldInstance('name')).toBe(second);

    removeLatest();
    expect(form.getFieldInstance('name')).toBe(first);
    unregister();
    expect(form.getFieldInstance('name')).toBeUndefined();
    expect(form.values.name).toBe('Anna');
  });
});
