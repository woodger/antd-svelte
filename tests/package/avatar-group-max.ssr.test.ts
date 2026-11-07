import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import AvatarGroupMaxCase from '../browser/fixtures/AvatarGroupMaxCase.svelte';
import reference from '../browser/fixtures/ant-design-avatar-group-max-reference.json';
import type { AvatarGroupMaxCase as Sample } from '../browser/fixtures/avatar-group-max-presets';

describe('AvatarGroup source max SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source limits without overflow content or timers for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        for (const changed of sample.patch ? [false, true] : [false]) {
          const snapshot = changed ? sample.changed! : sample.snapshot;
          const { body } = render(AvatarGroupMaxCase, { props: { sample: sample as Sample, changed } });
          const avatars = [...body.matchAll(/<span\b[^>]*class="[^"]*\bant-avatar(?:\s|$)[^"]*"/g)];
          const texts = body.replace(/<!--[\s\S]*?-->/g, '');

          expect(avatars).toHaveLength(snapshot.texts.length + (snapshot.counter ? 1 : 0));
          if (snapshot.counter) expect(texts).toContain(`>${snapshot.counter.text}<`);
          expect(body).not.toContain('ant-avatar-group-list');
          expect(vi.getTimerCount()).toBe(0);
        }
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
