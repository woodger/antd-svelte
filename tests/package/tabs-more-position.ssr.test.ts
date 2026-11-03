import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import {
  Tabs,
  type TabsMoreAlign,
  type TabsMoreOffset,
  type TabsMorePlacements
} from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-more-position-reference.json';
import TabsMorePositionCase from '../browser/fixtures/TabsMorePositionCase.svelte';
import type { TabsMorePositionCase as PositionCase } from '../browser/fixtures/tabs-more-position-presets';

describe('Tabs More source positioning SSR', () => {
  it('pins geometry to the official UMD and rc-trigger revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      rcTrigger: { version: '3.10.1', revision: '6e7b38514578d8c259eb42f2b79d69817c66b41e' }
    });
  });

  for (const sample of reference.cases) {
    it(`defers layout, arrow content and callbacks until hydration for ${sample.name}`, () => {
      const { body } = render(TabsMorePositionCase, { props: {
        sample: sample as PositionCase,
        onAlign: () => { throw new Error('Unexpected SSR alignment'); }
      } });

      expect(body).toContain('id="tabs-more-position-main"');
      expect(body).toContain('popover="manual"');
      expect(body).not.toContain('data-position-content');
      expect(body).not.toContain('class="ant-tabs-dropdown-arrow"');
      expect(body.includes('ant-tabs-dropdown-show-arrow')).toBe(sample.more?.arrow === true);
      expect(body).toContain('aria-label="Position callback count">0');
      expect(body).toContain('aria-label="Position callback node">none');
    });
  }

  it('accepts public readonly align and placement types without executing browser hooks', () => {
    const offset: TabsMoreOffset = '25%';
    const align: TabsMoreAlign = {
      points: ['br', 'tr'],
      offset: [offset, -3],
      targetOffset: ['50%', 0],
      dynamicInset: true,
      htmlRegion: 'visibleFirst',
      overflow: { shiftX: true }
    };
    const placements: TabsMorePlacements = { topRight: align };
    const fail = () => { throw new Error('Unexpected SSR layout'); };
    const { body } = render(Tabs, { props: {
      items: [],
      more: {
        arrow: true,
        visible: true,
        alignPoint: true,
        align,
        placements,
        builtinPlacements: placements,
        placement: 'topRight',
        onPopupAlign: fail,
        getPopupContainer: fail
      }
    } });

    expect(body).toContain('ant-tabs-dropdown-show-arrow');
    expect(body).toContain('ant-tabs-dropdown-placement-topRight');
    expect(body).not.toContain('class="ant-tabs-dropdown-arrow"');
  });
});
