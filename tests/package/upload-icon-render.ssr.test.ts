import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-icon-render-reference.json';
import UploadIconRenderScope from '../browser/fixtures/UploadIconRenderScope.svelte';

describe('Upload iconRender', () => {
  it('pins visible renderer content to all list types and the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(25);
    expect(reference.transitions).toHaveLength(4);
  });

  it('renders the effective file/listType context at SSR without timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadIconRenderScope, { props: { sample: {
        id: 'ssr', listType: 'picture-circle', status: 'uploading'
      } } }).body;

      expect(body).toContain('data-file-icon="report.txt"');
      expect(body).toContain('data-icon-type="picture-circle"');
      expect(body).toContain('report.txt:picture-circle:uploading');
      expect(body).not.toContain('iconRender=');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps an empty renderer empty and renders numeric zero', () => {
    const empty = render(UploadIconRenderScope, { props: { sample: {
      id: 'empty', mode: 'empty'
    } } }).body;
    const zero = render(UploadIconRenderScope, { props: { sample: {
      id: 'zero', mode: 'zero'
    } } }).body;

    expect(empty).not.toContain('anticon-paper-clip');
    expect(empty).not.toContain('data-file-icon=');
    expect(zero).toMatch(/class="ant-upload-icon"[^>]*>(?:<!--[\s\S]*?-->)*0/);
  });

  it('keeps an existing thumbnail image ahead of the replacement file icon', () => {
    const body = render(UploadIconRenderScope, { props: { sample: {
      id: 'thumbnail', listType: 'picture-card', thumbnail: true
    } } }).body;

    expect(body).toContain('ant-upload-list-item-image');
    expect(body).not.toContain('data-file-icon=');
  });
});
