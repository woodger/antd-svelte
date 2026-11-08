import type { ColProps, FormItemProps, FormProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-columns-reference.json';
import FormColumnsFixtures from '../browser/fixtures/FormColumnsFixtures.svelte';

describe('Form columns public package', () => {
  it('pins source precedence, responsive boundaries and column resets for nested fields', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const nested = reference.cases.find(({ sample }) => sample.id === 'nested-576-ltr')!.metrics;
    expect(nested[0].label.classes).toContain('ant-col-6');
    expect(nested[1].label.classes).toEqual(['ant-col']);
    expect(reference.cases.find(({ sample }) => sample.id === 'responsive-576-ltr')!.metrics[0]
      .label.style['max-width']).toBe('33.3333%');
  });

  it('publishes Col props and renders nested column scopes without browser APIs', () => {
    const label: ColProps = { span: 6, sm: { span: 8 }, class: 'owner-label', style: 'order:1' };
    const props: Pick<FormProps<{ name: string }>, 'labelCol' | 'wrapperCol'> = {
      labelCol: label, wrapperCol: { span: 18 }
    };
    const field: Pick<FormItemProps, 'labelCol' | 'wrapperCol'> = props;
    const body = render(FormColumnsFixtures, { props: { initialCase: 'nested-576-ltr' } }).body;
    const nested = body.split('columns-inner')[1];

    expect(field.labelCol).toBe(label);
    expect(body).toContain('ant-col-6');
    expect(body).toContain('ant-col-18');
    expect(nested).not.toContain('ant-col-6');
    expect(nested).not.toContain('ant-col-18');
    expect(nested).toContain('name="inner"');
    expect(nested).toContain('value="Beta"');
  });
});
