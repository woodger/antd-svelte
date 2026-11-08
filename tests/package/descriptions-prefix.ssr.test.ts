import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Descriptions, type DescriptionsProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-descriptions-prefix-reference.json';
import DescriptionsPrefixSSRFixtures from '../browser/fixtures/DescriptionsPrefixSSRFixtures.svelte';

describe('Descriptions local and shared prefixes in the public package', () => {
  it('pins official source measurements, responsive columns and retained field identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(20);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRoot && step.sameCell
      && step.sameInput && step.focused)).toBe(true);
    const localTable = reference.cases.find(entry => entry.sample.id === 'table-local')!;

    expect(localTable.result.normal.view.display).toBe('block');
    expect('expectedNative' in localTable && localTable.expectedNative?.normal.view.display)
      .toBe('flex');
  });

  it('uses local cell classes and raw prefix in semantic callbacks', () => {
    const props: DescriptionsProps = {
      prefixCls: 'details',
      bordered: true,
      items: [{ key: 'name', label: 'Name', children: 'Draft' }],
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` }),
      styles: { root: 'font-size:22px' },
      style: 'font-size:24px'
    };
    const rendered = render(Descriptions, { props });

    expect(rendered.body).toContain('semantic-details');
    expect(rendered.body).toContain('details-item-label');
    expect(rendered.body).toContain('details-item-content');
    expect(rendered.body).toMatch(/font-size:22px;\s*font-size:24px/);
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('descriptions-prefix:details:ant');
  });

  it('inherits provider prefixes and renders cells without browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(DescriptionsPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-descriptions');
      expect(rendered.body).toContain('details-item-content');
      expect(rendered.body).toContain('inner-descriptions');
      expect(rendered.body).toContain('name="draft"');
      expect(rendered.body).not.toContain('>mounted<');
      expect(rendered.head).toContain('descriptions-prefix:suite-descriptions:suite');
      expect(rendered.head).toContain('descriptions-prefix:details:inner');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
