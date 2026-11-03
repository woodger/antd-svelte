import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import AvatarApiCase from '../browser/fixtures/AvatarApiCase.svelte';
import reference from '../browser/fixtures/ant-design-avatar-prefix-reference.json';
import type { AvatarApiCase as Sample } from '../browser/fixtures/avatar-api-presets';

describe('Avatar source prefixes SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source classes and scoped CSS for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body, head } = render(AvatarApiCase, { props: { sample: sample as Sample } });
        for (const name of sample.snapshot.root.classes) expect(body).toContain(name);
        expect(body).not.toMatch(/\bprefixcls=/i);
        expect(body).toMatch(/aria-label="Avatar API ref">(?:<!--[\s\S]*?-->)*empty/);
        if (sample.prefixCls && sample.prefixCls !== 'ant-avatar') {
          expect(head).toContain(`data-ant-svelte-theme="avatar-prefix:${sample.prefixCls}"`);
          expect(head).toContain(`.${sample.prefixCls}:where(.ant-avatar-css-var)`);
          expect(head).toContain('--ant-avatar-container-size');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
