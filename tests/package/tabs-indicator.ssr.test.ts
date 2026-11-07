import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Tabs, type TabsIndicatorSize, type TabsScrollInfo } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-indicator-metrics.json';

describe('Tabs indicator SSR', () => {
  it('pins the geometry reference to the audited official UMD and delegated implementation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' }
    });
  });

  it('keeps size callbacks and scroll events out of SSR', () => {
    const fail: TabsIndicatorSize = () => { throw new Error('Unexpected SSR size measurement'); };
    const scroll = (_info: TabsScrollInfo) => { throw new Error('Unexpected SSR scroll'); };
    const { body } = render(Tabs, { props: {
      id: 'indicator-ssr',
      items: [{ key: 'beta', label: 'Beta' }],
      indicator: { size: fail, align: 'end' },
      onTabScroll: scroll
    } });
    const ink = /<div[^>]*class="ant-tabs-ink-bar[^>]*>/.exec(body)![0];

    expect(ink).toContain('hidden');
    expect(ink).toContain('aria-hidden="true"');
    expect(ink).not.toContain('style=');
    expect(body).toContain('aria-selected="true"');
    expect(body).toContain('role="tabpanel"');
  });
});
