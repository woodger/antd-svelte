import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-theme-reference.json';
import UploadThemeCase from '../browser/fixtures/UploadThemeCase.svelte';

describe('Upload component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} cards and file controls without starting browser resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(UploadThemeCase, { props: { sample, mode: 'picture-card' } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toContain('type="file"');
        expect(body).toContain('note.txt');
        expect(body).toContain('broken.txt');
        expect(body).toContain('ant-upload-list-item-error');
        expect(body).toContain('anticon-delete');
        expect(body).toContain(`--${prefix}-upload-actions-color`);
        expect(body).toContain(`--${prefix}-upload-picture-card-size`);
        expect(body).not.toContain('request:');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
