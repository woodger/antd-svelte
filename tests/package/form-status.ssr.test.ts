import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-status-reference.json';
import FormStatusFixtures from '../browser/fixtures/FormStatusFixtures.svelte';
import FormStatusControls from '../browser/fixtures/FormStatusControls.svelte';

describe('Form validation status public package', () => {
  it('pins source visual status priorities and error metadata separately', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const success = reference.cases.find(({ sample }) => sample.id === 'override-success')!;
    const pending = reference.cases.find(({ sample }) => sample.id === 'pending-error')!;

    expect(success.metrics.input.root).toEqual(['has-success']);
    expect(success.metrics.input.ariaInvalid).toBe('true');
    expect(success.metrics.input.messages).toEqual(['Invalid']);
    expect(pending.metrics.input.root).toEqual(['is-validating']);
  });

  it('renders named and nameless status without discarding stored errors during SSR', () => {
    const success = render(FormStatusFixtures, {
      props: { initialCase: 'override-success' }
    }).body;
    const pending = render(FormStatusFixtures, { props: { initialCase: 'pending-error' } }).body;
    const nameless = render(FormStatusFixtures, {
      props: { initialCase: 'nameless-success' }
    }).body;

    expect(success).toContain('ant-form-item-has-success');
    expect(success).toContain('ant-input-status-success');
    expect(success).toContain('aria-invalid="true"');
    expect(success).toContain('ant-form-item-explain-error');
    expect(pending).toContain('ant-form-item-is-validating');
    expect(pending).toContain('ant-input-status-validating');
    expect(nameless).toContain('ant-input-status-success');
    expect(nameless).not.toMatch(/<input[^>]*\sname=/);
  });

  it('associates Transfer root errors even when the visual status is success', () => {
    const body = render(FormStatusControls, { props: { initialErrors: true } }).body;
    const transfer = body.match(/<div(?=[^>]*class="ant-transfer[ "])[^>]*>/)![0];
    const description = transfer.match(/aria-describedby="([^"]+)"/)![1];

    expect(transfer).toContain('aria-invalid="true"');
    expect(body).toContain(`id="${description}"`);
    expect(transfer).toContain('ant-transfer-status-success');
  });
});
