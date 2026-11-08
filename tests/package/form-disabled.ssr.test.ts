import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-disabled-reference.json';
import FormDisabledFixtures from '../browser/fixtures/FormDisabledFixtures.svelte';

describe('Form disabled public package', () => {
  it('pins source nested providers and Form overrides for free and bound controls', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const disabled = reference.cases.find(({ sample }) => sample.id === 'form-disabled')!.metrics;
    const nested = reference.cases.find(
      ({ sample }) => sample.id === 'child-config-enable'
    )!.metrics;
    expect(disabled.free).toEqual(disabled.field);
    expect(disabled.free).toEqual({ input: true, select: true, button: true, tag: true });
    expect(nested.free).toEqual({ input: false, select: false, button: false, tag: false });
  });

  it('renders current disabled scope during SSR while retaining explicit local enable', () => {
    const disabled = render(FormDisabledFixtures, { props: { initialCase: 'form-disabled' } }).body;
    const enabled = render(FormDisabledFixtures, {
      props: { initialCase: 'child-config-enable' }
    }).body;
    const local = disabled.match(/<input(?=[^>]*aria-label="Explicit enabled input")[^>]*>/)![0];

    expect(disabled).toContain('ant-select-disabled');
    expect(disabled).toContain('ant-tag-disabled');
    expect(enabled).not.toContain('ant-select-disabled');
    expect(enabled).not.toContain('ant-tag-disabled');
    expect(local).not.toMatch(/\sdisabled(?:[\s=>]|$)/);
  });
});
