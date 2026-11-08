import type { FormItemProps, FormProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-layout-reference.json';
import FormLayoutFixtures from '../browser/fixtures/FormLayoutFixtures.svelte';

describe('Form layouts public package', () => {
  it('pins source inline layouts, local overrides, themes, widths and directions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const sample = reference.cases.find(({ sample }) => sample.id === 'inline-1280-ltr')!;
    expect(sample.metrics.form.style).toMatchObject({ display: 'flex', 'flex-wrap': 'wrap' });
    expect(sample.metrics.items.map(({ style }) => style['margin-inline-end'])).toEqual(['16px', '16px']);
    expect(sample.metrics.items.map(({ style }) => style['margin-bottom'])).toEqual(['0px', '0px']);
  });

  it('publishes inline form and local horizontal/vertical field layouts', () => {
    const forms: FormProps<{ name: string }>['layout'][] = ['inline', 'horizontal', 'vertical'];
    const fields: FormItemProps['layout'][] = ['horizontal', 'vertical', undefined];
    const { body } = render(FormLayoutFixtures);

    expect(forms).toHaveLength(3);
    expect(fields).toHaveLength(3);
    expect(body).toContain('ant-form-inline');
    expect(body).toContain('ant-form-item-inline');
    expect(body).toContain('ant-form-item-vertical');
    expect(body).toContain('value="Anna"');
    expect((body.match(/<form\b/g) ?? [])).toHaveLength(2);
  });
});
