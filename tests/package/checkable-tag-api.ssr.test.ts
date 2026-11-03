import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import CheckableTagApiCase from '../browser/fixtures/CheckableTagApiCase.svelte';
import reference from '../browser/fixtures/ant-design-checkable-tag-api-reference.json';
import type { CheckableTagApiCase as Sample } from '../browser/fixtures/checkable-tag-api-presets';

describe('CheckableTag callbacks and DOM SSR', () => {
  it('pins callback evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases as Sample[]) {
    it(`renders native attributes without events or browser resources for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(CheckableTagApiCase, { props: { sample } });
        const root = [...body.matchAll(/<button\b(?:[^>"']|"[^"]*"|'[^']*')*>/g)]
          .find(match => match[0].includes('data-checkable-root="api"'))![0];
        const output = (name: string) => new RegExp(
          `<output[^>]*aria-label="Checkable API ${name}">([\\s\\S]*?)<\\/output>`
        ).exec(body)![1].replace(/<!--[\s\S]*?-->/g, '');

        expect(root).toContain('type="button"');
        expect(root).toContain(`aria-pressed="${sample.checked ?? false}"`);
        expect(root).toContain('title="API &lt;tag>"');
        expect(root).toContain('api-checkable');
        expect(root).toContain('letter-spacing:1px');
        expect(root).not.toMatch(/on(?:click|keydown|Click|KeyDown)=/);
        expect(/\sdisabled(?:\s|>|=)/.test(root)).toBe(Boolean(sample.disabled));
        expect(output('events')).toBe('[]');
        expect(output('ref')).toBe('empty');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
