import type { FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-help-reference.json';
import FormHelpFixtures from '../browser/fixtures/FormHelpFixtures.svelte';

describe('Form rich help public package', () => {
  it('pins source rich content, reset and zero description observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'zero')!.metrics)
      .toMatchObject({ text: '0', hasDescription: false });
    expect(reference.cases.find(({ sample }) => sample.id === 'string-zero')!.metrics)
      .toMatchObject({ text: '0', hasDescription: true });
    expect(reference.counter.reset.text).toBe('Help: 0');
    expect(reference.observations[0].metrics.text).toBe('Details');
  });

  it('publishes rich help types and renders zero and snippets without browser resources', () => {
    const props: Pick<FormItemProps, 'help'> = { help: ['Details ', 0] };
    const zero = render(FormHelpFixtures, { props: { initialCase: 'zero' } }).body;
    const rich = render(FormHelpFixtures, { props: { initialCase: 'rich' } }).body;

    expect(props.help).toEqual(['Details ', 0]);
    expect(zero).toContain('aria-describedby=');
    expect(zero).toContain('ant-form-item-extra');
    expect(rich).toContain('data-rich-help');
    expect(rich).toContain('Rich details');
  });
});
