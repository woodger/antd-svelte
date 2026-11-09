import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-item-render-reference.json';
import UploadItemRenderScope from '../browser/fixtures/UploadItemRenderScope.svelte';

describe('Upload itemRender', () => {
  it('pins current file context, actions and renderer transitions to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(19);
    expect(reference.actions.every(entry => entry.prevented.join(',') === 'true,false,false'))
      .toBe(true);
    expect(reference.transitions).toHaveLength(5);
  });

  it('renders the origin, file list context and custom controls without browser timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadItemRenderScope, { props: { sample: {
        id: 'ssr', mode: 'wrap'
      } } }).body;

      expect(body).toContain('data-item-list="alpha.txt,beta.txt"');
      expect(body).toContain('data-item-file="alpha.txt"');
      expect(body).toContain('Custom preview one');
      expect(body).toContain('ant-upload-list-item-name');
      expect(body).not.toContain('itemRender=');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('retains empty outer containers when the replacement renderer returns no content', () => {
    const body = render(UploadItemRenderScope, { props: { sample: {
      id: 'empty', mode: 'empty'
    } } }).body;

    expect(body.match(/data-ant-upload-item-container/g)).toHaveLength(2);
    expect(body).not.toContain('data-custom-item=');
    expect(body).not.toContain('ant-upload-list-item-name');
  });

  it('keeps the error Tooltip inside the reusable origin snippet', () => {
    const body = render(UploadItemRenderScope, { props: { sample: {
      id: 'error', error: true
    } } }).body;

    expect(body).toContain('data-origin');
    expect(body).toContain('ant-tooltip-trigger');
    expect(body).toContain('ant-upload-list-item-error');
  });
});
