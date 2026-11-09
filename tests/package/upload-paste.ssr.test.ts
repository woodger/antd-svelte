import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-paste-reference.json';
import UploadPasteScope from '../browser/fixtures/UploadPasteScope.svelte';

describe('Upload pastable', () => {
  it('pins raw file handling and document listener updates to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(11);
    expect(reference.transitions.every(step => step.sameInput && step.sameButton)).toBe(true);
    expect(reference.afterUnmount).toEqual({ prevented: false, before: [], changes: [] });
  });

  it('keeps the Source disabled paste observation explicit', () => {
    for (const id of ['disabled', 'provider-disabled']) {
      const entry = reference.cases.find(entry => entry.sample.id === id)!;

      expect(entry.result.prevented).toBe(true);
      expect(entry.result.before.map(file => file.name)).toEqual(['notes.txt']);
    }
  });

  for (const dragger of [false, true]) {
    it(`renders pastable ${dragger ? 'Dragger' : 'Upload'} without browser listeners or timers`, () => {
      vi.useFakeTimers();
      try {
        const result = render(UploadPasteScope, { props: {
          sample: { id: 'ssr', pastable: true }, dragger
        } });
        const body = result.body;

        expect(body).toContain('type="file"');
        expect(body).toContain('Paste upload');
        expect(body).not.toContain('pastable=');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
