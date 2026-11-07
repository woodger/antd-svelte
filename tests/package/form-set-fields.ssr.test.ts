import { createForm, type FormFieldData } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-set-fields-observation.json';
import FormSetFieldsFixtures from '../browser/fixtures/FormSetFieldsFixtures.svelte';

const nameRules = { name: [{ required: true }] };

describe('Form setFields public package', () => {
  it('pins source behavior and records stale-value and undefined-boolean observations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const stale = reference.observations.find(({ id }) => id === 'observation-stale-value-complete')!;
    expect(stale.values.name).toBe('New value');
    expect(stale.meta[0].errors).toEqual(['Async rejected']);
    const current = reference.observations.find(({ id }) => id === 'observation-current-value-complete')!;
    expect(current.values.name).toBe('New value');
    expect(current.meta[0].errors).toEqual([]);
    expect(reference.observations.find(({ id }) => id === 'observation-undefined-flags')!.meta[0].touched)
      .toEqual({ $undefined: true });
    expect(reference.cases.find(({ id }) => id === 'ruleless-complete')!.meta[1])
      .toMatchObject({ errors: ['Bare server'], warnings: ['Bare note'], validating: true });
  });

  it('applies typed public updates without implicit validation or binding unmounted values', async () => {
    const form = createForm({ initialValues: { name: 'Anna', unbound: 'Hidden' }, rules: nameRules });
    const updates: readonly FormFieldData[] = [
      { name: 'name', value: 'Updated', errors: ['Server'], warnings: ['Note'], touched: true },
      { name: 'unbound', value: 'Changed', errors: ['Ignored'], touched: true }
    ];
    form.setFields(updates);

    expect(form.values).toEqual({ name: 'Updated', unbound: 'Changed' });
    expect(form.getFieldError('name')).toEqual(['Server']);
    expect(form.getFieldWarning('name')).toEqual(['Note']);
    expect(form.isFieldTouched('name')).toBe(true);
    expect(form.getFieldError('unbound')).toEqual([]);
    expect(form.isFieldTouched('unbound')).toBe(false);
    await form.validateFields({ validateOnly: true });
    expect(form.getFieldError('name')).toEqual(['Server']);
    await form.validateFields();
    expect(form.getFieldError('name')).toEqual([]);
    form.resetFields();
    expect(form.values.name).toBe('Anna');
    expect(form.isFieldsTouched()).toBe(false);
  });

  it('renders native inputs without starting validators or browser resources during SSR', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormSetFieldsFixtures);

      expect(body).toContain('name="name"');
      expect(body).toContain('value="Anna"');
      expect(body).toContain('name="user_name"');
      expect(body.match(/name="rows_0_name"/g)).toHaveLength(2);
      expect(body).toContain('"calls":0');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps newly supplied messages when an older snapshot validation completes', async () => {
    let complete!: (message: string) => void;
    const pending = new Promise<string>((resolve) => { complete = resolve; });
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    form.setFields([{ name: 'name', value: 'New value', errors: ['Server after write'] }]);
    complete('Async rejected');
    const result = await validation;

    expect(result).toMatchObject({ outOfDate: true });
    expect(form.values.name).toBe('New value');
    expect(form.getFieldError('name')).toEqual(['Server after write']);
    expect(form.isFieldsValidating()).toBe(false);
  });

  it('accepts explicit empty values and optional flags without leaking undefined metadata', () => {
    const form = createForm({ initialValues: { name: 'Anna' }, rules: nameRules });
    form.setFields([{ name: 'name', value: undefined, touched: undefined, validating: undefined }]);
    form.setFields([{ name: 'name', validated: false }]);
    const collected: unknown[] = [];
    form.getFieldsValue({ filter: (meta) => { collected.push(meta); return true; } });

    expect(Object.hasOwn(form.values, 'name')).toBe(true);
    expect(form.getFieldValue('name')).toBeUndefined();
    expect(collected).toEqual([{
      name: ['name'], touched: false, validating: false, validated: true, errors: [], warnings: []
    }]);
  });
});
