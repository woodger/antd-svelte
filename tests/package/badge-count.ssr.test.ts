import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-badge-count-reference.json';
import BadgeCountCase from '../browser/fixtures/BadgeCountCase.svelte';
import type { BadgeCountCase as Sample } from '../browser/fixtures/badge-count-presets';

describe('Badge count SSR', () => {
  it('pins rendering evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source indicator roots for ${sample.name}`, () => {
      const { body } = render(BadgeCountCase, { props: { sample: sample as Sample } });

      expect({
        sup: [...body.matchAll(/<sup\b/g)].length,
        custom: [...body.matchAll(/\sdata-count-root(?:\s|=|>)/g)].length,
        target: [...body.matchAll(/aria-label="Badge count target"/g)].length,
        stateInputs: [...body.matchAll(/aria-label="Custom count draft"/g)].length
      }).toEqual(sample.ssr);
      expect(body).not.toContain('aria-live');
    });
  }
});
