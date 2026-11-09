import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-thumbnail-fallback-reference.json';
import UploadThumbnailFallbackScope from '../browser/fixtures/UploadThumbnailFallbackScope.svelte';

describe('Upload thumbnail fallback', () => {
  it('pins empty/absent thumbUrl, URL priority and generation guards to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(24);
    expect(reference.transitions).toHaveLength(5);
    expect(reference.cases.every(entry => entry.result.previewCalls === 0)).toBe(true);
  });

  it.each(['empty-thumb', 'empty-with-origin'])(
    'uses URL for %s during SSR without running previewFile', mode => {
      vi.useFakeTimers();
      try {
        const body = render(UploadThumbnailFallbackScope, { props: { sample: { id: mode, mode } } })
          .body;
        const image = /<img\b[^>]*>/.exec(body)?.[0];

        expect(image).toContain('fill=&quot;red&quot;');
        expect(body).toContain('data-preview-file-calls="">0<');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

  it('keeps a placeholder when both thumbnail and URL are empty', () => {
    const body = render(UploadThumbnailFallbackScope, { props: { sample: {
      id: 'empty-no-url', mode: 'empty-no-url'
    } } }).body;

    expect(body).not.toContain('<img');
    expect(body).not.toContain('Preview file');
    expect(body).toContain('anticon-picture');
  });
});
