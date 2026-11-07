import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-descriptions-config-reference.json';
import DescriptionsConfigFixtures from '../browser/fixtures/DescriptionsConfigFixtures.svelte';

describe('Descriptions configuration public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders source semantic classes and a native editor for ${sample.name}`, () => {
      const { body } = render(DescriptionsConfigFixtures, { props: { sample } });

      for (const nodes of Object.values(sample.expected)) {
        for (const node of nodes) {
          for (const name of node.classes) expect(body).toContain(name);
        }
      }

      expect(body).toContain('name="description-draft"');
      expect(body).toContain('value="Draft"');
    });
  }

  it('preserves published native defaults while retaining raw source omission evidence', () => {
    const { body } = render(DescriptionsConfigFixtures, { props: { probeDefaults: true } });

    expect(reference.defaultPropsObservation).toEqual({
      bordered: { own: false, type: 'undefined' },
      layout: { own: false, type: 'undefined' },
      colon: { own: false, type: 'undefined' }
    });
    expect(body).toContain('native-descriptions-false-horizontal-true');
  });
});
