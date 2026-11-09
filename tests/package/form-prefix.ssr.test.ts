import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-form-prefix-reference.json';
import FormPrefixSSRFixtures from '../browser/fixtures/FormPrefixSSRFixtures.svelte';
import FormPrefixTransparentSSRFixture from './FormPrefixTransparentSSRFixture.svelte';

describe('Form local/shared prefixes and media in the public package', () => {
  it.each([undefined, 'editor'])('keeps transparent Form/Item text boundaries for %s', prefixCls => {
    const rendered = render(FormPrefixTransparentSSRFixture, { props: { prefixCls } });
    const body = rendered.body;

    expect(body).not.toContain('<form');
    expect(body).toContain('<input');
    expect(body.replace(/<!--[\s\S]*?-->|<[^>]*>/g, '')).toBe('');
  });

  it('pins raw Source and public fresh counterparts across prefixes and media', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(26);
    expect(reference.cases.every(entry => entry.widths.length === 5)).toBe(true);
    expect(reference.transitions.every(step => step.sameForm && step.sameInput && step.focused))
      .toBe(true);
  });

  it('renders independent Form/Item namespaces and native field names without leaking prefix props', () => {
    const rendered = render(FormPrefixSSRFixtures);

    expect(rendered.body).toContain('suite-form-horizontal');
    expect(rendered.body).toContain('field-item-label');
    expect(rendered.body).toContain('field-item-tooltip');
    expect(rendered.body).toContain('name="draft"');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('--inner-grid-display');
    expect(rendered.head).toContain('data-ant-form-prefix');
  });

  it('keeps SSR initial fields without starting validation, timers or DOM resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(FormPrefixSSRFixtures);

      expect(rendered.body).toContain('value="Draft"');
      expect(rendered.body).toContain('value="Editor"');
      expect(rendered.head).toContain('form-prefix:ant-form-scope-');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
