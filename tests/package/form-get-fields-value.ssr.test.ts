import { createForm, type FormFieldMeta, type FormGetFieldsValueConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-get-fields-value-observation.json';
import FormGetFieldsValueFixtures from '../browser/fixtures/FormGetFieldsValueFixtures.svelte';
import { snapshotFormValues } from '../browser/fixtures/form-value-projection';

const initialValues = {
  user: { name: 'Anna', role: 'Writer', extra: 'Hidden' }, 'user.name': 'Literal',
  rows: [{ name: 'First', extra: 'Hidden' }], unbound: 'Hidden'
};

describe('Form getFieldsValue public package', () => {
  it('pins observations and the current source list projection instead of the outdated description', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const list = reference.cases.find(({ id }) => id === 'list')!;
    expect(list.values.mounted).toEqual({ people: [{ name: 'Anna' }, { name: 'Bob' }] });
    expect(list.values.rejected).toEqual({ people: [] });
    expect(list.values.store).toEqual({ people: [{ name: 'Anna', extra: 'Hidden' }, { name: 'Bob' }] });
  });

  it('matches unmounted source projections and null metadata without creating field records', () => {
    const form = createForm<Record<string, unknown>>({ initialValues });
    const before = form.getFieldsError();
    const { id, ...sample } = reference.cases.find(({ id }) => id === 'empty-form')!;

    expect(id).toBe('empty-form');
    expect(snapshotFormValues(form)).toEqual(sample);
    expect(form.getFieldsError()).toEqual(before);
    expect(form.getFieldsValue(true)).toBe(form.values);
  });

  it('renders native controls and whole-store values while UI registrations still await mount', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormGetFieldsValueFixtures);

      expect(body).toContain('name="user_name"');
      expect(body).toContain('value="Anna"');
      expect(body).toContain('aria-label="Projected snapshot">{"values":{"mounted":{},"store":');
      expect(body).toContain('"unbound":"Hidden"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('filters existing model rules through typed metadata and preserves legacy touched semantics', async () => {
    const form = createForm({ initialValues: { name: 'Anna', unbound: 'Hidden' }, rules: {
      name: [{ required: true }]
    } });
    const options: FormGetFieldsValueConfig = { filter: (meta) => !!meta?.touched };
    const metadata: (FormFieldMeta | null)[] = [];

    expect(form.getFieldsValue()).toEqual({ name: 'Anna' });
    expect(form.getFieldsValue(options)).toEqual({});
    form.touchField('name');
    await form.validateFields();
    expect(form.getFieldsValue(options)).toEqual({ name: 'Anna' });
    form.resetFields();
    form.setFieldsValue({ name: 'Updated' });
    expect(form.getFieldsValue(['name', 'unbound'], (meta) => {
      metadata.push(meta);
      return !!meta?.validated;
    })).toEqual({ name: 'Updated' });
    expect(metadata).toEqual([{
      name: ['name'], touched: false, validating: false, validated: true, errors: [], warnings: []
    }, null]);
  });

  it('keeps silent validation out of metadata while normal validation updates pending and completed projections', async () => {
    let complete!: (message: string) => void;
    let pending = new Promise<string>((resolve) => { complete = resolve; });
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending }]
    } });
    const filter: FormGetFieldsValueConfig = { filter: (meta) => !!meta?.validated };
    const silent = form.validateFields({ validateOnly: true }).catch(() => {});

    expect(form.getFieldsValue(true, (meta) => !!meta?.validating)).toEqual({});
    complete('Rejected');
    await silent;
    expect(form.getFieldsValue(filter)).toEqual({});
    pending = new Promise<string>((resolve) => { complete = resolve; });
    const normal = form.validateFields().catch(() => {});
    expect(form.getFieldsValue(true, (meta) => !!meta?.validating)).toEqual({ name: 'Anna' });
    complete('Rejected');
    await normal;
    expect(form.getFieldsValue(filter)).toEqual({ name: 'Anna' });
    expect(form.getFieldsValue({ filter: (meta) => !!meta?.errors.length })).toEqual({ name: 'Anna' });
    form.resetFields();
    expect(form.getFieldsValue(filter)).toEqual({});
  });
});
