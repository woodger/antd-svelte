import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Image, type ImageProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-image-prefix-reference.json';
import ImagePrefixSSRFixtures from '../browser/fixtures/ImagePrefixSSRFixtures.svelte';

describe('Image local/shared prefixes in the public package', () => {
  it('pins Source Image and Group prefix CSS and live element identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(21);
    expect(reference.transitions).toHaveLength(6);
    expect(reference.transitions.every(step => step.sameRoot && step.sameViewer && step.sameImage
      && step.sameZoom && step.focused)).toBe(true);
  });

  it('renders local thumbnail parts and native image attributes without leaking the prefix prop', () => {
    const props = {
      prefixCls: 'photo', src: 'photo.svg', alt: 'Photo', width: 120, height: 90
    } satisfies ImageProps;
    const rendered = render(Image, { props });
    const body = rendered.body;

    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<button/);
    expect(body).toContain('photo-img');
    expect(body).toContain('src="photo.svg"');
    expect(body).toContain('alt="Photo"');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('image-prefix:photo');
    expect(rendered.head).toContain('.photo-preview-actions-action');
  });

  it('keeps Group preview prefix independent of children and browser resources out of SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(ImagePrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-image');
      expect(body).toContain('photo-img');
      expect(body).not.toContain('<dialog');
      expect(body).not.toContain('gallery-img');
      expect(rendered.head).toContain('image-prefix:gallery');
      expect(rendered.head).toContain('image-prefix:photo');
      expect(rendered.head).toContain('--ant-image-preview-operation-size');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
