import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-progress-motion-reference.json';
import UploadProgressMotionScope from '../browser/fixtures/UploadProgressMotionScope.svelte';

describe('Upload progress motion SSR', () => {
  it('pins fade frames, namespace and percent-property variants to the source revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(12);
    expect(reference.cases.find(entry => entry.sample.id === 'text:undefined-percent')
      ?.appeared.bar?.value).toBe('0');
    expect(reference.cases.find(entry => entry.sample.id === 'text:missing-percent')
      ?.appeared.bar).toBeNull();
  });

  it('omits the delayed progress and creates no browser resources on the server', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadProgressMotionScope, { props: { sample: { id: 'text' } } }).body;

      expect(body).toContain('alpha.png');
      expect(body).not.toContain('role="progressbar"');
      expect(body).not.toContain('ant-fade-appear');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
