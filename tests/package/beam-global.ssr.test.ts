import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-beam-global-reference.json';
import isolated from '../browser/fixtures/ant-design-beam-global-isolated.json';
import BeamGlobalSSRFixtures from '../browser/fixtures/BeamGlobalSSRFixtures.svelte';

describe('BorderBeam global class and variable prefixes in the public package', () => {
  it('pins raw source cache behavior and independent fresh namespace references', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(14);
    expect(isolated.cases).toHaveLength(4);
    for (const separate of isolated.cases) {
      const raw = reference.cases.find(entry => entry.sample.id === separate.sample.id)!;
      expect(raw.result.nested).not.toEqual(separate.result.nested);
    }
    const style = isolated.cases.find(entry => entry.sample.id === 'private-style')!;
    expect(style.result.nested[0].pseudo.width).toBe('66px');
    expect(reference.transitions.every(step => step.rootsRetained && step.sameInput)).toBe(true);
  });

  it('publishes separate prefix CSS without creating beam layers before hydration', () => {
    const rendered = render(BeamGlobalSSRFixtures);

    for (const namespace of ['suite', 'inner']) {
      expect(rendered.head).toContain(`--${namespace}-border-beam-size`);
      expect(rendered.head).toContain(`data-ant-border-beam-vars="${namespace}"`);
    }
    expect(rendered.head).toContain('.shared-beam');
    expect(rendered.body).toContain('server-normal widget draft');
    expect(rendered.body).toContain('server-nested widget draft');
    expect(rendered.body).not.toContain('data-ant-border-beam-vars=');
    expect(rendered.body).not.toContain('prefixCls=');
  });
});
