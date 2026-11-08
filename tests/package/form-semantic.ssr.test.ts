import type {
  ConfigProviderProps, FormConfig, FormProps, FormSemantic, FormSemanticSlots
} from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-semantic-reference.json';
import FormSemanticFixtures from '../browser/fixtures/FormSemanticFixtures.svelte';

describe('Form semantic public package', () => {
  it('pins all source slots, CSS layer priority and normalized callback props', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'local-style-root')!.metrics.root)
      .toMatchObject({ css: { color: 'rgb(171, 181, 191)' } });
    const callbacks = reference.cases.find(({ sample }) => sample.id === 'callbacks-default')!.metrics;
    expect(callbacks.label!.classes).toContain('owner-component-unset');
    expect(callbacks.label!.classes).toContain('owner-disabled-false');
    expect(callbacks.list!.classes).toContain('owner-context-help');
    expect(callbacks.listItems[0]!.classes).toContain('owner-context-helpItem');
  });

  it('publishes semantic objects and callbacks and renders field inheritance during SSR', () => {
    const slots: FormSemanticSlots = { label: 'label-owner', helpItem: 'message-owner' };
    const styles: FormSemantic = ({ props }) => props.disabled ? undefined : { root: 'color:red' };
    const defaults: FormConfig = { classNames: slots, styles };
    const provider: ConfigProviderProps['form'] = defaults;
    const props: Pick<FormProps<{ name: string }>, 'classNames' | 'styles'> = defaults;
    const help = render(FormSemanticFixtures, { props: { initialCase: 'explicit-help' } }).body;
    const callbacks = render(FormSemanticFixtures, { props: { initialCase: 'callbacks-default' } }).body;
    const nested = render(FormSemanticFixtures, { props: { initialCase: 'nested-form' } }).body;

    expect(provider).toBe(defaults);
    expect(props.styles).toBe(styles);
    expect(help).toContain('owner-context-label');
    expect(help).toContain('owner-context-helpItem');
    expect(help).toContain('color:rgb(25, 35, 45)');
    expect(callbacks).toContain('owner-component-unset');
    expect(callbacks).toContain('owner-disabled-false');
    expect(nested).toContain('owner-local-label');
    expect(nested).toContain('owner-context-label');
  });
});
