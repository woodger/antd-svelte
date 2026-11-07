import { describe, expect, it } from 'vitest';
import { getFormValue, mergeFormValues, setFormValue } from './form-store.engine';

// Expected values описывают публичную семантику NamePath, независимо от устройства store.
describe('Form NamePath store', () => {
  it('keeps dotted keys separate from array paths', () => {
    const initial = { 'user.name': 'Literal', user: { name: 'Anna', role: 'developer' } };
    const next = setFormValue(initial, ['user', 'name'], 'Alice');

    expect(getFormValue(next, 'user.name')).toBe('Literal');
    expect(getFormValue(next, ['user', 'name'])).toBe('Alice');
    expect(initial.user.name).toBe('Anna');
    expect(getFormValue(next, ['user', 'role'])).toBe('developer');
  });

  it('creates arrays only for numeric segments of missing containers', () => {
    const array = setFormValue({}, ['users', 0, 'name'], 'Anna');
    const object = setFormValue({}, ['users', '0', 'name'], 'Anna');

    expect(array).toEqual({ users: [{ name: 'Anna' }] });
    expect(object).toEqual({ users: { 0: { name: 'Anna' } } });
    expect(setFormValue({ users: null }, ['users', 1], false)).toEqual({
      users: [undefined, false]
    });
  });

  it('keeps explicit object containers when writing numeric keys', () => {
    expect(setFormValue({ users: {} }, ['users', 0], 'Anna')).toEqual({ users: { 0: 'Anna' } });
    expect(getFormValue({}, ['absent', 'name'])).toBeUndefined();
  });

  it('merges nested objects while replacing arrays and copying incoming containers', () => {
    const initial = { user: { name: 'Anna', role: 'developer' }, rows: [{ title: 'First' }] };
    const patch = { user: { role: 'reviewer' }, rows: [{ title: 'Replacement' }] };
    const next = mergeFormValues(initial, patch);
    patch.rows[0].title = 'Changed outside';

    expect(next).toEqual({
      user: { name: 'Anna', role: 'reviewer' }, rows: [{ title: 'Replacement' }]
    });
    expect(initial).toEqual({
      user: { name: 'Anna', role: 'developer' }, rows: [{ title: 'First' }]
    });
  });

  it('stores reserved property names as data without following object prototypes', () => {
    const next = setFormValue({}, ['__proto__', 'formStorePolluted'], true);
    const merged = mergeFormValues({}, JSON.parse('{"constructor":{"prototype":{"polluted":true}}}'));

    expect(getFormValue(next, ['__proto__', 'formStorePolluted'])).toBe(true);
    expect(getFormValue({}, 'toString')).toBeUndefined();
    expect(getFormValue({}, ['constructor', 'prototype'])).toBeUndefined();
    expect(Object.getPrototypeOf(next)).toBe(Object.prototype);
    expect(Object.hasOwn(Object.prototype, 'formStorePolluted')).toBe(false);
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);
    expect(getFormValue(merged, ['constructor', 'prototype', 'polluted'])).toBe(true);
  });
});
