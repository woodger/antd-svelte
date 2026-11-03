import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { Tabs, type TabsMoreProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-more-runtime-reference.json';
import TabsMoreRuntimeCase from '../browser/fixtures/TabsMoreRuntimeCase.svelte';
import type { TabsMoreRuntimeCase as RuntimeCase } from '../browser/fixtures/tabs-more-runtime-presets';

describe('Tabs More runtime SSR', () => {
  it('pins popup lifecycle and actions to the official UMD and audited dependencies', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' },
      rcDropdown: { version: '1.0.3', revision: '1c37540097219029d7463e2cdcf7ef37e6b2d47f' },
      rcTrigger: { version: '3.10.1', revision: '6e7b38514578d8c259eb42f2b79d69817c66b41e' }
    });
  });

  for (const sample of reference.cases) {
    it(`defers popup content and browser lifecycle for ${sample.name}`, () => {
      const { body } = render(TabsMoreRuntimeCase, { props: { sample: sample as RuntimeCase } });

      expect(body).toContain('id="tabs-more-runtime-main-more"');
      expect(body).toContain('aria-expanded="false"');
      expect(body).not.toContain('aria-label="Raw More draft"');
      expect(body).not.toContain('role="listbox"');
      expect(body.includes('popover="manual"')).toBe(sample.more?.autoDestroy !== true);
      expect(body).toContain('aria-label="Runtime More lifecycle">[]');
      expect(body).toContain('aria-label="Runtime More events">[]');
    });
  }

  it.each([false, true])(
    'does not invoke a controlled visible overlay during SSR with autoDestroy=%s',
    autoDestroy => {
      const overlay = createRawSnippet(() => { throw new Error('Unexpected SSR overlay'); });
      const more: TabsMoreProps = {
        overlay,
        autoDestroy,
        visible: true,
        trigger: [],
        showAction: ['focus'],
        hideAction: ['click'],
        openClassName: 'owner-open',
        transitionName: 'custom-more',
        animation: 'runtime',
        onVisibleChange: () => { throw new Error('Unexpected SSR callback'); }
      };
      const { body } = render(Tabs, { props: { items: [], more } });

      expect(body).toContain('ant-tabs-nav-more owner-open');
      expect(body).toContain('aria-expanded="false"');
      expect(body.includes('popover="manual"')).toBe(!autoDestroy);
      expect(body).not.toContain('custom-more-appear');
    }
  );
});
