import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-image-theme-reference.json';
import ImageThemeCase from '../browser/fixtures/ImageThemeCase.svelte';

describe('Image theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} thumbnails without opening viewers, refs or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(ImageThemeCase, { props: { sample } });

        expect(body).toContain('data-image-theme="single"');
        expect(body).toContain('data-image-theme="group"');
        expect(body).toContain('Image theme native ref">empty</output>');
        expect(body).toContain('Image theme img ref">empty</output>');
        expect(body).not.toContain('image-preview-dialog');
        expect(body).toContain('--ant-image-preview-operation-size:');
        if (sample.name === 'custom-css-prefix') {
          expect(body).toContain('image-probe');
          expect(body).toContain('--image-probe-image-preview-operation-size:30px');
        }
        if (sample.priority) {
          expect(body).toContain('--ant-image-preview-operation-size:30px;');
          expect(body).toContain('--ant-image-preview-operation-size:26px');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
