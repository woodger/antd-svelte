import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-status-prefix-reference.json';
import StatusPrefixSSRFixtures from '../browser/fixtures/StatusPrefixSSRFixtures.svelte';

describe('Shared status component prefixes in the public package', () => {
  it('pins source nested local and inherited prefixes and stable transitions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(9);
    expect(Object.keys(reference.cases[0].result.normal)).toHaveLength(17);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.rootsRetained && step.sameInput)).toBe(true);
  });

  it('renders inherited status prefixes and Skeleton parts before hydration', () => {
    const rendered = render(StatusPrefixSSRFixtures);

    for (const prefix of ['suite', 'inner']) {
      for (const part of [
        'avatar',
        'avatar-group',
        'badge',
        'ribbon-wrapper',
        'tag',
        'tag-checkable-group',
        'empty',
        'skeleton-with-avatar',
        'skeleton-avatar',
        'skeleton-button',
        'skeleton-input',
        'skeleton-image',
        'skeleton-node',
        'spin',
        'progress',
        'result'
      ]) {
        expect(rendered.body).toContain(`${prefix}-${part}`);
      }
      expect(rendered.body).toContain(`var(--${prefix}-font-size)`);
      expect(rendered.head).toContain(`skeleton-main-prefix:${prefix}-skeleton`);
      expect(rendered.head).toContain(`skeleton-prefix:${prefix}-skeleton`);
    }
    expect(rendered.body).toContain('ant-skeleton-host');
    expect(rendered.body).not.toContain('prefixCls=');
  });
});
