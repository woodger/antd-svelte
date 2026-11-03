import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { getTabsItemId, Tabs } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-render-reference.json';
import TabsRenderCase from '../browser/fixtures/TabsRenderCase.svelte';
import type { TabsRenderCase as RenderCase } from '../browser/fixtures/tabs-render-presets';

describe('Tabs renderTabBar SSR', () => {
  it('pins tab bar props and rendering to the official UMD and rc-tabs source', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' }
    });
  });

  for (const sample of reference.cases) {
    it(`renders the custom header before hydration for ${sample.name}`, () => {
      const browserOnly = () => { throw new Error('Unexpected browser callback during SSR'); };
      const { body } = render(TabsRenderCase, { props: {
        sample: sample as RenderCase,
        onAttachment: browserOnly,
        onHeaderRef: browserOnly,
        onLifecycle: browserOnly
      } });
      const raw = body.match(/<output\b[^>]*data-tabs-render-props[^>]*>(.*?)<\/output>/s)![1];
      const props = JSON.parse(raw.replace(/<!--.*?-->/gs, '').replaceAll('&amp;', '&'));
      const { style: _style, styles: _styles, ...expected } = sample.initial.props;
      const { style: _rawStyle, styles: _rawStyles, ...actual } = props;

      expect(actual).toEqual(expected);
      expect(body.match(/<button\b[^>]*role="tab"[^>]*>/g) ?? [])
        .toHaveLength(sample.initial.tabs.length);
      expect(body.match(/<button\b[^>]*class="ant-tabs-tab-remove\b[^>]*>/g) ?? [])
        .toHaveLength(sample.initial.removeCount);
      expect(body.includes('name="alpha"'))
        .toBe(sample.initial.panes.some(pane => pane.name === 'alpha'));
      expect(body).not.toContain('name="beta"');
      expect(body).toContain('aria-label="Render Tabs trace">[]');
      expect(body).toContain('aria-label="Render Tabs native root">none');
      expect(body.includes('ant-tabs-body-animated')).toBe(sample.initial.bodyAnimated);
      if (sample.initial.header) expect(body).toContain('ant-tabs-nav');
      else expect(body).not.toContain('ant-tabs-nav');
    });
  }

  it('keeps panel semantics outside replacements passed to the default header', () => {
    const { body } = render(TabsRenderCase, { props: {
      sample: reference.cases
        .find(sample => sample.name === 'bar-body-styles-isolated')! as RenderCase
    } });
    const panel = body.match(/<div\b[^>]*role="tabpanel"[^>]*aria-hidden="false"[^>]*>/)![0];

    expect(body).toContain('o-header');
    expect(body).toContain('o-item');
    expect(panel).not.toContain('o-content');
    expect(panel).not.toContain('padding-top:33px');
    expect(body).not.toMatch(/class="ant-tabs-body[^>]*o-body/);
  });

  it.each(['', 'a/b', 'Ключ 🗝️'])('links custom native tabs and panels for key %j', key => {
    const tab = getTabsItemId('custom', key, 'tab');
    const panel = getTabsItemId('custom', key, 'panel');
    const { body } = render(Tabs, { props: {
      id: 'custom',
      items: [{ key, label: 'Special key' }],
      activeKey: key
    } });

    expect(tab).toMatch(/^custom-tab-[a-z0-9-]+$/);
    expect(panel).toBe(tab.replace('custom-tab-', 'custom-panel-'));
    expect(getTabsItemId('other', key, 'tab')).not.toBe(tab);
    expect(getTabsItemId('custom', key + 'x', 'tab')).not.toBe(tab);
    expect(body).toContain(`id="${tab}"`);
    expect(body).toContain(`aria-controls="${panel}"`);
    expect(body).toContain(`id="${panel}"`);
    expect(body).toContain(`aria-labelledby="${tab}"`);
  });
});
