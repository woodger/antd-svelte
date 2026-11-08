import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-widget-prefix-reference.json';
import WidgetPrefixSSRFixtures from '../browser/fixtures/WidgetPrefixSSRFixtures.svelte';

describe('Shared display component prefixes in the public package', () => {
  it('pins source inherited and local prefixes and live root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(9);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.rootsRetained && step.sameInput)).toBe(true);
  });

  it('renders inherited display classes and independent Steps composition before hydration', () => {
    const rendered = render(WidgetPrefixSSRFixtures);

    for (const prefix of ['suite', 'inner']) {
      for (const family of ['statistic', 'qrcode', 'timeline', 'steps']) {
        expect(rendered.body).toContain(`${prefix}-${family}`);
        expect(rendered.head).toContain(
          `data-ant-svelte-theme="${family}-prefix:${prefix}-${family}"`
        );
      }
      expect(rendered.body).toContain(`${prefix}-statistic-content-value`);
      expect(rendered.body).toContain(`${prefix}-timeline-item`);
      expect(rendered.body).toContain(`${prefix}-steps-item-icon`);
      expect(rendered.body).toContain(`var(--${prefix}-font-size)`);
    }
    expect(rendered.body).toContain('<svg');
    expect(rendered.body).toContain('ant-statistic-css-var');
    expect(rendered.body).not.toContain('prefixCls=');
  });
});
