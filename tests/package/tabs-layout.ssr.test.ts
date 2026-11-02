import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { Tabs } from 'antd-svelte';
import reference from '../browser/fixtures/ant-design-tabs-layout-metrics.json';
import registry from 'antd-svelte/porting/registry.json';

const items = [
  { key: '', label: 'Alpha' },
  { key: 'locked', label: 'Locked', disabled: true },
  { key: 'beta', label: 'Beta' }
];

describe('Tabs layout SSR', () => {
  it('pins the official UMD layout reference to the audited source and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' }
    });
  });

  it('keeps default layout and separates header styles from root styles', () => {
    const { body } = render(Tabs, { props: {
      items,
      style: 'height:320px;color:red',
      tabBarStyle: 'background:blue;padding:4px'
    } });

    expect(body).not.toContain('ant-tabs-centered');
    expect(body).toMatch(/class="ant-tabs ant-tabs-css-var[^>]+style="height:320px;color:red"/);
    expect(body).toMatch(/class="ant-tabs-nav[^>]+style="background:blue;padding:4px"/);
    expect(body).not.toContain('margin-inline-start:');
    expect(body).not.toContain('margin-top:');
  });

  it.each(['top', 'bottom', 'start', 'end'] as const)(
    'renders zero gutters and centered layout before hydration at %s', tabPlacement => {
      const { body } = render(Tabs, { props: {
        items,
        type: 'editable-card',
        centered: true,
        tabPlacement,
        tabBarGutter: 0
      } });
      const margin = tabPlacement === 'top' || tabPlacement === 'bottom'
        ? 'margin-inline-start' : 'margin-top';

      expect(body).toContain('ant-tabs-centered');
      expect(body.match(new RegExp(`${margin}:0px`, 'g'))).toHaveLength(3);
      expect(body).toMatch(/data-tabs-cell="" class=/);
      expect(body).not.toMatch(/data-tabs-cell="" style=/);
      expect(body).toMatch(/aria-selected="true"[^>]*tabindex="0"/);
    }
  );

  it('keeps fractional and negative gaps while leaving the first and empty add button unspaced', () => {
    const fractional = render(Tabs, { props: { items, tabBarGutter: 12.5 } }).body;
    const negative = render(Tabs, { props: { items, tabBarGutter: -3 } }).body;
    const empty = render(Tabs, { props: {
      items: [],
      type: 'editable-card',
      tabBarGutter: 20,
      centered: true
    } }).body;

    expect(fractional.match(/margin-inline-start:12\.5px/g)).toHaveLength(2);
    expect(negative.match(/margin-inline-start:-3px/g)).toHaveLength(2);
    expect(empty).toContain('ant-tabs-nav-add');
    expect(empty).not.toContain('margin-inline-start:');
  });
});
