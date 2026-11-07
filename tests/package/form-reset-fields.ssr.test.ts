import { createForm } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-reset-fields-observation.json';
import conflicts from '../browser/fixtures/ant-design-form-reset-conflicts-observation.json';
import FormResetFieldsFixtures from '../browser/fixtures/FormResetFieldsFixtures.svelte';

const initialValues = { name: 'Anna', sibling: 'Sibling', user: { name: 'Nested' } };

describe('Form resetFields public package', () => {
  it('pins settled source captures and records the difference between visible and stored parent values', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      settled: 'two animation frames before every capture'
    });
    expect(reference.observations).toContainEqual({
      case: 'parent-reset', tag: 'nested', name: ['user', 'name'], store: 'Nested', rendered: 'Nested again'
    });
    expect(conflicts.reference).toMatchObject({
      version: registry.upstream.version, archiveSha256: registry.upstream.archiveSha256
    });
    expect(conflicts.cases.find(({ id }) => id === 'named')!.values).toEqual({ people: { $undefined: true } });
    expect(conflicts.cases.find(({ id }) => id === 'full')!.values).toEqual({});
  });

  it('resets selected model metadata and defaults without clearing disjoint fields', () => {
    const form = createForm({ initialValues, rules: {
      name: [{ required: true }], sibling: [{ required: true }]
    } });
    form.setFields([
      { name: 'name', value: 'Draft', errors: ['Name'], touched: true },
      { name: 'sibling', value: 'Kept', warnings: ['Note'], touched: true }
    ]);
    form.resetFields(['name']);

    expect(form.values).toEqual({ name: 'Anna', sibling: 'Kept', user: { name: 'Nested' } });
    expect(form.isFieldTouched('name')).toBe(false);
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldTouched('sibling')).toBe(true);
    expect(form.getFieldWarning('sibling')).toEqual(['Note']);
  });

  it('supports empty and unknown selections and a root value reset through the public API', () => {
    const form = createForm<Record<string, unknown>>({ initialValues });
    const value = form.values;
    form.resetFields([]);
    expect(form.values).toBe(value);
    form.resetFields(['missing']);
    expect(Object.hasOwn(form.values, 'missing')).toBe(true);
    form.setFields([{ name: ['user', 'name'], value: 'Draft' }]);
    form.resetFields([[]]);
    expect(form.values).toEqual(initialValues);
    expect(Object.hasOwn(form.values, 'missing')).toBe(false);
  });

  it('keeps a late validator from restoring messages after its field is reset', async () => {
    let complete!: (message: string) => void;
    const pending = new Promise<string>((resolve) => { complete = resolve; });
    const form = createForm({ initialValues, rules: { name: [{ validator: () => pending }] } });
    const validation = form.validateFields(['name']).catch((error: unknown) => error);
    form.resetFields(['name']);
    complete('Late error');
    const result = await validation;

    expect(result).toMatchObject({ outOfDate: true });
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('renders native controls without mounting them or scheduling browser work during SSR', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormResetFieldsFixtures);

      expect(body).toContain('aria-label="Bound name"');
      expect(body).toContain('value="Anna"');
      expect(body).toContain('aria-label="Local sibling"');
      expect(body).toContain('"mounts":{}');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
