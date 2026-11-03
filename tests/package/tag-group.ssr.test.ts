import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TagGroupCase from '../browser/fixtures/TagGroupCase.svelte';
import reference from '../browser/fixtures/ant-design-tag-group-reference.json';
import type { TagGroupCase as Sample } from '../browser/fixtures/tag-group-presets';

describe('CheckableTagGroup source API SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source initial selection through native buttons for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TagGroupCase, { props: { sample: sample as Sample } });
        const buttons = [...body.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
          .filter(match => /\bclass="[^"]*\bant-tag-checkable\b/.test(match[1]));

        expect(buttons.map(match => ({
          checked: match[1].includes('aria-pressed="true"'),
          disabled: /\sdisabled(?:\s|$|=)/.test(match[1]),
          type: /\btype="([^"]*)"/.exec(match[1])?.[1]
        }))).toEqual(sample.snapshots[0].items.map(item => ({
          checked: item.checked, disabled: item.disabled, type: 'button'
        })));
        expect(body).toContain('role="group"');
        expect(body).toContain('aria-label="API tag group"');
        expect(body).toContain('aria-describedby="tag-group-help"');
        expect(body).not.toContain('ignored title');
        expect(body).toMatch(/aria-label="Tag group events">(?:<!--[\s\S]*?-->)*\[\]/);
        expect(body).toMatch(/aria-label="Tag group ref">(?:<!--[\s\S]*?-->)*empty/);
        if (sample.name === 'options-objects') expect(body).toContain('Zero &lt;x>');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
