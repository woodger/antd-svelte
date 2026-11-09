import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-error-message-reference.json';
import UploadErrorMessageScope from '../browser/fixtures/UploadErrorMessageScope.svelte';

describe('Upload error Tooltip metadata', () => {
  it('pins response/statusText/message/fallback priority and live updates to the source revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(10);
    expect(reference.transitions).toHaveLength(4);
    expect(reference.cases.find(entry => entry.sample.id === 'status-text')?.message)
      .toBe('Status text');
  });

  it('accepts statusText metadata during SSR without browser resources', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadErrorMessageScope, { props: { sample: {
        id: 'status-text', error: { statusText: 'Status text', message: 'Error message' }
      } } }).body;

      expect(body).toContain('ant-upload-list-item-error');
      expect(body).toContain('ant-tooltip-trigger');
      expect(body).toContain('popover="manual"');
      expect(body).toMatch(/role="tooltip" popover="manual" hidden/);
      expect(body).toContain('Status text');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
