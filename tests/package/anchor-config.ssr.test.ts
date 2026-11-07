import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-anchor-config-reference.json';
import AnchorConfigFixtures from '../browser/fixtures/AnchorConfigFixtures.svelte';

describe('Anchor configuration public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders source semantic slots and native links without reading DOM for ${sample.name}`, () => {
      const { body } = render(AnchorConfigFixtures, { props: { sample, probeSSR: true } });

      for (const nodes of Object.values(sample.expected)) {
        for (const node of nodes) {
          for (const name of node.classes) expect(body).toContain(name);
        }
      }

      expect(body).toContain('href="#anchor-config-two"');
      expect(body).not.toContain('ant-anchor-link-title-active');
    });
  }
});
