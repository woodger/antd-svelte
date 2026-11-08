import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-core-prefix-reference.json';
import CorePrefixSSRFixtures from '../browser/fixtures/CorePrefixSSRFixtures.svelte';

describe('Shared Divider Flex and Segmented prefixes in the public package', () => {
  it('pins source prefixes and records the existing native form boundary', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(9);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.rootsRetained && step.sameInput)).toBe(true);
    expect(reference.transitions.map(step => step.formValue)).toEqual(['on', 'on', 'on']);
  });

  it('renders inherited prefixes and named radio groups before hydration', () => {
    const rendered = render(CorePrefixSSRFixtures);

    for (const prefix of ['suite', 'inner']) {
      for (const family of ['divider', 'flex', 'segmented']) {
        expect(rendered.body).toContain(`${prefix}-${family}`);
        expect(rendered.head).toContain(
          `data-ant-svelte-theme="${family}-prefix:${prefix}-${family}"`
        );
      }
      expect(rendered.body).toContain(`${prefix}-divider-inner-text`);
      expect(rendered.body).toContain(`${prefix}-flex-gap-small`);
      expect(rendered.body).toContain(`${prefix}-segmented-item-selected`);
    }
    expect(rendered.body).toContain('name="server-normal-segment"');
    expect(rendered.body).toContain('name="server-nested-segment"');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.body).not.toContain('segmented-thumb');
  });
});
