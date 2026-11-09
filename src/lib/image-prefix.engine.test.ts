import { describe, expect, it } from 'vitest';
import { getImagePrefixCss } from './image-prefix.engine';

describe('Image prefix stylesheet', () => {
  it('keeps the default stylesheet for the default namespace', () => {
    expect(getImagePrefixCss('ant-image')).toBeUndefined();
  });

  it('isolates Image and preview roots without renaming component token variables', () => {
    const css = getImagePrefixCss('photo')!;

    expect(css).toContain('.photo:where([data-ant-image-prefix="photo"])');
    expect(css).toContain('.photo-preview:where([data-ant-image-prefix="photo"])');
    expect(css).toContain('.photo-preview-mask');
    expect(css).toContain('.photo-preview-actions-action-disabled');
    expect(css).toContain('.photo-cover-bottom');
    expect(css).toContain('[class^="photo"]');
    expect(css).toContain('--ant-image-preview-operation-size');
    expect(css).not.toContain('.ant-image-preview-img');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getImagePrefixCss('photo-$&')).toContain('.photo-$&-preview-close');
    expect(getImagePrefixCss('photo-</style><script>')).not.toContain('</style');
  });
});
