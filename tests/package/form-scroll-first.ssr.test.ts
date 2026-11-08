import type { ConfigProviderProps, FormConfig, FormProps, FormScrollOptions } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-scroll-first-reference.json';
import FormScrollFirstFixtures from '../browser/fixtures/FormScrollFirstFixtures.svelte';

describe('Form scrollToFirstError public package', () => {
  it('pins source first paths, option replacement and callback order before scrolling', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const replaced = reference.cases.find(({ sample }) => sample.id === 'local-replace-options')!.metrics;
    expect(replaced.calls).toEqual([{ name: ['first'], options: { block: 'nearest' } }]);
    expect(replaced.order).toEqual(['failed', 'scroll']);
    expect(replaced.active).toBe('submit');
    expect(reference.cases.find(({ sample }) => sample.id === 'nested-path')!.metrics.calls[0].name)
      .toEqual(['user', 'name']);
  });

  it('publishes scroll options and config defaults without DOM side effects during SSR', () => {
    const settings: FormScrollOptions = { block: 'center', focus: true, behavior: () => undefined };
    const props: Pick<FormProps<{ first: string }>, 'scrollToFirstError'> = { scrollToFirstError: settings };
    const defaults: FormConfig = { scrollToFirstError: false };
    const config: ConfigProviderProps['form'] = defaults;
    const body = render(FormScrollFirstFixtures).body;

    expect(props.scrollToFirstError).toBe(settings);
    expect(config).toBe(defaults);
    expect(body).toContain('name="first"');
    expect(body).toContain('aria-label="First error capture"');
    expect(body).not.toMatch(/<form\b[^>]*\bscrollToFirstError=/);
  });
});
