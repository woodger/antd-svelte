import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-upload-motion-reference.json';
import registry from 'antd-svelte/porting/registry.json';
import UploadMotionScope from '../browser/fixtures/UploadMotionScope.svelte';

describe('Upload list motion SSR', () => {
  it('pins motion frames and disabled variants to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(12);
  });

  it.each(['text', 'picture', 'picture-card', 'picture-circle'])(
    'renders the %s initial row without motion classes or browser resources', listType => {
      vi.useFakeTimers();
      try {
        const body = render(UploadMotionScope, { props: { sample: { id: listType, listType } } })
          .body;

        expect(body).toContain('alpha.png');
        expect(body).toContain('ant-upload-list-item-container');
        expect(body).not.toContain('ant-upload-animate');
        expect(body).not.toContain('height:0px;opacity:0');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    }
  );
});
