import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Upload, type UploadProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-prefix-reference.json';
import UploadPrefixSSRFixtures from '../browser/fixtures/UploadPrefixSSRFixtures.svelte';

describe('Upload local/shared prefixes', () => {
  it('pins Source Upload/Dragger CSS and retained file input/filename identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(22);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput && step.sameLink
      && step.focused)).toBe(true);
  });

  it('renders local list/control classes without leaking prefix to the native file input', () => {
    const props = {
      prefixCls: 'files',
      defaultFileList: [{ uid: 'one', name: 'note.txt', status: 'done' }]
    } satisfies UploadProps;
    const rendered = render(Upload, { props });
    const body = rendered.body;

    expect(body).toContain('files-wrapper');
    expect(body).toContain('files-list-item-done');
    expect(body).toContain('ant-upload-css-var');
    expect(body).toContain('type="file"');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('upload-prefix:files');
  });

  it('isolates nested Upload/Dragger scopes without preview, request or browser timers in SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(UploadPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-upload-wrapper');
      expect(body).toContain('files-drag');
      expect(body).toContain('inner-btn');
      expect(rendered.head).toContain('upload-prefix:files');
      expect(rendered.head).toContain('--ant-upload-picture-card-size');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
