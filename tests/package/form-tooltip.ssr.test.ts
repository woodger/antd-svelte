import type { FormConfig, FormItemProps, FormItemTooltip, FormTooltipProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-tooltip-reference.json';
import FormTooltipFixtures from '../browser/fixtures/FormTooltipFixtures.svelte';

describe('Form label tooltip public package', () => {
  it('pins source defaults, inherited icons, clicks and the array normalization observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'context-only')!.metrics.icon)
      .toBeNull();
    expect(reference.cases.find(({ sample }) => sample.id === 'options-inherit-icon')!.metrics.icon?.kind)
      .toBe('global');
    expect(reference.cases.find(({ sample }) => sample.id === 'click')!.metrics.popup?.text)
      .toBe('Details');
    expect(reference.cases.find(({ sample }) => sample.id === 'array')!.metrics.popup?.text).toBe('');
    expect(reference.cases.find(({ sample }) => sample.id === 'array-title')!.metrics.popup?.text)
      .toBe('Details 0');
    expect(reference.accessibility).toContain('Caption question-circle');
  });

  it('publishes tooltip content and defaults and renders labels without opening an SSR popup', () => {
    const options: FormTooltipProps = { title: 'Details', placement: 'right' };
    const defaults: FormConfig = { tooltip: options };
    const content: FormItemTooltip = ['Details ', 0];
    const field: Pick<FormItemProps, 'tooltip'> = { tooltip: content };
    const body = render(FormTooltipFixtures, { props: { initialCase: 'text' } }).body;
    const marked = render(FormTooltipFixtures, { props: { initialCase: 'custom-mark' } }).body;

    expect(defaults.tooltip).toBe(options);
    expect(field.tooltip).toBe(content);
    expect(body).toContain('ant-form-item-tooltip');
    expect(body).toContain('aria-hidden="true"');
    expect(body).not.toMatch(/<form\b[^>]*\btooltip=/);
    expect(body).not.toContain('popover-open');
    expect(marked).toContain('data-custom-mark="optional"');
    expect(marked).toContain('ant-form-item-tooltip');
  });
});
