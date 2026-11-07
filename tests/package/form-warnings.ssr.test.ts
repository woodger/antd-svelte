import { createForm } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import FormWarningsFixtures from '../browser/fixtures/FormWarningsFixtures.svelte';
import reference from '../browser/fixtures/ant-design-form-warning-observation.json';
import lifecycle from '../browser/fixtures/ant-design-form-warning-lifecycle-observation.json';

describe('Form warningOnly public package', () => {
  it('matches source metadata before, during and after asynchronous warning validation', async () => {
    let complete!: (message: string) => void;
    const pending = new Promise<string>((resolve) => { complete = resolve; });
    let held = false;
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{
        warningOnly: true, validator: () => held ? pending : 'First warning'
      }] }
    });

    function check(id: string) {
      const sample = lifecycle.cases.find((entry) => entry.id === id)!;
      expect(form.getFieldsError()).toEqual(sample.fields);
      expect(form.getFieldWarning('name')).toEqual(sample.warnings);
      expect(form.isFieldValidating('name')).toBe(sample.validating);
    }

    await form.validateFields();
    check('first-result');
    held = true;
    const validation = form.validateFields();
    check('pending-revalidation');
    complete('Next warning');
    await validation;
    check('next-result');
  });

  it('returns the pinned source warning metadata and successful validation on the server', async () => {
    const form = createForm({
      initialValues: { name: '' },
      rules: { name: [{ required: true, warningOnly: true, message: 'Name recommended' }] }
    });
    const sample = reference.cases.find((entry) => entry.id === 'required-warning')!;

    await expect(form.validateFields()).resolves.toEqual(sample.validation!.values);
    expect(form.getFieldsError()).toEqual(sample.fields);
    expect(form.getFieldWarning('name')).toEqual(sample.warnings);
    expect(form.isFieldRequired('name')).toBe(false);
  });

  it('renders optional warning rules without starting validation or timers during SSR', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormWarningsFixtures);

      expect(body).toContain('Optional name');
      expect(body).toContain('Recommended name');
      expect(body).not.toContain('ant-form-item-has-warning');
      expect(body).not.toContain('ant-input-status-warning');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
