import type { FormProps, FormSemantic } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-size-reference.json';
import FormSizeFixtures from '../browser/fixtures/FormSizeFixtures.svelte';

describe('Form size public package', () => {
  it('pins source size inheritance, explicit medium and sibling isolation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const large = reference.cases.find(({ sample }) => sample.id === 'local-large')!.metrics;
    const medium = reference.cases.find(({ sample }) => sample.id === 'local-medium')!.metrics;
    expect(large.input.height).toBe(40);
    expect(large.nested.height).toBe(40);
    expect(large.sibling.height).toBe(32);
    expect(medium.form).toEqual(['owner-size-medium']);
    expect(medium.divider.start).toBe('16px');
    expect(reference.cases[0].metrics.divider.start).toBe('24px');
  });

  it('publishes size and normalized callbacks and renders descendants without forwarding size to form', () => {
    const props: Pick<FormProps<{ name: string }>, 'size'> = { size: 'large' };
    const semantic: FormSemantic = ({ props }) => ({ label: `size-${props.size ?? 'unset'}` });
    const large = render(FormSizeFixtures, { props: { initialCase: 'local-large' } }).body;
    const empty = render(FormSizeFixtures, { props: { initialCase: 'component-false-small' } }).body;

    expect(props.size).toBe('large');
    expect(semantic).toBeTypeOf('function');
    expect(large).toContain('ant-form-large');
    expect(large).toContain('owner-label-size-large');
    expect(large).toContain('ant-input-lg');
    expect(large).not.toMatch(/<form\b[^>]*\bsize=/);
    expect(empty).not.toMatch(/<form\b/);
    expect(empty).toContain('ant-input-sm');
    expect(empty).toContain('owner-label-size-small');
  });
});
