import { describe, expect, it, vi } from 'vitest';
import { createForm, type FormFieldMeta } from './form.model.svelte';
import { FormValidationError } from './FormValidationError';
import { getFormHooks } from './form-internal';
import reference from '../../tests/browser/fixtures/ant-design-form-no-style-reference.json';

describe('Form internal field metadata events', () => {
  it('retains explicit update order and suppresses repeated equal metadata', () => {
    const form = createForm({ initialValues: { first: 'A', second: 'B' } });
    const events: string[] = [];
    const hooks = getFormHooks(form)!;
    for (const name of ['first', 'second']) {
      hooks.registerField({
        name, onMetaChange: meta => { if (meta) events.push(meta.errors[0] ?? ''); }
      });
    }

    form.setFields([
      { name: 'second', errors: ['Second error'] }, { name: 'first', errors: ['First error'] }
    ]);
    form.setFields([{ name: 'first', errors: ['First error'] }]);

    expect(events).toEqual(reference.eventOrder.parent.errors);
    expect(reference.reference.version).toBe('6.6.8');
  });

  it('publishes existing model errors on registration and releases the UI without losing model metadata', () => {
    const form = createForm({ initialValues: { name: 'A' }, rules: { name: [{}] } });
    form.setFields([{ name: 'name', errors: ['Stored error'] }]);
    const events: (FormFieldMeta | undefined)[] = [];
    const remove = getFormHooks(form)!.registerField({
      name: 'name', onMetaChange: meta => { events.push(meta); }
    });

    expect(events[0]?.errors).toEqual(['Stored error']);
    remove();

    expect(events.at(-1)).toBeUndefined();
    expect(form.getFieldError('name')).toEqual(['Stored error']);
  });

  it('does not invent metadata events for validation without rules', async () => {
    const form = createForm({ initialValues: { name: 'A' } });
    const onMetaChange = vi.fn();
    getFormHooks(form)!.registerField({ name: 'name', onMetaChange });

    await form.validateFields();
    expect(onMetaChange).not.toHaveBeenCalled();
    form.setFields([{ name: 'name', errors: [] }]);

    expect(onMetaChange).toHaveBeenCalledOnce();
    expect(onMetaChange.mock.calls[0][0]).toMatchObject({ touched: false, errors: [] });
  });

  it('keeps silent validation separate from the visible metadata stream', async () => {
    const form = createForm({
      initialValues: { name: '' }, rules: { name: [{ required: true }] }
    });
    const onMetaChange = vi.fn();
    getFormHooks(form)!.registerField({ name: 'name', onMetaChange });

    await expect(form.validateFields({ validateOnly: true }))
      .rejects.toBeInstanceOf(FormValidationError);

    expect(onMetaChange).not.toHaveBeenCalled();
    expect(form.getFieldError('name')).toEqual([]);
  });

  it('publishes reset and prevents a stale validator result from reappearing in a UI collector', async () => {
    let release!: (result: string | undefined) => void;
    const form = createForm({ initialValues: { name: 'A' }, rules: { name: [{
      validator: () => new Promise<string | undefined>(resolve => { release = resolve; })
    }] } });
    const events: (FormFieldMeta | undefined)[] = [];
    getFormHooks(form)!.registerField({ name: 'name', onMetaChange: meta => { events.push(meta); } });

    const pending = form.validateFields();
    expect(events.at(-1)?.validating).toBe(true);
    form.resetFields(['name']);
    expect(events.at(-1)).toMatchObject({ validating: false, touched: false, errors: [] });
    release('Stale error');
    await expect(pending).rejects.toMatchObject({ outOfDate: true });

    expect(events.some(meta => meta?.errors.includes('Stale error'))).toBe(false);
    expect(form.getFieldError('name')).toEqual([]);
  });

  it('reports cleared messages and touched state without exposing mutable name path aliases', () => {
    const form = createForm({ initialValues: { rows: [{ name: 'A' }, { name: 'B' }] } });
    const path: (string | number)[] = ['rows', 0, 'name'];
    const events: (FormFieldMeta | undefined)[] = [];
    getFormHooks(form)!.registerField({
      get name() { return path; }, onMetaChange: meta => { events.push(meta); }
    });

    form.setFields([{ name: path, errors: ['Invalid'], warnings: ['Check'] }]);
    path[1] = 1;
    form.touchField(path);
    form.setFieldValue(path, 'Edited');

    expect(events[0]?.name).toEqual(['rows', 0, 'name']);
    expect(events.at(-1)).toMatchObject({
      name: ['rows', 1, 'name'], touched: true, errors: [], warnings: []
    });
    expect(events[0]?.errors).toEqual(['Invalid']);
  });
});
