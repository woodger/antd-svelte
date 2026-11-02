import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Tabs, type TabsItem, type TabsProps, type TabsType } from 'antd-svelte';
import reference from '../browser/fixtures/ant-design-tabs-editable-metrics.json';

const fail = () => { throw new Error('browser only'); };

describe('Ant Design 6.6.8 official UMD editable Tabs SSR conformance', () => {
  it('uses the pinned artifact and audited rc-tabs version', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' }
    });
    expect(reference.cases).toHaveLength(25);
  });

  for (const sample of reference.cases) {
    it(`renders source add/remove visibility and icons for ${sample.name}`, () => {
      const { body } = render(Tabs, { props: {
        type: 'editable-card',
        activeKey: 'one',
        items: sample.empty ? [] : [{ key: 'one', label: 'Tab One', ...sample.item }],
        ...sample.props as Partial<TabsProps>,
        onEdit: fail,
        onTabClick: fail,
        onChange: fail
      } });

      expect(body.match(/class="ant-tabs-tab-remove\b/g) ?? [])
        .toHaveLength(sample.remove ? 1 : 0);
      expect(body.match(/class="ant-tabs-nav-add\b/g) ?? [])
        .toHaveLength(sample.add ? 1 : 0);
      for (const control of [sample.remove, sample.add]) {
        if (!control) continue;
        expect(body).toContain(`aria-label="${control.label}"`);
        for (const path of control.paths) expect(body).toContain(`d="${path}"`);
      }
      expect(body).not.toMatch(/<button\b[^>]*>(?:(?!<\/button>)[\s\S])*<button\b/);
    });
  }
});

describe('Editable Tabs native SSR', () => {
  it('renders sibling native controls without invoking callbacks or submitting forms', () => {
    const items: TabsItem[] = [
      { key: '', label: 'First' },
      { key: 'beta', label: 'Second' },
      { key: 'disabled', label: 'Disabled', disabled: true, closable: true },
      { key: 'fixed', label: 'Fixed', closable: false }
    ];
    const { body } = render(Tabs, { props: { items, type: 'editable-card', onEdit: fail } });

    expect(body.match(/role="tab"/g)).toHaveLength(4);
    expect(body.match(/class="ant-tabs-tab-remove\b/g)).toHaveLength(2);
    expect(body).toContain('ant-tabs-editable ant-tabs-editable-card');
    expect(body).toMatch(/role="tab"[^>]*data-tabs-key=""[^>]*tabindex="0"/);
    expect(body).toMatch(/class="ant-tabs-tab-remove(?: [^"]*)?"[^>]*data-tabs-key=""[^>]*tabindex="0"/);
    expect(body).toMatch(/class="ant-tabs-tab-remove(?: [^"]*)?"[^>]*data-tabs-key="beta"[^>]*tabindex="-1"/);
    expect(body).not.toContain('type="submit"');
  });

  it('renders passive custom icons and per-item precedence over removeIcon', () => {
    const icon = createRawSnippet(() => ({ render: () => '<strong>Custom icon</strong>' }));
    const { body } = render(Tabs, { props: {
      items: [{ key: 'a', label: 'A', closeIcon: 'Local icon' }],
      type: 'editable-card',
      addIcon: icon,
      removeIcon: 'Global icon'
    } });

    expect(body).toContain('<strong>Custom icon</strong>');
    expect(body).toContain('Local icon');
    expect(body).not.toContain('Global icon');
    expect(body).toMatch(/class="ant-tabs-nav-add"[^>]*aria-label="Add tab"/);
  });

  it.each(['line', 'card'] satisfies TabsType[])('keeps %s free of edit controls', type => {
    const { body } = render(Tabs, { props: {
      items: [{ key: 'a', label: 'A', closable: true }],
      type,
      onEdit: fail
    } });

    expect(body).not.toContain('class="ant-tabs-tab-remove');
    expect(body).not.toContain('class="ant-tabs-nav-add');
    expect(body).toContain('role="tab"');
  });
});
