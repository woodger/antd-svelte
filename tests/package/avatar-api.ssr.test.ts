import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import AvatarApiCase from '../browser/fixtures/AvatarApiCase.svelte';
import reference from '../browser/fixtures/ant-design-avatar-api-reference.json';
import type { AvatarApiCase as Sample } from '../browser/fixtures/avatar-api-presets';

describe('Avatar config and DOM SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source classes and escaped root attributes for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(AvatarApiCase, { props: { sample: sample as Sample } });
        const avatars = [...body.matchAll(/<span\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)]
          .filter(match => /\bclass="[^"]*\bant-avatar(?:\s|$)/.test(match[1]));

        expect(avatars).toHaveLength(sample.group ? 3 : 1);
        expect(body).toMatch(/aria-label="Avatar API ref">(?:<!--[\s\S]*?-->)*empty/);
        expect(body).toMatch(/aria-label="Avatar API events">(?:<!--[\s\S]*?-->)*\[\]/);
        for (const avatar of avatars) {
          expect(avatar[1]).not.toMatch(/\s(?:key|label|text)=/);
        }
        if (!sample.group) {
          expect(avatars[0][1]).toContain('data-marker="api"');
          expect(avatars[0][1]).toContain('lang="en"');
          expect(body).toContain((sample.title ?? 'API <Avatar>').replaceAll('<', '&lt;'));
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
