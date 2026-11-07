import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-card-config-reference.json';
import CardConfigFixtures from '../browser/fixtures/CardConfigFixtures.svelte';

describe('Card configuration public package SSR', () => {
  it('pins the official revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  it('preserves published native callback defaults and keeps raw source observation separate', () => {
    const { body } = render(CardConfigFixtures, { props: { probeDefaults: true } });

    expect(reference.defaultPropsObservation).toEqual({
      loading: { own: false, type: 'undefined' },
      hoverable: { own: false, type: 'undefined' },
      tabProps: { own: false, type: 'undefined' }
    });
    expect(body).toContain('native-defaults-false-false-object');
  });

  for (const sample of reference.cases) {
    it(`renders source semantic classes and native editors for ${sample.name}`, () => {
      const { body } = render(CardConfigFixtures, { props: { sample } });

      for (const parts of Object.values(sample.expected)) {
        for (const part of Object.values(parts)) {
          for (const name of part.classes) expect(body).toContain(name);
        }
      }

      expect(body).toContain('name="card-draft"');
      expect(body).toContain('name="meta-draft"');
      expect(body).toContain('aria-label="Configured Card changes">0</output>');
    });
  }
});
