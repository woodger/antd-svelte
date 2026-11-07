import { createForm, FormValidationError } from 'antd-svelte';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-form-validation-options-observation.json';
import concurrency from '../browser/fixtures/ant-design-form-validation-concurrency-observation.json';

describe('Form validation options public package', () => {
  it('pins source evidence and records the ignored second-argument defect', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(concurrency.reference).toEqual(reference.reference);
    expect(reference.cases.find(({ id }) => id === 'undefined-name-list-options-observation')?.fields)
      .toEqual([{ name: ['fresh'], errors: ['Fresh'], warnings: [] }]);
  });

  it('matches source dirty and silent metadata through validation, reset and writes', async () => {
    let calls: string[] = [];
    function create() {
      return createForm<{ fresh?: string }>({ initialValues: {}, rules: { fresh: [{
        validator: () => { calls.push('Fresh'); return 'Fresh'; }
      }] } });
    }
    let form = create();
    const ids = [
      'dirty-pristine', 'silent-pristine', 'dirty-after-silent', 'normal-pristine',
      'silent-preserves-error', 'dirty-after-normal', 'dirty-after-reset',
      'dirty-after-same-value', 'dirty-after-equal-merge', 'dirty-after-merge'
    ];
    for (const id of ids) {
      if (id === 'dirty-after-reset') form.resetFields();
      if (id === 'dirty-after-same-value') form.setFieldValue('fresh', undefined);
      if (id === 'dirty-after-equal-merge') {
        form = create();
        form.setFieldsValue({ fresh: undefined });
      }
      if (id === 'dirty-after-merge') form.setFieldsValue({ fresh: 'changed' });
      calls = [];
      const options = id.startsWith('dirty') ? { dirty: true }
        : id.startsWith('silent') ? { validateOnly: true } : undefined;
      const result = await form.validateFields(options).then(() => ({ status: 'success' }), summarize);
      const sample = reference.cases.find((entry) => entry.id === id)!;

      expect(calls).toEqual(sample.calls);
      expect(result).toEqual(sample.result);
      expect(form.getFieldsError()).toEqual(sample.fields);
    }
  });

  it.each([false, true])('matches source parallel-request metadata with silent first=%s', async (silentFirst) => {
    const pending: ((message: string) => void)[] = [];
    let entered!: () => void;
    const started = new Promise<void>((resolve) => { entered = resolve; });
    const form = createForm({ initialValues: { name: 'Anna' }, rules: { name: [{
      validator: () => new Promise<string>((resolve) => {
        pending.push(resolve);
        if (pending.length === 2) entered();
      })
    }] } });
    const first = form.validateFields({ validateOnly: silentFirst }).then(() => ({ status: 'success' }), summarize);
    const second = form.validateFields({ validateOnly: !silentFirst }).then(() => ({ status: 'success' }), summarize);
    await started;

    function check(id: string, result?: unknown) {
      const sample = concurrency.cases.find((entry) => entry.id === id)!;
      expect(form.getFieldsError()).toEqual(sample.fields);
      expect(form.isFieldValidating('name')).toBe(sample.validating);
      expect(form.isFieldTouched('name')).toBe(sample.touched);
      if (result) expect(result).toEqual(sample.result);
    }

    if (silentFirst) {
      pending[0]('Old silent error');
      check('outdated-silent-keeps-visible-pending', await first);
      pending[1]('Current visible error');
      check('current-visible-result', await second);
    } else {
      check('silent-keeps-visible-pending');
      pending[1]('Silent error');
      check('silent-result-without-ui', await second);
      pending[0]('Visible error');
      check('visible-result-after-silent', await first);
    }
  });
});

function summarize(error: unknown) {
  if (!(error instanceof FormValidationError)) throw error;

  return { status: 'invalid', outOfDate: error.outOfDate, errorFields: error.errorFields };
}
