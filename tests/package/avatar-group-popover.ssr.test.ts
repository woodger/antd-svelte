import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import AvatarGroupPopoverCase from '../browser/fixtures/AvatarGroupPopoverCase.svelte';
import reference from '../browser/fixtures/ant-design-avatar-group-popover-reference.json';
import type { AvatarGroupPopoverCase as Sample } from '../browser/fixtures/avatar-group-popover-presets';

describe('AvatarGroup Popover configuration SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`keeps caller snippets and hidden avatars lazy for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(AvatarGroupPopoverCase, { props: { sample: sample as Sample } });

        expect(body).toContain('+2');
        expect(body).not.toContain('ant-avatar-group-list');
        expect(body).not.toContain('aria-label="Owner popup draft"');
        expect(body).toMatch(/aria-label="Group popup events">(?:<!--[\s\S]*?-->)*\[\]/);
        expect(body).toMatch(/aria-label="Group popup containers">(?:<!--[\s\S]*?-->)*\[\]/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
