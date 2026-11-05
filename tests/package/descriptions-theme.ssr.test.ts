import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-descriptions-theme-reference.json';
import DescriptionsThemeCase from '../browser/fixtures/DescriptionsThemeCase.svelte';

describe('Descriptions component theme public package SSR', () => {
  it('pins the official source used for token and layout expectations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  it('renders the reported tokens on the root before hydration', () => {
    const sample = reference.cases.find(item => item.name === 'reported')!;

    const { body } = render(DescriptionsThemeCase, { props: { sample } });

    expect(body).toContain('--ant-descriptions-title-margin-bottom:32px');
    expect(body).toContain('--ant-descriptions-title-color:#722ed1');
    expect(body).toContain('--ant-descriptions-label-bg:#f6ffed');
    expect(body).toContain('--ant-descriptions-content-color:#873800');
    expect(body).toContain('<table>');
    expect(body).toContain('Descriptions theme draft');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without DOM, media subscriptions or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(DescriptionsThemeCase, { props: { sample } });

        expect(body).toContain('data-descriptions-theme="plain"');
        expect(body).toContain('data-descriptions-theme="vertical-bordered"');
        expect(body).toContain('data-descriptions-theme="outside"');
        expect(body).toContain('descriptions-title-margin-bottom:');
        expect(body).toContain('descriptions-colon-margin-left:');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
