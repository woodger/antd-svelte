import { describe, expect, it } from 'vitest';
import { getFormValue, mergeFormValues, sameFormValue, setFormValue } from './form-store.engine';

describe('sameFormValue', () => {
  it('compares own nested content without confusing missing keys or sparse positions', () => {
    const sparse: unknown[] = [];
    sparse.length = 1;

    expect(sameFormValue({ rows: [{ count: 1 }] }, { rows: [{ count: 1 }] })).toBe(true);
    expect(sameFormValue({ first: undefined }, { second: undefined })).toBe(false);
    expect(sameFormValue(sparse, [undefined])).toBe(false);
    expect(sameFormValue(NaN, NaN)).toBe(true);
  });

  it('compares shared and cyclic containers without treating repeated references as changes', () => {
    const left: { value: number; self?: unknown } = { value: 1 };
    left.self = left;
    const right: { value: number; self?: unknown } = { value: 1 };
    right.self = right;

    expect(sameFormValue(left, right)).toBe(true);
    right.value = 2;
    expect(sameFormValue(left, right)).toBe(false);
    const shared = { value: 1 };
    const equivalent = { value: 1 };
    expect(sameFormValue({ first: shared, second: shared }, {
      first: equivalent, second: equivalent
    })).toBe(true);
  });

  it('retains opaque instance identity instead of comparing only enumerable properties', () => {
    const date = new Date('2026-01-01');

    expect(sameFormValue(date, date)).toBe(true);
    expect(sameFormValue(date, new Date('2026-01-01'))).toBe(false);
    expect(sameFormValue(new Map(), new Map())).toBe(false);
  });
});

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
