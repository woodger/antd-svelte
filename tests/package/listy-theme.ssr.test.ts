import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-listy-theme-reference.json';
import ListyThemeCase from '../browser/fixtures/ListyThemeCase.svelte';

describe('Listy theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      delegatedPackages: { '@rc-component/listy': '1.2.3', '@rc-component/virtual-list': '1.5.1' }
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with raw/virtual rows and no browser effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(ListyThemeCase, { props: { sample } });

        expect(body).toContain('ant-listy-item');
        expect(body).toContain('ant-listy-holder-inner');
        expect(body).toContain('ant-listy-group-header-sticky');
        expect(body).toContain('Listy theme draft normal raw row-00');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('--ant-listy-item-padding-block');
        expect(body).not.toContain('ant-listy-group-header-fixed');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
