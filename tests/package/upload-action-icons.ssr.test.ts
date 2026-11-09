import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-action-icons-reference.json';
import UploadActionIconsScope from '../browser/fixtures/UploadActionIconsScope.svelte';

describe('Upload action icons', () => {
  it('pins icon content, states and transitions to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(21);
    expect(reference.actions).toHaveLength(2);
    expect(reference.transitions).toHaveLength(5);
  });

  it('renders current file context in custom controls without browser timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadActionIconsScope, { props: { sample: {
        id: 'custom', mode: 'custom', listType: 'picture-card'
      } } }).body;

      for (const action of ['preview', 'download', 'remove']) {
        expect(body).toContain(`data-custom-action="${action}"`);
      }
      expect(body).toContain('data-action-file="alpha.txt"');
      expect(body).not.toContain('previewIcon=');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps empty icon content and numeric zero distinct from absent renderers', () => {
    const empty = render(UploadActionIconsScope, { props: { sample: {
      id: 'empty', mode: 'empty', listType: 'picture-card'
    } } }).body;
    const zero = render(UploadActionIconsScope, { props: { sample: {
      id: 'zero', mode: 'zero', listType: 'picture-card'
    } } }).body;

    expect(empty).not.toContain('anticon-delete');
    expect(empty).not.toContain('data-custom-action=');
    expect(zero).not.toContain('anticon-delete');
    expect(zero.match(/>0</g)).toHaveLength(3);
  });
});
