import { createForm, type FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-validate-first-observation.json';
import FormValidateFirstFixtures from '../browser/fixtures/FormValidateFirstFixtures.svelte';

describe('Form validateFirst public package', () => {
  it('pins source scheduling and the early-warning bypass observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ id, phase }) =>
      id === 'parallel-warning-early' && phase === 'warning'
    )).toMatchObject({ outcomes: [{ status: 'success' }], validating: false });
    expect(reference.cases.find(({ id, phase }) =>
      id === 'parallel-warning-early' && phase === 'first'
    )).toMatchObject({ fields: [{ name: ['name'], errors: [], warnings: ['Warning'] }] });
  });

  it('supports all current field mode types and preserves standalone parallel model messages', async () => {
    const modes: FormItemProps['validateFirst'][] = [undefined, false, true, 'parallel'];
    const form = createForm({ initialValues: { name: '' }, rules: { name: [
      { required: true, message: 'Required' }, { validator: () => 'Custom' }
    ] } });

    expect(modes).toHaveLength(4);
    await expect(form.validateFields()).rejects.toMatchObject({
      errors: { name: ['Required', 'Custom'] }, outOfDate: false
    });
    expect(form.getFieldError('name')).toEqual(['Required', 'Custom']);
  });

  it('renders the public field modes without starting validators or timers during SSR', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormValidateFirstFixtures);

      expect(body).toContain('Form validateFirst');
      expect(body).toContain('value="Anna"');
      expect(body).toContain('"calls":[]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
