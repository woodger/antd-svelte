import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-avatar-source-reference.json';
import AvatarSourceCase from '../browser/fixtures/AvatarSourceCase.svelte';
import type { AvatarSourceCase as Sample } from '../browser/fixtures/avatar-source-presets';

describe('Avatar source Snippet SSR', () => {
  it('pins source nodes and integration styles to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });
  for (const sample of reference.cases) {
    it(`renders the source subtree and defers group overflow for ${sample.name}`, () => {
      const { body } = render(AvatarSourceCase, { props: { sample: sample as Sample } });
      const avatars = [...body.matchAll(/<span\b[^>]*class="([^"]*)"/g)]
        .filter(([, classes]) => classes.split(/\s+/).includes('ant-avatar')).length;
      const sources = {
        avatars,
        sourceImages: [...body.matchAll(/\sdata-source-image(?:\s|=|>)/g)].length,
        state: [...body.matchAll(/\sdata-source-state(?:\s|=|>)/g)].length,
        images: [...body.matchAll(/<img\b[^>]*class="([^"]*)"/g)]
          .filter(([, classes]) => classes.split(/\s+/).includes('ant-image-img')).length
      };

      expect(sources).toEqual(sample.ssr);
      expect(body).toContain('aria-label="Avatar source errors">0');
      expect(body).toContain('aria-label="Own source errors">0');
      expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
    });
  }
});
