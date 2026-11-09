import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Image, type ImageProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-image-independent-preview-reference.json';

describe('Independent Image preview prefix', () => {
  it('records raw Source stylesheet omission separately from public styled counterparts', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const independent = reference.cases.find(entry => entry.sample.id === 'independent')!;

    expect(independent.result.viewer?.zIndex).toBe('auto');
    expect(independent.styled.viewer?.zIndex).toBe('1080');
    expect(reference.transitions.every(step => step.sameRoot && step.sameViewer && step.sameImage
      && step.sameZoom && step.focused)).toBe(true);
  });

  it.each(['viewer', '', 'ant-image-preview'])(
    'keeps independent prefix %j out of native attributes while preparing viewer CSS without opening it',
    previewPrefixCls => {
      const props = {
        prefixCls: 'photo', previewPrefixCls, src: 'photo.svg', preview: { open: true }
      } satisfies ImageProps;
      const rendered = render(Image, { props });
      const body = rendered.body;

      expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<button/);
      expect(body).toContain('photo-img');
      expect(body).not.toContain('previewPrefixCls=');
      expect(body).not.toContain('<dialog');
      expect(rendered.head).toContain(`image-prefix:photo:${previewPrefixCls}`);
      expect(rendered.head).toContain(`${previewPrefixCls}-actions-action`);
    }
  );
});
