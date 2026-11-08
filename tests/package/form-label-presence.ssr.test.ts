import type { FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-label-presence-reference.json';
import FormLabelPresenceFixtures from '../browser/fixtures/FormLabelPresenceFixtures.svelte';

describe('Form label presence public package', () => {
  it('pins absent labels, null alignment and source shorthand defects', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'missing-576-ltr')!.metrics[0].label)
      .toBeNull();
    expect(reference.cases.find(({ sample }) => sample.id === 'null-form-576-ltr')!.metrics[0]
      .control.classes).toContain('ant-col-offset-6');
    expect(reference.cases.find(({ sample }) => sample.id === 'numeric-wrapper-576-ltr')!.metrics[0]
      .control.classes).not.toContain('ant-col-sm-12');
    expect(reference.observations.map(({ id }) => id)).toEqual(['numeric-label', 'numeric-wrapper']);
  });

  it('publishes optional labels and renders aligned required controls without browser work', () => {
    const missing: Pick<FormItemProps, 'label'> = {};
    const empty: Pick<FormItemProps, 'label'> = { label: '' };
    const aligned: Pick<FormItemProps, 'label'> = { label: null };
    const body = render(FormLabelPresenceFixtures, { props: { initialRequired: true } }).body;
    const numeric = render(FormLabelPresenceFixtures, {
      props: { initialCase: 'numeric-wrapper-576-ltr' }
    }).body;

    expect(missing.label).toBeUndefined();
    expect(empty.label).toBe('');
    expect(aligned.label).toBeNull();
    expect(body).toContain('ant-col-offset-6');
    expect(body).not.toMatch(/<[^>]+class="[^"]*\bant-form-item-label(?:\s|")/);
    expect(body).toMatch(/<input\b[^>]*\brequired(?:="")?[\s>]/);
    expect(body).toContain('aria-label="Control"');
    expect(body).toContain('value="Alpha"');
    expect(numeric).toContain('ant-col-sm-12');
    expect(numeric).toContain('ant-col-sm-offset-6');
  });
});
