import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-progress-reference.json';
import UploadProgressScope from '../browser/fixtures/UploadProgressScope.svelte';

describe('Upload.progress', () => {
  it('pins delayed progress, source defaults and prop transitions to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(16);
    expect(reference.cases.every(entry => entry.initial === null)).toBe(true);
    expect(reference.transitions).toHaveLength(6);
    expect(reference.cases[0].result.rail?.height).toBe('2px');
    expect(reference.cases[1].result.rail?.height).toBe('8px');
  });

  it.each(['default', 'empty', 'format', 'semantic'])(
    'keeps %s progress deferred without browser timers or prop leaks during SSR', mode => {
      vi.useFakeTimers();
      try {
        const body = render(UploadProgressScope, { props: { sample: { id: mode, mode } } }).body;

        expect(body).toContain('ant-upload-list-item-uploading');
        expect(body).not.toMatch(/class="ant-progress(?:\s|")/);
        expect(body).not.toContain('aria-valuenow=');
        expect(body).not.toContain('progress="');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
});
