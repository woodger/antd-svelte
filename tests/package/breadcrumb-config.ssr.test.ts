import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-breadcrumb-config-reference.json';
import BreadcrumbConfigFixtures from '../browser/fixtures/BreadcrumbConfigFixtures.svelte';

describe('Breadcrumb configuration public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders source semantic classes, native links and configured nodes for ${sample.name}`, () => {
      const { body } = render(BreadcrumbConfigFixtures, { props: { sample } });

      for (const nodes of Object.values(sample.expected)) {
        for (const node of nodes) {
          for (const name of node.classes) expect(body).toContain(name);
          for (const icon of node.icons) expect(body).toContain(`data-breadcrumb-icon="${icon.source}"`);
          for (const separator of node.separators) {
            expect(body).toContain(`data-breadcrumb-separator="${separator.source}"`);
          }
        }
      }

      expect(body).toContain('href="#breadcrumb-config-first"');
    });
  }

  it('preserves native callback params defaults beside the raw source omission observation', () => {
    const { body } = render(BreadcrumbConfigFixtures, { props: { probeDefaults: true } });

    expect(reference.defaultPropsObservation).toEqual({
      params: { own: false, type: 'undefined' },
      separator: { own: true, type: 'string' },
      dropdownIcon: { own: false, type: 'undefined' }
    });
    expect(body).toContain('native-breadcrumb-params-object');
  });
});
