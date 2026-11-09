import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-directory-reference.json';
import UploadDirectoryScope from '../browser/fixtures/UploadDirectoryScope.svelte';

describe('Upload directory', () => {
  it('pins breadth-first file metadata and keeps the missing Source error handler explicit', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const failed = reference.cases.find(entry => entry.sample.id === 'file-error')!;

    expect(reference.cases).toHaveLength(12);
    expect(failed.before).toEqual([]);
    expect(failed.calls).toEqual([{ path: '/bad.txt', operation: 'file', errorHandler: false }]);
    expect(failed.readableCounterpart?.before.map(event => event.file.name)).toEqual(['good.txt']);
  });

  for (const dragger of [false, true]) {
    it(`renders ${dragger ? 'Dragger' : 'Upload'} directory attributes without reading browser files`, () => {
      vi.useFakeTimers();
      try {
        const result = render(UploadDirectoryScope, { props: {
          sample: { id: 'directory', directory: true }, dragger
        } });
        const body = result.body;

        expect(body).toContain('directory="directory"');
        expect(body).toMatch(/<input\b[^>]*\bwebkitdirectory=/);
        expect(body).not.toContain('multiple="true"');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
