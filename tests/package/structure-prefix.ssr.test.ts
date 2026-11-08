import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-structure-prefix-reference.json';
import StructurePrefixSSRFixtures from '../browser/fixtures/StructurePrefixSSRFixtures.svelte';

describe('Shared Alert Collapse and Affix prefixes in the public package', () => {
  it('pins source active Affix styles and expanded editor transitions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(9);
    expect(reference.cases.every(entry => entry.result.normal.affix.position === 'fixed'))
      .toBe(true);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.rootsRetained && step.sameInput)).toBe(true);
  });

  it('renders inherited classes and CSS without pinning content before hydration', () => {
    const rendered = render(StructurePrefixSSRFixtures);

    for (const prefix of ['suite', 'inner']) {
      expect(rendered.body).toContain(`${prefix}-alert`);
      expect(rendered.body).toContain(`${prefix}-collapse`);
      for (const family of ['affix', 'alert', 'collapse']) {
        expect(rendered.head).toContain(`${family}-prefix:${prefix}-${family}`);
      }
      expect(rendered.body).not.toContain(`class="${prefix}-affix`);
    }
    expect(rendered.body).toContain('server-normal panel draft');
    expect(rendered.body).toContain('server-nested panel draft');
    expect(rendered.body).not.toContain('position:fixed');
    expect(rendered.body).not.toContain('prefixCls=');
  });
});
