import { describe, expect, it, vi } from 'vitest';
import { createForm } from './form.model.svelte';
import { FormValidationError } from './FormValidationError';
import { getFormHooks } from './form-internal';

describe('Form field initial values', () => {
  it.each([null, false, 0, '', 'Form'])(
    'retains the Form default %j above a field initial value', (value) => {
      const form = createForm({ initialValues: { name: value } });
      getFormHooks(form)!.registerField({ name: 'name', initialValue: 'Local' });

      form.setFieldValue('name', 'Edited');
      form.resetFields(['name']);

      expect(form.getFieldValue('name')).toEqual(value);
    }
  );

  it('initializes a missing value without marking touched and keeps later stored values', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const hooks = getFormHooks(form)!;
    const remove = hooks.registerField({ name: ['profile', 'name'], initialValue: 'Local' });

    expect(form.getFieldValue(['profile', 'name'])).toBe('Local');
    expect(form.isFieldTouched(['profile', 'name'])).toBe(false);
    form.setFieldValue(['profile', 'name'], 'Edited');
    remove();
    hooks.registerField({ name: ['profile', 'name'], initialValue: 'New default' });

    expect(form.getFieldValue(['profile', 'name'])).toBe('Edited');
    form.resetFields([['profile', 'name']]);
    expect(form.getFieldValue(['profile', 'name'])).toBe('New default');
  });

  it('copies mutable default containers while preserving opaque values', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const date = new Date('2026-01-02T00:00:00Z');
    const initialValue = { labels: ['First'], date };
    getFormHooks(form)!.registerField({ name: 'details', initialValue });

    initialValue.labels.push('Second');
    expect(form.getFieldValue('details')).toEqual({ labels: ['First'], date });
    expect((form.getFieldValue('details') as typeof initialValue).date).toBe(date);
    form.resetFields(['details']);
    expect(form.getFieldValue('details')).toEqual(initialValue);
  });

  it('uses current field defaults only on reset and ignores conflicting duplicate defaults', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    let initialValue = 'First';
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: 'name', get initialValue() { return initialValue; } });

    initialValue = 'Second';
    expect(form.getFieldValue('name')).toBe('First');
    form.resetFields(['name']);
    expect(form.getFieldValue('name')).toBe('Second');

    const remove = hooks.registerField({ name: 'name', initialValue: 'Conflicting' });
    form.resetFields(['name']);
    expect(form.getFieldValue('name')).toBeUndefined();
    remove();
    form.resetFields(['name']);
    expect(form.getFieldValue('name')).toBe('Second');
  });

  it('leaves list field defaults to the list when resetting a selected child', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: 'people', isList: true, initialValue: [{}] });
    hooks.registerField({
      name: ['people', 0, 'name'], isListField: true, initialValue: 'Local'
    });

    expect(form.getFieldValue(['people', 0, 'name'])).toBe('Local');
    form.resetFields([['people', 0, 'name']]);
    expect(form.getFieldValue(['people', 0, 'name'])).toBeUndefined();
    expect(form.getFieldValue('people')).toHaveLength(1);
  });

  it('resets overlapping field defaults against Form defaults rather than earlier field writes', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: 'profile', initialValue: { name: 'Parent' } });
    hooks.registerField({ name: ['profile', 'name'], initialValue: 'Child' });

    expect(form.getFieldValue(['profile', 'name'])).toBe('Parent');
    form.resetFields();
    expect(form.getFieldValue(['profile', 'name'])).toBe('Child');
  });

  it('uses field mount order for defaults without changing value projection order', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const hooks = getFormHooks(form)!;
    const parent = Symbol('parent');
    const child = Symbol('child');
    hooks.registerField({ name: 'profile', mountKey: parent, initialValue: { name: 'Parent' } });
    hooks.registerField({ name: ['profile', 'name'], mountKey: child, initialValue: 'Child' });
    const projected: unknown[] = [];

    hooks.markFieldMounted(child);
    hooks.markFieldMounted(parent);
    form.resetFields();
    form.getFieldsValue({ filter: meta => {
      projected.push(meta?.name);
      return true;
    } });

    expect(form.getFieldValue(['profile', 'name'])).toBe('Parent');
    expect(projected).toEqual([['profile'], ['profile', 'name']]);
  });

  it('includes untouched local defaults in dirty validation and excludes pristine siblings', async () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const initial = vi.fn(() => 'Invalid');
    const pristine = vi.fn(() => 'Invalid');
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: 'initial', initialValue: '', rules: [{ validator: initial }] });
    hooks.registerField({ name: 'pristine', rules: [{ validator: pristine }] });

    await expect(form.validateFields({ dirty: true })).rejects.toBeInstanceOf(FormValidationError);
    expect(initial).toHaveBeenCalledOnce();
    expect(pristine).not.toHaveBeenCalled();
    expect(form.isFieldsTouched()).toBe(false);
  });
});
