import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, type TabsProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-prefix-reference.json';
import TabsPrefixSSRFixtures from '../browser/fixtures/TabsPrefixSSRFixtures.svelte';

describe('Tabs local and shared prefixes in the public package', () => {
  it('pins official source measurements and retained panel and popup identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(18);
    expect(reference.transitions.every(step => step.sameRoot && step.samePanel
      && step.sameInput && step.focused)).toBe(true);
    expect(reference.popupTransitions.every(step => step.samePopup && step.sameMenu
      && step.sameInput && step.focused)).toBe(true);
  });

  it('renders local states and raw semantic prefix with stable owner and panel identifiers', () => {
    const props: TabsProps = {
      id: 'tabs-prefix-server',
      prefixCls: 'work-tabs',
      type: 'editable-card',
      items: [{ key: 'a', label: 'Alpha' }],
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    };
    const rendered = render(Tabs, { props });

    expect(rendered.body).toContain('work-tabs-editable-card');
    expect(rendered.body).toContain('work-tabs-nav-add');
    expect(rendered.body).toContain('work-tabs-content-active');
    expect(rendered.body).toContain('semantic-work-tabs');
    expect(rendered.body).toContain('tabs-prefix-server-panel-61');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('tabs-prefix:work-tabs:ant');
  });

  it('inherits prefixes in SSR without DOM, popup content or browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(TabsPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-tabs');
      expect(rendered.body).toContain('work-tabs-tab-remove');
      expect(rendered.body).toContain('inner-tabs');
      expect(rendered.body).not.toContain('normal tabs popup draft');
      expect(rendered.head).toContain('tabs-prefix:suite-tabs:suite');
      expect(rendered.head).toContain('tabs-prefix:work-tabs:inner');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
