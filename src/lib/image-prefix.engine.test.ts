import { describe, expect, it } from 'vitest';
import { getImagePrefixCss } from './image-prefix.engine';

describe('Image prefix stylesheet', () => {
  it('keeps the default stylesheet for the default namespace', () => {
    expect(getImagePrefixCss('ant-image')).toBeUndefined();
  });

  it('isolates Image and preview roots without renaming component token variables', () => {
    const css = getImagePrefixCss('photo')!;

    expect(css).toContain('.photo:where([data-ant-image-prefix="photo"])');
    expect(css).toContain('.photo-preview:where([data-ant-image-prefix="photo"][data-ant-image-preview-prefix="photo-preview"])');
    expect(css).toContain('.photo-preview-mask');
    expect(css).toContain('.photo-preview-actions-action-disabled');
    expect(css).toContain('.photo-cover-bottom');
    expect(css).toContain('[class^="photo"]');
    expect(css).toContain('--ant-image-preview-operation-size');
    expect(css).not.toContain('.ant-image-preview-img');
  });

  it('styles independent viewers without changing thumbnail classes or leaking between viewer roots', () => {
    const css = getImagePrefixCss('ant-image', 'viewer')!;

    expect(css).toContain('.viewer:where([data-ant-image-prefix="ant-image"][data-ant-image-preview-prefix="viewer"])');
    expect(css).toContain('.viewer-actions-action');
    expect(css).toContain('.ant-image-img');
    expect(css).toContain(':is([class^="ant-image"],[class^="viewer"])');
    expect(css).not.toContain('.ant-image-preview-mask');
    expect(getImagePrefixCss('photo', 'gallery')).toContain('[data-ant-image-preview-prefix="gallery"]');
  });

  it('keeps an explicitly empty viewer namespace styled without creating an empty class selector', () => {
    const css = getImagePrefixCss('photo', '')!;

    expect(css).toContain('[data-ant-image-preview-prefix=""]:where(');
    expect(css).toContain('.-img');
    expect(css).toContain('.-actions-action-disabled');
    expect(css).not.toContain('.:where(');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getImagePrefixCss('photo-$&')).toContain('.photo-$&-preview-close');
    expect(getImagePrefixCss('photo-</style><script>')).not.toContain('</style');
  });
});
