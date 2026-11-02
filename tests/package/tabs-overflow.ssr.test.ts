import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Tabs, type TabsContent, type TabsMoreProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-overflow-metrics.json';

const items = [{ key: '', label: 'Alpha' }, { key: 'beta', label: 'Beta' }];
const iconValues: Record<string, TabsContent | undefined> = {
  undefined,
  null: null,
  false: false,
  true: true,
  zero: 0,
  empty: '',
  text: 'More tabs'
};

describe('Ant Design 6.6.8 official UMD Tabs More SSR conformance', () => {
  it('pins the reference to the source archive and audited delegated behavior', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' },
      rcDropdown: { version: '1.0.3', revision: '1c37540097219029d7463e2cdcf7ef37e6b2d47f' }
    });
  });

  it.each(reference.cases.filter(item => item.iconKind || item.rootIcon))(
    'preserves source icon rendering for $name before measurement', sample => {
      const more: TabsMoreProps = {};
      if (sample.iconKind) more.icon = iconValues[sample.iconKind];
      const { body } = render(Tabs, { props: {
        id: 'overflow-ssr',
        items,
        more,
        moreIcon: sample.rootIcon ? 'ROOT' : undefined
      } });
      const control = /id="overflow-ssr-more"[^>]*>([\s\S]*?)<\/button>/.exec(body)![1];

      for (const path of sample.icon.paths) expect(control).toContain(path);
      if (sample.icon.text) expect(control).toContain(sample.icon.text);
      else expect(control.replace(/<[^>]+>/g, '').trim()).toBe('');
      expect(body).toContain('aria-haspopup="listbox"');
      expect(body).toContain('aria-controls="overflow-ssr-more-popup"');
      expect(body).toContain('ant-tabs-nav-operations-hidden');
    }
  );

  it('keeps popup content lazy and avoids callbacks or browser APIs during SSR', () => {
    const fail = () => { throw new Error('Unexpected SSR callback'); };
    const popupRender = createRawSnippet(() => ({ render: () => '<p>Popup content</p>' }));
    const { body } = render(Tabs, { props: {
      items,
      type: 'editable-card',
      more: { visible: true, popupRender, onVisibleChange: fail },
      getPopupContainer: fail,
      onTabClick: fail,
      onChange: fail,
      onEdit: fail
    } });

    expect(body).not.toContain('Popup content');
    expect(body).not.toContain('role="listbox"');
    expect(body).toContain('aria-haspopup="listbox"');
    expect(body).toContain('ant-tabs-nav-add');
    expect(body.match(/role="tab"/g)).toHaveLength(2);
  });
});
