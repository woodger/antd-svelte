import type { ConfigProviderProps, FormConfig, FormItemProps, FormProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-root-reference.json';
import FormRootFixtures from '../browser/fixtures/FormRootFixtures.svelte';

describe('Form root public package', () => {
  it('pins source root layers, context replacement and inactive form variant config', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'local-over-config')!.metrics.form)
      .toMatchObject({ classes: ['owner-parent', 'owner-local', 'owner-escape'], css: {
        color: 'rgb(44, 55, 66)', 'padding-top': '9px', 'outline-color': 'rgb(15, 25, 35)'
      } });
    expect(reference.cases.find(({ sample }) => sample.id === 'source-form-variant')!.metrics.input)
      .toMatchObject({ filled: false, outlined: true });
    expect(reference.observations[0].id).toBe('source-form-variant');
  });

  it('publishes root style props and renders config classes without forwarding them as attributes', () => {
    const defaults: FormConfig = { class: 'owner-config', style: 'color:red' };
    const provider: ConfigProviderProps['form'] = defaults;
    const props: Pick<FormProps<{ name: string }>, 'rootClassName'> = { rootClassName: 'owner-root' };
    const field: Pick<FormItemProps, 'rootClassName' | 'style'> = {
      rootClassName: 'owner-field', style: 'padding-top:5px'
    };
    const body = render(FormRootFixtures, { props: { initialCase: 'local-over-config' } }).body;
    const noWrapper = render(FormRootFixtures, { props: { initialCase: 'component-false' } }).body;

    expect(provider).toBe(defaults);
    expect(props.rootClassName).toBe('owner-root');
    expect(field.style).toBe('padding-top:5px');
    expect(body).toContain('owner-parent owner-local owner-escape');
    expect(body).toContain('padding-top:9px');
    expect(body).not.toMatch(/<form\b[^>]*\brootClassName=/);
    expect(noWrapper).not.toMatch(/<form\b/);
    expect(noWrapper).toContain('owner-field owner-field-escape');
  });
});
