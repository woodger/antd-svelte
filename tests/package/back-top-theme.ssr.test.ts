import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-back-top-theme-reference.json';
import BackTopThemeCase from '../browser/fixtures/BackTopThemeCase.svelte';

describe('BackTop theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.registration).toMatchObject({
      addedClass: '<prefix>-css-var', sourceCodeChanged: false
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} native action and scoped CSS before JavaScript`, () => {
      const { body, head } = render(BackTopThemeCase, { props: { sample } });

      expect(body).toContain('id="back-top-control"');
      expect(body).toContain('<button');
      expect(body).toContain('ant-back-top-css-var');
      expect(head).toContain('data-ant-svelte-theme="ant-svelte-back-top-');
      expect(head).toContain('@media (max-width:');
      expect(head).not.toContain('css-1y106cm');
      expect(body).not.toContain('[object Object]');
    });
  }
});
