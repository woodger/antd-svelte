import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-no-style-reference.json';
import FormNoStyleFixtures from '../browser/fixtures/FormNoStyleFixtures.svelte';

describe('Form noStyle public package', () => {
  it('pins source wrapper suppression and recorded accessibility/lifecycle defects', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const error = reference.cases.find(({ sample }) => sample.id === 'error')!.metrics;
    expect(error.roots).toBe(1);
    expect(error.parent?.classes).toEqual([]);
    expect(error.input.descriptionConnected).toBe(false);
    expect(reference.transitions[1].metrics.parent?.errors).toEqual(['Invalid']);
  });

  it('renders a noStyle control without a layout wrapper during SSR', () => {
    const body = render(FormNoStyleFixtures, { props: { initialCase: 'standalone' } }).body;

    expect(body).not.toMatch(/class="ant-form-item(?:[ "])/);
    expect(body).toContain('value="Alpha"');
    expect(body).toContain('name="first"');
  });

  it('collects model-owned errors during SSR and renders a connected parent description', () => {
    const body = render(FormNoStyleFixtures, {
      props: { initialCase: 'error', initialMetadata: true }
    }).body;
    const input = body.match(/<input(?=[^>]*aria-label="first")[^>]*>/)![0];
    const description = input.match(/aria-describedby="([^"]+)"/)![1];

    expect(body).toContain('ant-form-item-explain-error');
    expect(body).toContain('Invalid');
    expect(body).toContain(`id="${description}"`);
    expect(input).toContain('aria-invalid="true"');
    expect(body).not.toContain('capture-child');
  });
});
