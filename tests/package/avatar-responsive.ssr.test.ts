import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-avatar-responsive-reference.json';
import AvatarResponsiveCase from '../browser/fixtures/AvatarResponsiveCase.svelte';
import type { AvatarResponsiveCase as Sample } from '../browser/fixtures/avatar-responsive-presets';

describe('Avatar responsive SSR', () => {
  it('pins viewport geometry and SSR styles to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });
  for (const sample of reference.cases) {
    it(`keeps source size styles before media queries exist for ${sample.name}`, () => {
      const { body } = render(AvatarResponsiveCase, { props: { sample: sample as Sample } });
      const sizes = [...body.matchAll(/<span\b[^>]*>/g)].flatMap(([tag]) => {
        const classes = /\bclass="([^"]*)"/.exec(tag)?.[1].split(/\s+/) ?? [];
        if (!classes.includes('ant-avatar')) return [];
        const style = /\bstyle="([^"]*)"/.exec(tag)?.[1] ?? '';
        const properties = new Map([...style.matchAll(/(?:^|;)\s*(width|height|font-size):\s*([^;]+)/g)]
          .map(([, name, value]) => [name, value]));
        return [{
          width: properties.get('width') ?? '',
          height: properties.get('height') ?? '',
          font: properties.get('font-size') ?? ''
        }];
      });

      expect(sizes).toEqual(sample.ssr);
      expect(body).toContain('avatar-responsive-surface');
    });
  }
});
