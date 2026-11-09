import { describe, expect, it } from 'vitest';
import { getUploadPrefixCss } from './upload-prefix.engine';

describe('Upload prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getUploadPrefixCss('ant-upload')).toBeUndefined();
  });

  it('isolates local wrappers, drag controls, list states and canonical variables', () => {
    const css = getUploadPrefixCss('files')!;

    expect(css).toContain('.files-wrapper:where([data-ant-upload-prefix="files"])');
    expect(css).toContain('.files-picture-card-wrapper:where(');
    expect(css).toContain('.files-rtl:where(');
    expect(css).toContain('.files-list-item-error');
    expect(css).toContain('.files-drag');
    expect(css).toContain('--ant-upload-picture-card-size');
    expect(css).toContain('"files"');
    expect(css).not.toContain('.ant-upload-list');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getUploadPrefixCss('files-$&')).toContain('.files-$&-drag');
    expect(getUploadPrefixCss('files-</style><script>')).not.toContain('</style');
  });
});
