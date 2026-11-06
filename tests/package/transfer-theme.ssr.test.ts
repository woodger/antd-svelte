import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-transfer-theme-reference.json';
import TransferThemeCase from '../browser/fixtures/TransferThemeCase.svelte';

describe('Transfer theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native fields and no browser effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TransferThemeCase, { props: { sample } });

        expect(body).toContain('ant-transfer-css-var');
        expect(body).toContain('ant-pagination-css-var');
        expect(body).toContain('--ant-transfer-list-width');
        expect(body).toContain('--ant-transfer-transfer-header-vertical-padding');
        expect(body).toContain('type="checkbox"');
        expect(body).toContain('Alpha');
        expect(body).toContain('left footer');
        expect(body).toContain('right footer');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
