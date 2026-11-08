import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-popup-prefix-reference.json';
import PopupPrefixSSRFixtures from '../browser/fixtures/PopupPrefixSSRFixtures.svelte';
import type { PopupPrefixKind } from '../browser/fixtures/PopupPrefixScope.svelte';

describe('Shared popup and Slider prefixes in the public package', () => {
  it('pins source inherited popup composition and stable open transitions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(45);
    expect(reference.transitions).toHaveLength(15);
    expect(reference.transitions.every(step => step.sameControl && step.popupsRetained
      && step.sameInput)).toBe(true);
    const confirm = reference.cases.find(entry => entry.sample.id === 'popconfirm-local')!;
    const range = reference.cases.find(entry => entry.sample.id === 'range-local')!;

    expect(confirm.result.normal.popups[0].classes).toContain('suite-popover');
    expect(confirm.result.normal.popups[0].classes).toContain('custom-popconfirm');
    expect(range.result.normal.popups).toHaveLength(2);
    expect(range.result.normal.popups[0].classes).toContain('suite-tooltip');
    expect(range.result.normal.popups[0].classes).toContain('custom-slider-tooltip');
  });

  const kinds: PopupPrefixKind[] = ['tooltip', 'popover', 'popconfirm', 'single', 'range'];
  it.each(kinds)('renders %s prefix CSS without using a popup container in SSR', kind => {
    const rendered = render(PopupPrefixSSRFixtures, { props: { kind } });
    const slider = kind === 'single' || kind === 'range';
    const family = slider ? 'slider' : kind;

    for (const prefix of ['suite', 'inner']) {
      expect(rendered.body).toContain(`${prefix}-${family}`);
      expect(rendered.head).toContain(`${family}-prefix:${prefix}-${family}`);
      if (slider) {
        expect(rendered.body).toContain(`${prefix}-tooltip`);
        expect(rendered.head).toContain(`tooltip-prefix:${prefix}-tooltip`);
      }
      if (kind === 'popconfirm') {
        expect(rendered.body).toContain(`${prefix}-popover`);
        expect(rendered.head).toContain(`popover-prefix:${prefix}-popover`);
      }
    }
    expect(rendered.body).toContain('normal widget draft');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.body).not.toContain('tooltip-open');
    expect(rendered.body).not.toContain('popover-open');
  });
});
